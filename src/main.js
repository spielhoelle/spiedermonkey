import { PuppeteerCrawler, Dataset } from 'crawlee';

const crawler = new PuppeteerCrawler({
    async requestHandler({ request, page, enqueueLinks, log }) {
        const title = await page.title();
        log.info(`Title of ${request.url}: ${title}`);

        // A function to be evaluated by Puppeteer within the browser context.
        const data = await page.$$eval('body', ($posts, title) => {
            const scrapedData = [];

            // We're getting the title, rank and URL of each post on Hacker News.
            $posts.forEach(($post) => {
                scrapedData.push({
                    title: title,
                    body: $post.innerHTML,
                });
            });

            return scrapedData;
        }, title);

        // Store the results to the default dataset.
        await Dataset.pushData(data);

        await enqueueLinks({
            globs: ['http?(s)://www.ategracapital.com/**'],
        });
    },
    maxRequestsPerCrawl: 10,
});

await crawler.addRequests(['https://www.ategracapital.com/']);

await crawler.run();


