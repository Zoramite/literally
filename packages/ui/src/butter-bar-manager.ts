import type { ButterBarType } from './er-butter-bar';

export interface ButterBarNotification {
  id: string;
  type: ButterBarType;
  message: string;
  detail?: string;
  dismissible: boolean;
  autoDismissMs: number;
}

export interface ButterBarNotificationInput {
  id?: string;
  type?: ButterBarType;
  message: string;
  detail?: string;
  dismissible?: boolean;
  autoDismissMs?: number;
}

export interface TrackButterBarOptions<T> {
  id?: string;
  pendingMessage: string;
  pendingDetail?: string;
  successMessage?: string | ((result: T) => string);
  successDetail?: string | ((result: T) => string);
  errorMessage?: string | ((err: unknown) => string);
  errorDetail?: string | ((err: unknown) => string);
  autoDismissMs?: number;
}

export type ButterBarListener = (
  notifications: ButterBarNotification[],
) => void;

function resolveText<T>(
  value: string | ((arg: T) => string) | undefined,
  arg: T,
): string | undefined {
  if (typeof value === 'function') {
    return value(arg);
  }
  return value;
}

/**
 * Application-level manager for queuing, updating, and tracking async
 * butter bar notifications.
 */
export class ButterBarManager {
  private nextSeq = 1;
  private notifications: ButterBarNotification[] = [];
  private listeners = new Set<ButterBarListener>();

  getNotifications(): ButterBarNotification[] {
    return [...this.notifications];
  }

  subscribe(listener: ButterBarListener): () => void {
    this.listeners.add(listener);
    listener(this.getNotifications());
    return () => {
      this.listeners.delete(listener);
    };
  }

  show(input: ButterBarNotificationInput): string {
    const id = input.id ?? `er-butter-bar-${this.nextSeq++}`;
    const type: ButterBarType = input.type ?? 'info';
    const nextItem: ButterBarNotification = {
      id,
      type,
      message: input.message,
      detail: input.detail,
      dismissible: input.dismissible ?? type !== 'progress',
      autoDismissMs: input.autoDismissMs ?? (type === 'progress' ? 0 : 4500),
    };

    const existingIndex = this.notifications.findIndex(
      (item) => item.id === id,
    );
    if (existingIndex >= 0) {
      this.notifications = [
        ...this.notifications.slice(0, existingIndex),
        nextItem,
        ...this.notifications.slice(existingIndex + 1),
      ];
    } else {
      this.notifications = [...this.notifications, nextItem];
    }

    this.emit();
    return id;
  }

  update(
    id: string,
    patch: Partial<Omit<ButterBarNotificationInput, 'id'>>,
  ): void {
    const existingIndex = this.notifications.findIndex(
      (item) => item.id === id,
    );
    if (existingIndex < 0) return;

    const current = this.notifications[existingIndex];
    const nextType = patch.type ?? current.type;
    const updated: ButterBarNotification = {
      ...current,
      ...patch,
      type: nextType,
      dismissible: patch.dismissible ?? nextType !== 'progress',
      autoDismissMs:
        patch.autoDismissMs ??
        (nextType === 'progress' ? 0 : current.autoDismissMs || 4500),
    };

    this.notifications = [
      ...this.notifications.slice(0, existingIndex),
      updated,
      ...this.notifications.slice(existingIndex + 1),
    ];
    this.emit();
  }

  dismiss(id: string): void {
    const next = this.notifications.filter((item) => item.id !== id);
    if (next.length === this.notifications.length) return;
    this.notifications = next;
    this.emit();
  }

  clear(): void {
    if (this.notifications.length === 0) return;
    this.notifications = [];
    this.emit();
  }

  /**
   * Displays a persistent `progress` butter bar while `task()` is in flight,
   * then transitions it to `success` (or dismisses if no `successMessage`) or `error`.
   */
  async track<T>(
    options: TrackButterBarOptions<T>,
    task: () => Promise<T>,
  ): Promise<T> {
    const id = this.show({
      id: options.id,
      type: 'progress',
      message: options.pendingMessage,
      detail: options.pendingDetail,
      dismissible: false,
      autoDismissMs: 0,
    });

    try {
      const result = await task();
      const successMessage = resolveText(options.successMessage, result);
      if (successMessage) {
        this.update(id, {
          type: 'success',
          message: successMessage,
          detail: resolveText(options.successDetail, result),
          dismissible: true,
          autoDismissMs: options.autoDismissMs ?? 4500,
        });
      } else {
        this.dismiss(id);
      }
      return result;
    } catch (err) {
      const fallbackError = err instanceof Error ? err.message : String(err);
      this.update(id, {
        type: 'error',
        message: resolveText(options.errorMessage, err) ?? 'Operation failed',
        detail: resolveText(options.errorDetail, err) ?? fallbackError,
        dismissible: true,
        autoDismissMs: 0,
      });
      throw err;
    }
  }

  private emit(): void {
    const snapshot = this.getNotifications();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}

/** Default shared `ButterBarManager` singleton for app-level notifications. */
export const butterBarManager = new ButterBarManager();
