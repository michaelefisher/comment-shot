import * as dotenv from 'dotenv'
import puppeteer from 'puppeteer';
import Jimp from 'jimp';

dotenv.config()

const REDDIT_USER = process.env.REDDIT_USER;
const POST_TYPE = process.env.POST_TYPE;

const collectPermalinks = async (nextPageUrl: string): Promise<{ 'links': Array<string | null>, 'nextPageUrl': string | null }> => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(nextPageUrl, { waitUntil: 'networkidle0' });

  let links = [];
  links = await page.evaluate(async (POST_TYPE: string) => {
    window.scrollBy(0, document.body.clientHeight);
    // @todo: hack
    await new Promise(resolve => setTimeout(resolve, 5000));
    const linkSelectors = (POST_TYPE === 'submitted') ? '.entry > div.top-matter > p.title > a' : '.entry > ul.flat-list.buttons > li.first > .bylink'
    return (Array.from(document.querySelectorAll(linkSelectors)) as Array<HTMLAnchorElement>)
      .map((el) => {
        console.log(el);
        return el.href
      });
  });

  // Get pointer to next link
  const nextUrl = await page.evaluate(async () => {
    return (Array.from(document.querySelectorAll('.nav-buttons > .nextprev > .next-button > a')) as Array<HTMLAnchorElement>)
      .map(el => el.href);
  })
  console.log(`   NEW NEXTPAGEURL:${nextUrl}`)
  browser.close();
  if (POST_TYPE === 'comments') {
    links = links.filter(link => {
      if (link) {
        return new URL(link).pathname.split('/').filter(part => part.length > 0).length > 5
      }
    });
  }
  console.log(`   NEW LINKS: ${links}`)
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
      try {
        await Promise.all([
          page.goto(link, { waitUntil: 'load' }),
          page.waitForNavigation(),
          page.waitForSelector('.commentarea', {
            visible: true
          }),
        ]);
        const path = `screenshots/${POST_TYPE}/screenshot - ${(Math.random() + 1).toString(36).substring(7)}.png`;
        await page.screenshot({ path: path, fullPage: true });
        console.log(`All done, check the screenshot: ${path} ✨`);
        page.close();

        // Watermark image
        const imageBox = new Jimp(1000, 60, 0xFFFFFFFF);

        const image = await Jimp.read(path);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_12_BLACK);
        imageBox.print(font, Jimp.HORIZONTAL_ALIGN_LEFT, Jimp.VERTICAL_ALIGN_TOP + 20, `Date: ${(new Date).toLocaleDateString()} `);
        imageBox.print(font, Jimp.HORIZONTAL_ALIGN_LEFT, Jimp.VERTICAL_ALIGN_TOP, `URL: ${link} `, 800);

        image.composite(imageBox, 0, 0);
        image.write(`${path}-watermark.${image.getExtension()}`);
      } catch (err) {
        console.log(err);
      }
    }
  }
  browser.close();
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
  'nextPageUrl': `https://old.reddit.com/user/${REDDIT_USER}/${POST_TYPE}`
}

if (POST_TYPE === 'undefined' || REDDIT_USER === 'undefined') {
  console.error(`POST_TYPE is set to ${POST_TYPE} and REDDIT_USER is set to ${REDDIT_USER}. Both must be set.`);
  process.exit(1);
} else {
  await recursivelyGoToNextPage(start);
}

