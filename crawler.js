const url = require('url');
const path = require('path');

const WebDriver = require('selenium-webdriver');
const Phantom = require('phantomjs-prebuilt');
const Crawler = require('simplecrawler');
const chalk = require('chalk');
const async = require('async');

const csv = require('./csv');
const download = require('./driver')();

module.exports = (argv) => {

  const crawler = Crawler(argv.url);
  const writer = csv(argv.csv);
  const levels = argv.levels.split(',');
  const urlList = [];

  crawler.on('crawlstart', () => {
    console.log('\n--- Building sitemap. One moment, please...\n');
  });

  crawler.on('queueadd', (queueItem) => {
    urlList.push(queueItem.url);
    console.log(`Added item #${ queueItem.id } to queue: ${ queueItem.uriPath }`);
  });

  // crawler.on('fetchcomplete', function(queueItem, requestOptions) {
  //   const next = this.wait();
  //   download(queueItem.url, levels, (err, results) => {
  //     if (argv.csv && results.violations.length > 0) {
  //       writer.addViolations(queueItem.url, results.violations);
  //     }
  //     next();
  //   });
  // });

  crawler.on('complete', () => {
    console.log('\n--- Map completed! Running tests...\n');
    async.eachSeries(urlList, (url, callback) => {
      download(url, levels, (err, results) => {
        console.log('TEST ONNNNEEEEE')

        if (argv.csv && results.violations.length > 0) {
          writer.addViolations(url, results.violations);
        }
        callback();
      });
    });
  });

  // Only include non-file URLs.
  crawler.addFetchCondition((queueItem, referrerQueueItem) => {
    const urlPath = url.parse(queueItem.path).path;
    const urlExt = path.extname(urlPath);
    return urlExt === '' && queueItem.path.includes(argv.include || '');
  });

  crawler.host = url.parse(argv.url).hostname
  crawler.filterByDomain = true;
  crawler.stripQuerystring = true;
  crawler.downloadUnsupported = false;
  crawler.maxConcurrency = 5;

  crawler.start();

}
