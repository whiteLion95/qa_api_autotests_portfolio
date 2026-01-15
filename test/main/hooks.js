const { Logger } = require('@amanat-qa/utils-backend');
const JSONLoader = require('./utils/data/JSONLoader');

function suiteHooks({ suiteTitle }) {
  before(() => {
    Logger.log(`==== START SUITE: ${suiteTitle} ====`);
  });

  after(() => {
    Logger.log(`==== END SUITE: ${suiteTitle} ====`);
  });
}

function caseHooks({ caseTitle }) {
  before(() => {
    if (!JSONLoader.configData.parallel) {
      Logger.log(
        `--- START TEST CASE with params: ${caseTitle} ---`,
      );
    }
  });

  after(() => {
    if (!JSONLoader.configData.parallel) {
      Logger.log(
        `--- END TEST CASE with params: ${caseTitle} ---`,
      );
    }
  });
}

function itHooks() {
  beforeEach(function () { // eslint-disable-line func-names
    if (!JSONLoader.configData.parallel) {
      Logger.log(`Start test: ${this.currentTest.title}`);
    }
  });

  afterEach(function () { // eslint-disable-line func-names
    if (!JSONLoader.configData.parallel && this.currentTest.state) {
      Logger.log(`${this.currentTest.state.toUpperCase()}: ${this.currentTest.title}`);
    }
  });
}

module.exports = {
  suiteHooks,
  caseHooks,
  itHooks,
};
