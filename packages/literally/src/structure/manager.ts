/** Managed items can use an initiator to lazily create the manged item. */
export type ManagedInitiator = () => ManagedInfo;

/** Managed items do not have a specific interface yet. */
export interface ManagedInfo {}

export interface ManagerInfo {
  // Add a item directly without lazyily creating it.
  add(key: string, item: ManagedInfo): void;
  // Retrieve the item.
  get(key: string): ManagedInfo | undefined;
  // Has the item been registered?
  has(key: string): boolean;
  // Allows for registering a item that gets lazy created as a singleton.
  register(key: string, lazyConstructor: ManagedInitiator): void;
  // Removes a item and any initiator.
  remove(key: string): void;
}

export class Manager implements ManagerInfo {
  private items: Record<string, ManagedInfo> = {};
  private initiators: Record<string, ManagedInitiator> = {};

  // Add an item without lazy constructing.
  add(key: string, itemInfo: ManagedInfo): void {
    this.items[key] = itemInfo;
  }

  // Retrieve a item if it exists.
  get(key: string): ManagedInfo | undefined {
    if (!this.items[key] && this.initiators[key]) {
      this.items[key] = this.initiators[key]();
    }

    if (!this.items[key]) {
      throw new Error(` ${key} not found`);
    }

    return this.items[key];
  }

  /**
   * Is there a item initiator already provided?
   */
  hasInitiator(key: string): boolean {
    return !!this.initiators[key];
  }

  /**
   * Is there an item already created?
   */
  has(key: string): boolean {
    return !!this.items[key];
  }

  /**
   * Register an item using a lazy initiator.
   */
  register(key: string, lazyConstructor: ManagedInitiator): void {
    this.initiators[key] = lazyConstructor;
  }

  /**
   * Remove a item from the manager.
   */
  remove(key: string): void {
    delete this.items[key];
    delete this.initiators[key];
  }
}
