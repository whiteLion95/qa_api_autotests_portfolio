const moment = require('moment-timezone');
const allureCommandline = require('allure-commandline');
const { Logger } = require('@amanat-qa/utils-backend');
const chai = require('chai');
chai.use(require('chai-subset'));
chai.use(require('chai-json-schema'));
const onesDB = require('../tests/DB/onesDB');
const authAPI = require('../tests/API/authAPI');
const docsAPI = require('../tests/API/docsAPI');
const onesAPI = require('../tests/API/onesAPI');
const ESBDAPI = require('../tests/API/ESBDAPI');
const cascoAPI = require('../tests/API/cascoAPI');
const dictionaryAPI = require('../tests/API/dictionaryAPI');
const JSONLoader = require('./utils/data/JSONLoader');

chai.should();

const generateAllureReport = async () => {
  Logger.log('[inf] ▶ generate allure report');
  const generation = allureCommandline(
    JSONLoader.configData.allureCommandlineArgs,
  );

  return new Promise((resolve, reject) => {
    const generationTimeout = setTimeout(() => {
      reject(
        new Error('[err]   timeout reached while generating allure report!'),
      );
    }, 20000);
    generation.on('exit', (exitCode) => {
      clearTimeout(generationTimeout);
      if (exitCode !== 0) {
        return reject(new Error('[err]   could not generate allure report!'));
      }

      return resolve();
    });
  });
};

exports.mochaHooks = {
  async beforeAll() {
    moment.tz.setDefault(JSONLoader.configData.timezone);
    if (JSONLoader.configData.parallel) {
      const title = this.test.parent.suites[0].tests[0].file
        .split('/')
        .pop()
        .split('.')
        .reverse()
        .pop();
      Logger.log(`${title} test log:`, title);
    }

    await onesDB.createConnection();
    await authAPI.setToken();
    await onesAPI.setToken();
    await ESBDAPI.setToken();
    await dictionaryAPI.setToken();
    await docsAPI.setToken();
    await cascoAPI.setToken();
    await dictionaryAPI.toggleVerification();
    await dictionaryAPI.toggleServer();
  },
  async afterEach() {
    if (this.currentTest.state === 'failed') {
      this.testFailed = true;
    }
  },
  async afterAll() {
    await onesDB.closeConnection();

    if (this.testFailed) {
      Logger.log(JSONLoader.configData.failed);
    } else {
      Logger.log(JSONLoader.configData.passed);
    }

    if (JSONLoader.configData.parallel) {
      Logger.logParallel();
      Logger.logToFileParallel();
    }

    try {
      await generateAllureReport();
    } catch (error) {
      Logger.log(error.message);
    }
  },
};
