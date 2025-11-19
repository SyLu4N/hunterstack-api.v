import chromium from '@sparticuz/chromium';
import puppeteer, { Browser } from 'puppeteer-core';
import { env } from 'src/env';

export async function createBrowser() {
  let executablePath = env.PATH_CHROME + '/chrome.exe';

  if (env.NODE_ENV === 'production') {
    executablePath = await chromium.executablePath();
  }

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  });

  return browser;
}

export async function createPage(browser: Browser) {
  const page = await browser.newPage();
  return page;
}
