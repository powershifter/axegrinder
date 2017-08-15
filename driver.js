const AxeBuilder = require('axe-webdriverjs');
const WebDriver = require('selenium-webdriver');
const Phantom = require('phantomjs-prebuilt');
const chalk = require('chalk');
const Nightmare = require('nightmare');
const axe = require('axe-core');

function logResults(url, results) {
  if (results.violations.length > 0) {
    const errors = results.violations.map(v => '  - ' + v.help);
    console.error(chalk.red('✘ ' + url));
    console.error(chalk.gray(errors.join('\n')));
  } else {
    console.log(chalk.green('✓ ' + url));
  }
}

module.exports = () => {

  // Custom selenium driver that uses the bundled phantomjs, so we don't need a
  // binary in the PATH.
  // const customPhantom = WebDriver.Capabilities.phantomjs();
  // customPhantom.set('phantomjs.binary.path', Phantom.path);
  // const driverTemplate = new WebDriver.Builder().withCapabilities(customPhantom);

  const nightmare = Nightmare();
  nightmare.inject('js', 'node_modules/axe-core/axe.js');

  return (url, levels, callback) => {
    nightmare.goto(url).wait('body').evaluate((onAxeRun) => {
      axe.run(function(err, results) {
        onAxeRun(results);
      });
    }).then((results) => {
      console.log('success!!!!!!!!')
      logResults(url, results);
      callback(null, results);
    }).catch((err) => {
      console.error(chalk.red('Error fetching ' + url));
      callback(e, null);
    });
  };

  // return (url, levels, callback) => {
  //   const driver = driverTemplate.build();
  //   driver.get(url).then(() => {
  //     try {
  //       AxeBuilder(driver).withTags(levels).analyze((results) => {
  //         driver.quit();
  //         logResults(url, results);
  //         callback(null, results);
  //       });
  //     } catch(e) {
  //       console.error(chalk.red('Error fetching ' + url));
  //       callback(e, null);
  //     }
  //   });
  // };

};
