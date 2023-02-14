import puppeteer from 'puppeteer';
import winston from 'winston';

import { URL } from 'url';
import { mkdirSync, existsSync } from 'fs';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});


// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

const REDDIT_USER = process.env.REDDIT_USER;

const openBrowser = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`https://old.reddit.com/user/${REDDIT_USER}/submitted/`);

  const [response] = await Promise.all([
    // page.waitForNavigation(waitOptions),
    page.click('#thing_t3_ui5f6a > div.entry.unvoted > div.top-matter > ul > li.first > a'),
  ]);

  // logger.log({
  //   level: 'info',
  //   message: response
  // });

  browser.close();
};

openBrowser();
