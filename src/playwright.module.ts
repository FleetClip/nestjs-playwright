import { Module, DynamicModule } from '@nestjs/common';
import { createPlaywrightProviders } from './playwright.providers';
import { PlaywrightCoreModule } from './playwright-core.module';
import type {
  PlaywrightModuleAsyncOptions,
  PlaywrightModuleOptions,
} from './interfaces/playwright-options.interface';

/**
 * Module for the Playwright
 */
@Module({})
export class PlaywrightModule {
  /**
   * Inject the Playwright synchronously.
   * @param options Options for the Browser to be launched
   * @param instanceName A unique name for the connection.  If not specified, a default name
   * will be used.
   */
  static forRoot(
    options?: PlaywrightModuleOptions['launchOptions'] & { isGlobal?: boolean },
    instanceName?: string,
  ): DynamicModule {
    return {
      module: PlaywrightModule,
      global: options?.isGlobal,
      imports: [PlaywrightCoreModule.forRoot(options, instanceName)],
    };
  }

  /**
   * Inject the Playwright asynchronously, allowing any dependencies such as a configuration
   * service to be injected first.
   * @param options Options for asynchronous injection
   */
  static forRootAsync(options: PlaywrightModuleAsyncOptions): DynamicModule {
    return {
      module: PlaywrightModule,
      global: options.isGlobal,
      imports: [PlaywrightCoreModule.forRootAsync(options)],
    };
  }

  /**
   * Inject Pages.
   * @param pages An array of the names of the pages to be injected.
   * @param instanceName A unique name for the connection. If not specified, a default name
   * will be used.
   */
  static forFeature(
    pages: string[] = [],
    instanceName?: string,
  ): DynamicModule {
    const providers = createPlaywrightProviders(instanceName, pages);
    return {
      module: PlaywrightModule,
      providers,
      exports: providers,
    };
  }
}
