import puppeteer from 'puppeteer';

const REDDIT_USER = process.env.REDDIT_USER;

const collectPermalinks = async (nextPageUrl?: string | null): Promise<{ 'links': Array<string | null>, 'nextPageUrl': Array<string | null> }> => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const [page] = await browser.pages();
  await page.goto(nextPageUrl ? nextPageUrl : `https://old.reddit.com/user/${REDDIT_USER}/comments/`, { waitUntil: 'networkidle0' });

  let links = [];
  links = await page.evaluate(async () => {
    window.scrollBy(0, document.body.clientHeight);
    await new Promise(resolve => setTimeout(resolve, 5000));
    return Array.from(document.querySelectorAll('.entry > ul.flat-list.buttons > li.first > .bylink'))
      .map((el) => el.getAttribute('href'));
  });

  const nextUrl = await page.evaluate(async () => {
    return Array.from(document.querySelectorAll('.nav-buttons > .nextprev > .next-button > a'))
      .map((el) => el.getAttribute('href'))
  })
  browser.close();
  return {
    'links': links,
    'nextPageUrl': nextUrl
  }
};

const getScreenshotsFromPage = async (links: Array<string | null>): Promise<void> => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const [page] = await browser.pages();
  for (let link of links) {
    if (link) {
      await page.goto(link, { waitUntil: 'networkidle0', timeout: 10000 });
      await page.screenshot({ path: `screenshots/screenshot-${(Math.random() + 1).toString(36).substring(7)}.png`, fullPage: true });
      console.log(`All done, check the screenshot. ✨`);
    }
  }
}
// While next button URL is not empty or undefined,
// get screenshots and next page and recurse
const recursivelyGoToNextPage = async (pagePermalinksAndNextPage: { 'links': Array<string | null>, 'nextPageUrl': Array<string | null> }) => {
  console.log(`Moving onto page: ${pagePermalinksAndNextPage.nextPageUrl}`)
  await getScreenshotsFromPage(pagePermalinksAndNextPage.links);
  if (!pagePermalinksAndNextPage.nextPageUrl[0]) return;
  recursivelyGoToNextPage(pagePermalinksAndNextPage);
}

// Get first page and next page
let pagePermalinksAndNextPage = await collectPermalinks();
recursivelyGoToNextPage(pagePermalinksAndNextPage);
