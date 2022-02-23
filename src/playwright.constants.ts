import type { LaunchOptions } from 'playwright';

export const PLAYWRIGHT_INSTANCE_NAME = 'PlaywrightInstanceName';
export const PLAYWRIGHT_MODULE_OPTIONS = 'PlaywrightModuleOptions';

export const DEFAULT_PLAYWRIGHT_INSTANCE_NAME = 'DefaultPlaywright';

const args: LaunchOptions['args'] = [
  '--disable-gpu', // Disable GPU
  '--no-first-run', // Disable Homepage
  '--disable-dev-shm-usage', // Disable Shared Memory
  '--allow-insecure-localhost', // Enables TLS/SSL errors on localhost to be ignored (no interstitial, no blocking of requests).
  '--allow-http-screen-capture', // Allow non-secure origins to use the screen capture API and the desktopCapture extension API.
  '--no-zygote', // https://codereview.chromium.org/2384163002
];
// add --no-sandbox when running on Linux, required with --no-zygote
if (typeof process.getuid === 'function') {
  args.push('--no-sandbox');
}

export const DEFAULT_CHROME_LAUNCH_OPTIONS: LaunchOptions = {
  headless: true,
  args,
  channel: 'chrome',
};
