import { Injectable, Type } from '@nestjs/common';

@Injectable()
export class ModuleRegistryService {
  private registry: Map<string, Type<any>> = new Map();

  register(moduleName: string, service: Type<any>) {
    this.registry.set(moduleName, service);
  }

  getService(moduleName: string): Type<any> | undefined {
    return this.registry.get(moduleName);
  }

  getAllModules(): string[] {
    return Array.from(this.registry.keys());
  }
}