import { DEFAULT_PLAYWRIGHT_INSTANCE_NAME } from './playwright.constants';

/**
 * Get a token for the Playwright instance for the given Browser name
 * @param instanceName The unique name for the Playwright instance
 */
export function getBrowserToken(
  instanceName: string = DEFAULT_PLAYWRIGHT_INSTANCE_NAME,
): string {
  return `${instanceName}Browser`;
}

/**
 * Get a token for the Playwright instance for the given BrowserContext name
 * @param instanceName The unique name for the Playwright instance
 */
export function getContextToken(
  instanceName: string = DEFAULT_PLAYWRIGHT_INSTANCE_NAME,
): string {
  return `${instanceName}Context`;
}

/**
 * Get a token for the Playwright instance for the given Page name
 * @param instanceName The unique name for the Playwright instance
 */
export function getPageToken(
  instanceName: string = DEFAULT_PLAYWRIGHT_INSTANCE_NAME,
): string {
  return `${instanceName}Page`;
}
