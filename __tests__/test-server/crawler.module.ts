import { Module } from '@nestjs/common';
import { PlaywrightModule } from '../../src/';

@Module({ imports: [PlaywrightModule.forFeature(['crawler']), CrawlerModule] })
export class CrawlerModule {}
