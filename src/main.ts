import { PuppeteerCrawler, Dataset } from 'crawlee'
export const site = 'www.rede.jp'
export const datasetName = 'rede';

(async () => {
    const crawler = new PuppeteerCrawler({
        maxRequestsPerCrawl: 10000,

        async requestHandler({ request, page, enqueueLinks, log }) {
            const title = await page.title()
            log.info(`Title of ${request.url}: ${title}`)

            // A function to be evaluated by Puppeteer within the browser context.
            const data = await page.$$eval('body', ($posts, title) => {
                const scrapedData: any = []

                // We're getting the title, rank and URL of each post on Hacker News.
                $posts.forEach(($post) => {
                    scrapedData.push({
                        title: title,
                        body: $post.innerHTML,
                    })
                })
                return scrapedData
            }, title)

            await dataset.pushData(data)
            await enqueueLinks({
                globs: [`http?(s)://${site}/**`],
            })
        },
    })
    const dataset = await Dataset.open(datasetName)
    await crawler.addRequests([`https://${site}`])
    await crawler.run()
})()
