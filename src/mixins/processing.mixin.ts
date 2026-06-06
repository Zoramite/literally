import { LitElement } from 'lit';

import { type Constructor } from './mixin';

const DEFAULT_KEY = '_default_';

type ProcessingFunction = () => void;
type ProcessingAsyncFunction = () => Promise<void>;

interface ProcessingInterface {
  isProcessing(key?: string): boolean;
  startProcessing(key?: string): void;
  stopProcessing(key?: string): void;
  wrapProcessing(processFn: ProcessingFunction, key?: string): void;
  wrapAsyncProcessing(
    processFn: ProcessingAsyncFunction,
    key?: string,
  ): Promise<void>;
}

/**
 * Mixin for being able to start and stop processing flags as an element state.
 */
export const ProcessingMixin = <T extends Constructor<LitElement>>(
  superClass: T,
) => {
  class ProcessingElement extends superClass {
    static styles = [(superClass as unknown as typeof LitElement).styles ?? []];

    private processingInfo: Record<string, boolean> = {};

    isProcessing(key = DEFAULT_KEY): boolean {
      return this.processingInfo[key] === true;
    }

    startProcessing(key = DEFAULT_KEY) {
      this.processingInfo[key] = true;
      this.requestUpdate();
    }

    stopProcessing(key = DEFAULT_KEY) {
      this.processingInfo[key] = false;
      this.requestUpdate();
    }

    wrapProcessing(processFn: ProcessingFunction, key = DEFAULT_KEY) {
      try {
        this.startProcessing(key);
        processFn();
      } finally {
        this.stopProcessing(key);
      }
    }

    async wrapAsyncProcessing(
      processFn: ProcessingAsyncFunction,
      key = DEFAULT_KEY,
    ): Promise<void> {
      try {
        this.startProcessing(key);
        await processFn();
      } finally {
        this.stopProcessing(key);
      }
    }
  }
  return ProcessingElement as Constructor<ProcessingInterface> & T;
};
