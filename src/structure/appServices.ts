export type AppInitiator = () => AppServiceInfo;

export interface AppServiceInfo {}

export interface AppServicesInfo {
  // Add a service directly without lazyily creating it.
  addService(service: string, serviceInfo: AppServiceInfo): void;
  // Retrieve the service.
  getService(service: string): AppServiceInfo | undefined;
  // Has the service been registered?
  hasService(service: string): boolean;
  // Allows for registering a service that gets lazy created as a singleton.
  registerService(service: string, lazyConstructor: AppInitiator): void;
  // Removes a service.
  removeService(service: string): void;
}

export class AppServices implements AppServicesInfo {
  private services: Record<string, AppServiceInfo> = {};
  private initiators: Record<string, AppInitiator> = {};

  // Add a service without lazy constructing.
  addService(service: string, serviceInfo: AppServiceInfo): void {
    this.services[service] = serviceInfo;
  }

  // Retrieve a service if it exists.
  getService(service: string): AppServiceInfo | undefined {
    if (!this.services[service] && this.initiators[service]) {
      this.services[service] = this.initiators[service]();
    }

    if (!this.services[service]) {
      throw new Error(`Service ${service} not found`);
    }

    return this.services[service];
  }

  /**
   * Is there a service initiator already provided?
   */
  hasInitiator(service: string): boolean {
    return !!this.initiators[service];
  }

  /**
   * Is there a service already created?
   */
  hasService(service: string): boolean {
    return !!this.services[service];
  }

  /**
   * Register a service using a lazy initiator.
   */
  registerService(service: string, lazyConstructor: AppInitiator): void {
    this.initiators[service] = lazyConstructor;
  }

  /**
   * Remove a service from the service manager.
   */
  removeService(service: string): void {
    delete this.services[service];
    delete this.initiators[service];
  }
}
