# nestjs-playwright

## Description

This is a Playwright module for [NestJS](https://nestjs.com/), making it easy to inject the [playwright](https://playwright.dev) into your project. It's modeled after the official modules, allowing for asynchronous configuration and such.

Inspired and forked from [nest-puppeteer](https://github.com/tinovyatkin/nest-puppeteer)

## Installation

In your existing NestJS-based project:

```sh
npm install nestjs-playwright playwright
```

## Usage

Overall, it works very similarly to any injectable module described in the NestJS documentation. You may want to refer to those docs as well -- and maybe the [dependency injection](https://docs.nestjs.com/fundamentals/custom-providers) docs too if you're still trying to wrap your head around the NestJS implementation of it.

### Simple example

In the simplest case, you can explicitly specify options you'd normally provide to your `playwright.chromium.launch` or the instance name using `PlaywrightModule.forRoot()`:

```typescript
import { Module } from '@nestjs/common';
import { PlaywrightModule } from 'nestjs-playwright';

@Module({
  imports: [
    PlaywrightModule.forRoot(
      { 
        headless: true,
        channel: 'chrome',
        isGlobal: true, 
      }, // optional, any Playwright launch options here or leave empty for good defaults */,
      'BrowserInstanceName', // optional, can be useful for using Chrome and Firefox in the same project
    ),
  ],
})
export class CatsModule {}
```

To inject the Playwright `Browser` object:

```typescript
import type { Browser } from 'playwright';
import { Injectable } from '@nestjs/common';
import { InjectBrowser } from 'nestjs-playwright';
import { Cat } from './interfaces/cat';

@Injectable()
export class CatsRepository {
  constructor(@InjectBrowser() private readonly browser: Browser) {}

  async create(cat: Cat) {
    const version = this.browser.version();
    return { version };
  }
}
```

To inject a new incognito `BrowserContext` object:

```typescript
import { Module } from '@nestjs/common';
import { PlaywrightModule } from 'nestjs-playwright';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  imports: [PlaywrightModule.forFeature()],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

```typescript
import type { BrowserContext } from 'playwright';
import { Injectable } from '@nestjs/common';
import { InjectContext } from 'nestjs-playwright';
import { Cat } from './interfaces/cat';

@Injectable()
export class CatsRepository {
  constructor(
    @InjectContext() private readonly browserContext: BrowserContext,
  ) {}

  async create(cat: Cat) {
    const page = await this.browserContext.newPage();
    await page.goto('https://test.com/');
    return await page.content();
  }
}
```

Inject `Page` object:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectPage } from 'nestjs-playwright';
import type { Page } from 'playwright';

@Injectable()
export class CrawlerService {
  constructor(@InjectPage() private readonly page: Page) {}

  async crawl(url: string) {
    await this.page.goto(url, { waitUntil: 'networkidle2' });
    const content = await this.page.content();
    return { content };
  }
}
```

### Asynchronous configuration

If you want to pass in Playwright configuration options from a ConfigService or other provider, you'll need to perform the Playwright module configuration asynchronously, using `PlaywrightModule.forRootAsync()`. There are several different ways of doing this.

#### Use a factory function

The first is to specify a factory function that populates the options:

```typescript
import { Module } from '@nestjs/common'
import { PlaywrightModule } from 'nestjs-playwright'
import { ConfigService } from '../config/config.service'

@Module({
    imports: [PlaywrightModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => {
            launchOptions: config.chromeLaunchOptions,
        },
        inject: [ConfigService]
    })]
})
export class CatsModule {}
```

#### Use a class

Alternatively, you can write a class that implements the `PlaywrightOptionsFactory` interface and use that to create the options:

```typescript
import { Module } from '@nestjs/common';
import {
  PlaywrightModule,
  PlaywrightOptionsFactory,
  PlaywrightModuleOptions,
} from 'nestjs-playwright';

@Injectable()
export class PlaywrightConfigService implements PlaywrightOptionsFactory {
  private readonly launchOptions = { pipe: true };
  private readonly dbName = 'BestAppEver';

  createMongoOptions(): PlaywrightModuleOptions {
    return {
      launchOptions: this.launchOptions,
      instanceName: this.instanceName,
    };
  }
}

@Module({
  imports: [
    PlaywrightModule.forRootAsync({
      useClass: PlaywrightConfigService,
    }),
  ],
})
export class CatsModule {}
```

Just be aware that the `useClass` option will instantiate your class inside the PlaywrightModule, which may not be what you want.

#### Use existing

If you wish to instead import your PlaywrightConfigService class from a different module, the `useExisting` option will allow you to do that.

```typescript
import { Module } from '@nestjs/common'
import { PlaywrightModule } from 'nest-playwright'
import { ConfigModule, ConfigService } from '../config/config.service'

@Module({
    imports: [PlaywrightModule.forRootAsync({
        imports: [ConfigModule]
        useExisting: ConfigService
    })]
})
export class CatsModule {}
```

In this example, we're assuming that `ConfigService` implements the `PlaywrightOptionsFactory` interface and can be found in the ConfigModule.

#### Use module globally

When you want to use `PlaywrightModule` in other modules, you'll need to import it (as is standard with any Nest module). Alternatively, declare it as a [global module](https://docs.nestjs.com/modules#global-modules) by setting the options object's `isGlobal` property to `true`, as shown below. In that case, you will not need to import `PlaywrightModule` in other modules once it's been loaded in the root module (e.g., `AppModule`).

```typescript
PlaywrightModule.forRoot({
  isGlobal: true,
});
```

## Todo

- [ ] Support for Firefox & Opera

## Stay in touch

- Original Author - [Konstantin Vyatkin](tino@vtkn.io)
- Author - [FleetClip](fleetclip@protonmail.com)

## License

`nestjs-playwright` is [MIT licensed](LICENSE).
