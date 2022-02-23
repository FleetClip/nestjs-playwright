import { Injectable } from '@nestjs/common';
import { InjectPage } from '../../src/';
import { Page } from 'playwright';

@Injectable()
export class CrawlerService {
  constructor(@InjectPage() private readonly page: Page) {}

  async crawl(url: string) {
    await this.page.goto(url, { waitUntil: 'networkidle' });
    const content = await this.page.content();
    return { content };
  }
}
