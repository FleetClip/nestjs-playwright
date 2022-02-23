import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Browser, LaunchOptions } from 'playwright';

import { PlaywrightModule, InjectBrowser } from '../../src/';
import { CrawlerModule } from './crawler.module';
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';

const args: LaunchOptions['args'] = [
  '--disable-gpu', // Disable GPU
  '--no-first-run', // Disable Homepage
  '--disable-dev-shm-usage', // Disable Shared Memory
  '--allow-insecure-localhost', // Enables TLS/SSL errors on localhost to be ignored (no interstitial, no blocking of requests).
  '--allow-http-screen-capture', // Allow non-secure origins to use the screen capture API and the desktopCapture extension API.
  '--no-zygote', // https://codereview.chromium.org/2384163002
];

@Module({
  imports: [
    PlaywrightModule.forRoot({
      headless: false,
      channel: 'chrome',
      isGlobal: true,
      args,
    }),
    CrawlerModule,
  ],
  controllers: [AppController, CrawlerController],
  providers: [AppService, CrawlerService],
})
export class AppModule {
  constructor(@InjectBrowser() private readonly browser: Browser) {}

  async configure() {
    const version = this.browser.version();
    Logger.log(`Launched browser: ${version}`, 'Test');
  }
}
