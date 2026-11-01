import { ContextProvider } from '@lit/context';
import { LitElement, html } from 'lit';
// @vitest-environment jsdom
import crypto from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';

import {
  ErFeatureFlag,
  FeatureFlagController,
  FeatureFlagManager,
  InMemoryFeatureFlagAdapter,
  computeRolloutHash,
  evaluateAllFlags,
  evaluateSingleFlag,
  featureFlagContext,
  formatScopedFlagKey,
  isWithinRolloutPercentage,
  parseScopedFlagKey,
  resolveEffectiveFlagState,
  sha256FirstUInt32BE,
} from './index';

describe('Rollout Hashing (SHA-256 sync)', () => {
  it('matches Node crypto SHA-256 first 32-bit big-endian integer across arbitrary strings', () => {
    const samples = [
      '',
      'student@wilderland.academy:classroom_freeze',
      'pilot@wilderland.academy:debug_diagnostics',
      'a'.repeat(55), // boundary near 56 bytes padding
      'b'.repeat(56),
      'c'.repeat(64),
      'd'.repeat(128),
      'unicode-test-🚀-star-camp:feature_1',
    ];

    for (const input of samples) {
      const nodeVal = crypto
        .createHash('sha256')
        .update(input)
        .digest()
        .readUInt32BE(0);
      expect(sha256FirstUInt32BE(input)).toBe(nodeVal);
      expect(computeRolloutHash(input)).toBe(nodeVal % 100);
    }
  });

  it('salts identifier with flagKey when provided', () => {
    const combined = computeRolloutHash(
      'student@wilderland.academy:classroom_freeze',
    );
    const salted = computeRolloutHash(
      'student@wilderland.academy',
      'classroom_freeze',
    );
    expect(salted).toBe(combined);
  });

  it('evaluates isWithinRolloutPercentage boundaries accurately', () => {
    expect(isWithinRolloutPercentage('user@example.com', 'flag_a', 0)).toBe(
      false,
    );
    expect(isWithinRolloutPercentage('user@example.com', 'flag_a', -10)).toBe(
      false,
    );
    expect(isWithinRolloutPercentage('user@example.com', 'flag_a', 100)).toBe(
      true,
    );
    expect(isWithinRolloutPercentage('', 'flag_a', 50)).toBe(false);

    const hashBucket = computeRolloutHash('user@example.com', 'flag_a');
    expect(
      isWithinRolloutPercentage('USER@example.com ', 'flag_a', hashBucket + 1),
    ).toBe(true);
    expect(
      isWithinRolloutPercentage('USER@example.com ', 'flag_a', hashBucket),
    ).toBe(false);
  });
});

describe('Feature Flag Evaluator & Precedence', () => {
  it('formats and parses scoped storage keys', () => {
    expect(formatScopedFlagKey('classroom_freeze')).toBe('classroom_freeze');
    expect(formatScopedFlagKey('classroom_freeze', 'global')).toBe(
      'classroom_freeze',
    );
    expect(formatScopedFlagKey('classroom_freeze', 'wilderland')).toBe(
      'wilderland__classroom_freeze',
    );

    expect(parseScopedFlagKey('classroom_freeze')).toEqual({
      scope: null,
      flagId: 'classroom_freeze',
    });
    expect(parseScopedFlagKey('wilderland__classroom_freeze')).toEqual({
      scope: 'wilderland',
      flagId: 'classroom_freeze',
    });
  });

  it('evaluates targetIds, targetScopes, and targetAttributes', () => {
    const rules = {
      pilot_feature: {
        enabled: false,
        targetIds: ['pilot@wilderland.academy'],
        targetScopes: ['oakgrove'],
        targetAttributes: {
          bucket: ['high_school'],
          cohort: ['class_2026'],
        },
      },
    };

    // Match by ID (case-insensitive)
    expect(
      evaluateSingleFlag('pilot_feature', rules, {
        id: 'PILOT@wilderland.academy',
        scope: 'wilderland',
      }),
    ).toBe(true);

    // Match by scope
    expect(
      evaluateSingleFlag('pilot_feature', rules, {
        id: 'anyone@oakgrove.edu',
        scope: 'oakgrove',
      }),
    ).toBe(true);

    // Match by scalar attribute
    expect(
      evaluateSingleFlag('pilot_feature', rules, {
        id: 'student@wilderland.academy',
        scope: 'wilderland',
        attributes: { bucket: 'high_school', cohort: 'class_2027' },
      }),
    ).toBe(true);

    // Match by array attribute
    expect(
      evaluateSingleFlag('pilot_feature', rules, {
        id: 'student@wilderland.academy',
        scope: 'wilderland',
        attributes: { cohort: ['class_2025', 'class_2026'] },
      }),
    ).toBe(true);

    // Non-matching context
    expect(
      evaluateSingleFlag('pilot_feature', rules, {
        id: 'other@wilderland.academy',
        scope: 'wilderland',
        attributes: { bucket: 'elementary', cohort: 'class_2027' },
      }),
    ).toBe(false);
  });

  it('enforces global launch trumping scoped overrides while allowing scoped launch before global launch', () => {
    // Phase 1: Global disabled, pilot_tenant override enabled, standard_tenant override disabled
    const rulesPhase1 = {
      relaxed_mode: { enabled: false },
      pilot_tenant__relaxed_mode: { enabled: true },
      standard_tenant__relaxed_mode: { enabled: false },
    };

    expect(
      evaluateSingleFlag('relaxed_mode', rulesPhase1, {
        id: 'u@pilot.org',
        scope: 'pilot_tenant',
      }),
    ).toBe(true);
    expect(
      evaluateSingleFlag('relaxed_mode', rulesPhase1, {
        id: 'u@standard.org',
        scope: 'standard_tenant',
      }),
    ).toBe(false);

    // Phase 2: Global enabled -> trumps standard_tenant's disabled override
    const rulesPhase2 = {
      ...rulesPhase1,
      relaxed_mode: { enabled: true },
    };

    expect(
      evaluateSingleFlag('relaxed_mode', rulesPhase2, {
        id: 'u@standard.org',
        scope: 'standard_tenant',
      }),
    ).toBe(true);

    const effective = resolveEffectiveFlagState(
      'relaxed_mode',
      rulesPhase2,
      'standard_tenant',
    );
    expect(effective.rule.enabled).toBe(true);
    expect(effective.isGloballyTrumped).toBe(true);
    expect(effective.isScopedOverride).toBe(true);
    expect(effective.storageKey).toBe('standard_tenant__relaxed_mode');
  });

  it('evaluates all flags combining definitions, defaults, and dynamic rules', () => {
    const result = evaluateAllFlags(
      {
        dynamic_flag: { enabled: true },
      },
      { id: 'user@test.com' },
      {
        definitions: [
          { id: 'def_off', name: 'Default Off' },
          { id: 'def_on', name: 'Default On', defaultEnabled: true },
        ],
      },
    );

    expect(result).toEqual({
      def_off: false,
      def_on: true,
      dynamic_flag: true,
    });
  });
});

describe('FeatureFlagManager & Lit Integration', () => {
  it('loads, updates, and notifies listeners via InMemoryFeatureFlagAdapter', async () => {
    const adapter = new InMemoryFeatureFlagAdapter({
      flag_a: { enabled: false, targetIds: ['alice@example.com'] },
    });

    const manager = new FeatureFlagManager({
      adapter,
      context: { id: 'bob@example.com', scope: 'acme' },
    });

    const stop = manager.startListening();
    expect(manager.loaded).toBe(true);
    expect(manager.isEnabled('flag_a')).toBe(false);

    // Switch context to alice
    manager.updateContext({ id: 'alice@example.com' });
    expect(manager.isEnabled('flag_a')).toBe(true);

    // Prevent scoped toggle when globally trumped
    await manager.setFlagRule('flag_a', { enabled: true }, { scope: 'global' });
    const didWrite = await manager.setFlagRule(
      'flag_a',
      { enabled: false },
      { scope: 'acme', preventWhenGloballyTrumped: true },
    );
    expect(didWrite).toBe(false);

    stop();
  });

  it('updates host via FeatureFlagController and renders <er-feature-flag>', async () => {
    // Ensure custom element is registered
    expect(customElements.get('er-feature-flag')).toBe(ErFeatureFlag);

    const adapter = new InMemoryFeatureFlagAdapter({
      new_dashboard: { enabled: false },
    });
    const manager = new FeatureFlagManager({ adapter });
    manager.startListening();

    class TestHostElement extends LitElement {
      provider = new ContextProvider(this, {
        context: featureFlagContext,
        initialValue: manager,
      });

      flags = new FeatureFlagController(this, {
        manager: () => manager,
      });

      override render() {
        return html`
          <div class="ctrlStatus">
            ${this.flags.isEnabled('new_dashboard') ? 'ON' : 'OFF'}
          </div>
          <er-feature-flag flag="new_dashboard">
            <span class="enabledContent">New Dashboard</span>
            <span slot="fallback" class="fallbackContent"
              >Legacy Dashboard</span
            >
          </er-feature-flag>
        `;
      }
    }
    customElements.define('test-ff-host-element', TestHostElement);

    const el = document.createElement(
      'test-ff-host-element',
    ) as TestHostElement;
    document.body.appendChild(el);
    await el.updateComplete;

    const ctrlStatus = el.shadowRoot!.querySelector('.ctrlStatus')!;
    const gate = el.shadowRoot!.querySelector(
      'er-feature-flag',
    ) as ErFeatureFlag;
    await gate.updateComplete;

    expect(ctrlStatus.textContent?.trim()).toBe('OFF');
    expect(gate.shadowRoot!.querySelector('slot:not([name])')).toBeNull();
    expect(
      gate.shadowRoot!.querySelector('slot[name="fallback"]'),
    ).not.toBeNull();

    // Enable the flag and verify both controller and <er-feature-flag> update reactively
    const spy = vi.spyOn(el, 'requestUpdate');
    await manager.setFlagRule('new_dashboard', { enabled: true });
    await el.updateComplete;
    await gate.updateComplete;

    expect(spy).toHaveBeenCalled();
    expect(ctrlStatus.textContent?.trim()).toBe('ON');
    expect(gate.shadowRoot!.querySelector('slot:not([name])')).not.toBeNull();

    el.remove();
  });
});
