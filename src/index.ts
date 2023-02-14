import puppeteer from 'puppeteer';
import { URL } from 'url';
import { mkdirSync, existsSync } from 'fs';

const openBrowser = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://google.com');
  browser.close();
};

openBrowser();
