import puppeteer from 'puppeteer';
import Jimp from 'jimp';

const REDDIT_USER = process.env.REDDIT_USER;

const collectPermalinks = async (nextPageUrl: string): Promise<{ 'links': Array<string | null>, 'nextPageUrl': string | null }> => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  console.log(nextPageUrl);
  await page.goto(nextPageUrl, { waitUntil: 'networkidle0' });

  let links = [];
  links = await page.evaluate(async () => {
    window.scrollBy(0, document.body.clientHeight);
    await new Promise(resolve => setTimeout(resolve, 5000));
    return Array.from(document.querySelectorAll('.entry > ul.flat-list.buttons > li.first > .bylink'))
      .map((el) => el.getAttribute('href'));
  });

  const nextUrl = await page.evaluate(async () => {
    return Array.from(document.querySelectorAll('.nav-buttons > .nextprev > .next-button > a'))
      .map((el) => {
        return el.getAttribute('href')
      });
  })
  console.log(`   NEW NEXTPAGEURL:${nextUrl}`)
  browser.close();
  links = links.filter(link => {
    if (link) {
      return new URL(link).pathname.split('/').filter(part => part.length > 0).length > 5
    }
  });
  console.log(`   NEW LINKS:${links}`)
  return {
    'links': links,
    'nextPageUrl': nextUrl[0]
  }
};

const getScreenshotsFromPage = async (links: Array<string | null>): Promise<void> => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  for (let link of links) {
    const page = await browser.newPage();
    if (link) {
      await Promise.all([
        page.goto(link, { waitUntil: 'load' }),
        // page.waitForNavigation(),
        page.waitForSelector('.comment', {
          visible: true
        }),
      ]);
      const path = `screenshots/screenshot - ${(Math.random() + 1).toString(36).substring(7)}.png`;
      await page.screenshot({ path: path, fullPage: true });
      console.log(`All done, check the screenshot: ${path} ✨`);
      page.close();

      // Watermark image
      const image = await Jimp.read(path);
      const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
      image.print(font, Jimp.HORIZONTAL_ALIGN_LEFT, Jimp.VERTICAL_ALIGN_BOTTOM - 80, `Date: ${(new Date).toLocaleDateString()}`);
      image.print(font, Jimp.HORIZONTAL_ALIGN_LEFT, Jimp.VERTICAL_ALIGN_BOTTOM, `URL: ${link}`, 400);
      image.write(`${path}-watermark.${image.getExtension()}`);
    }
  }
}
// While next button URL is not empty or undefined,
// get screenshots and next page and recurse
const recursivelyGoToNextPage = async (pagePermalinksAndNextPage: { 'links': Array<string | null>, 'nextPageUrl': string | null }): Promise<any> => {
  console.log(`Moving onto page: ${pagePermalinksAndNextPage.nextPageUrl} `)
  await getScreenshotsFromPage(pagePermalinksAndNextPage.links);
  if (!pagePermalinksAndNextPage?.nextPageUrl) return;
  pagePermalinksAndNextPage = await collectPermalinks(pagePermalinksAndNextPage?.nextPageUrl);
  console.log(pagePermalinksAndNextPage);
  return recursivelyGoToNextPage(pagePermalinksAndNextPage);
}

const start = {
  'links': [],
  'nextPageUrl': `https://old.reddit.com/user/${REDDIT_USER}/comments/`
}

await recursivelyGoToNextPage(start);

