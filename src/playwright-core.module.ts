import {
  Module,
  Inject,
  Global,
  DynamicModule,
  Provider,
  OnApplicationShutdown,
  OnModuleDestroy,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import type { LaunchOptions, Browser, BrowserContext } from 'playwright';
import { chromium } from 'playwright';

import {
  PLAYWRIGHT_INSTANCE_NAME,
  DEFAULT_PLAYWRIGHT_INSTANCE_NAME,
  DEFAULT_CHROME_LAUNCH_OPTIONS,
  PLAYWRIGHT_MODULE_OPTIONS,
} from './playwright.constants';
import type {
  PlaywrightModuleAsyncOptions,
  PlaywrightOptionsFactory,
  PlaywrightModuleOptions,
} from './interfaces/playwright-options.interface';
import {
  getBrowserToken,
  getContextToken,
  getPageToken,
} from './playwright.util';

@Global()
@Module({})
export class PlaywrightCoreModule
  implements OnApplicationShutdown, OnModuleDestroy {
  constructor(
    @Inject(PLAYWRIGHT_INSTANCE_NAME) private readonly instanceName: string,
    private readonly moduleRef: ModuleRef,
  ) {}
  onApplicationShutdown() {
    return this.onModuleDestroy();
  }

  static forRoot(
    launchOptions: LaunchOptions = DEFAULT_CHROME_LAUNCH_OPTIONS,
    instanceName: string = DEFAULT_PLAYWRIGHT_INSTANCE_NAME,
  ): DynamicModule {
    const instanceNameProvider = {
      provide: PLAYWRIGHT_INSTANCE_NAME,
      useValue: instanceName,
    };

    const browserProvider = {
      provide: getBrowserToken(instanceName),
      async useFactory() {
        return await chromium.launch(launchOptions);
      },
    };

    const contextProvider = {
      provide: getContextToken(instanceName),
      async useFactory(browser: Browser) {
        return browser.newContext();
      },
      inject: [getBrowserToken(instanceName)],
    };

    const pageProvider = {
      provide: getPageToken(instanceName),
      async useFactory(context: BrowserContext) {
        return await context.newPage();
      },
      inject: [getContextToken(instanceName)],
    };

    return {
      module: PlaywrightCoreModule,
      providers: [
        instanceNameProvider,
        browserProvider,
        contextProvider,
        pageProvider,
      ],
      exports: [browserProvider, contextProvider, pageProvider],
    };
  }

  static forRootAsync(options: PlaywrightModuleAsyncOptions): DynamicModule {
    const playwrightInstanceName =
      options.instanceName ?? DEFAULT_PLAYWRIGHT_INSTANCE_NAME;

    const instanceNameProvider = {
      provide: PLAYWRIGHT_INSTANCE_NAME,
      useValue: playwrightInstanceName,
    };

    const browserProvider = {
      provide: getBrowserToken(playwrightInstanceName),
      async useFactory(playwrightModuleOptions: PlaywrightModuleOptions) {
        return await chromium.launch(
          playwrightModuleOptions.launchOptions ?? DEFAULT_CHROME_LAUNCH_OPTIONS,
        );
      },
      inject: [PLAYWRIGHT_MODULE_OPTIONS],
    };

    const contextProvider = {
      provide: getContextToken(playwrightInstanceName),
      async useFactory(browser: Browser) {
        return await browser.newContext();
      },
      inject: [
        PLAYWRIGHT_MODULE_OPTIONS,
        getBrowserToken(playwrightInstanceName),
      ],
    };

    const pageProvider = {
      provide: getPageToken(playwrightInstanceName),
      async useFactory(context: BrowserContext) {
        return await context.newPage();
      },
      inject: [
        PLAYWRIGHT_MODULE_OPTIONS,
        getContextToken(playwrightInstanceName),
      ],
    };

    const asyncProviders = this.createAsyncProviders(options);

    return {
      module: PlaywrightCoreModule,
      imports: options.imports,
      providers: [
        ...asyncProviders,
        browserProvider,
        contextProvider,
        pageProvider,
        instanceNameProvider,
      ],
      exports: [browserProvider, contextProvider, pageProvider],
    };
  }

  async onModuleDestroy() {
    const browser: Browser = this.moduleRef.get(
      getBrowserToken(this.instanceName),
    );

    if (browser?.isConnected()) await browser.close();
  }

  private static createAsyncProviders(
    options: PlaywrightModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    } else if (options.useClass) {
      return [
        this.createAsyncOptionsProvider(options),
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
      ];
    } else {
      return [];
    }
  }

  private static createAsyncOptionsProvider(
    options: PlaywrightModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: PLAYWRIGHT_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      };
    } else if (options.useExisting) {
      return {
        provide: PLAYWRIGHT_MODULE_OPTIONS,
        async useFactory(optionsFactory: PlaywrightOptionsFactory) {
          return optionsFactory.createPlaywrightOptions();
        },
        inject: [options.useExisting],
      };
    } else if (options.useClass) {
      return {
        provide: PLAYWRIGHT_MODULE_OPTIONS,
        async useFactory(optionsFactory: PlaywrightOptionsFactory) {
          return optionsFactory.createPlaywrightOptions();
        },
        inject: [options.useClass],
      };
    } else {
      throw new Error('Invalid PlaywrightModule options');
    }
  }
}
