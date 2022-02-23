import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import type { LaunchOptions } from 'playwright';

/**
 * Options that ultimately need to be provided to create a Playwright instance
 */
export interface PlaywrightModuleOptions {
  instanceName?: string;
  launchOptions?: LaunchOptions;
}

export interface PlaywrightOptionsFactory {
  createPlaywrightOptions():
    | Promise<PlaywrightModuleOptions>
    | PlaywrightModuleOptions;
}

/**
 * Options available when creating the module asynchronously.  You should use only one of the
 * useExisting, useClass, or useFactory options for creation.
 */
export interface PlaywrightModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  /** A unique name for the instance.  If not specified, a default one will be used. */
  instanceName?: string;

  /**
   * If "true", registers `PlaywrightModule` as a global module.
   * See: https://docs.nestjs.com/modules#global-modules
   */
  isGlobal?: boolean;

  /** Reuse an injectable factory class created in another module. */
  useExisting?: Type<PlaywrightOptionsFactory>;

  /**
   * Use an injectable factory class to populate the module options, such as URI and database name.
   */
  useClass?: Type<PlaywrightOptionsFactory>;

  /**
   * A factory function that will populate the module options, such as URI and database name.
   */
  useFactory?: (
    ...args: any[]
  ) => Promise<PlaywrightModuleOptions> | PlaywrightModuleOptions;

  /**
   * Inject any dependencies required by the Playwright module, such as a configuration service
   * that supplies the options and instance name
   */
  inject?: any[];
}
