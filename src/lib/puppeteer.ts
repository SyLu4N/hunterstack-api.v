import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { env } from 'src/env';

export async function createBrowser() {
  let executablePath = await chromium.executablePath();

  if (env.NODE_ENV === 'test') {
    executablePath = env.PATH_CHROME + '/chrome.exe';
  }

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  });

  return browser;
}

export async function createPage(browser: any) {
  const page = await browser.newPage();
  return page;
}
