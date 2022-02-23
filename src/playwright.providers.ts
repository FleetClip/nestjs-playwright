import type { BrowserContext } from 'playwright';
import { getContextToken, getPageToken } from './playwright.util';

export function createPlaywrightProviders(
  instanceName?: string,
  pages: string[] = [],
) {
  return pages.map(page => ({
    provide: getPageToken(page),
    useFactory: (context: BrowserContext) => context.newPage(),
    inject: [getContextToken(instanceName)],
  }));
}
