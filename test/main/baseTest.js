const path = require("path");
const moment = require("moment-timezone");
const { readFileSync, createWriteStream } = require("fs");
const allureCommandline = require("allure-commandline");
const onesDB = require("../tests/DB/onesDB");
const authAPI = require("../tests/API/authAPI");
const docsAPI = require("../tests/API/docsAPI");
const onesAPI = require("../tests/API/onesAPI");
const ESBDAPI = require("../tests/API/ESBDAPI");
const KASKOAPI = require("../tests/API/KASKOAPI");
const dictionaryAPI = require("../tests/API/dictionaryAPI");
const { Logger } = require("@amanat-qa/utils-backend");
const JSONLoader = require("./utils/data/JSONLoader");

const testClientsFileLocation = path.join(
  __dirname,
  "../resources/data/testClients.json"
);

const configDataFileLocation = path.join(
  __dirname,
  "../resources/data/configData.json"
);

const generateAllureReport = async () => {
  Logger.log("[inf] ▶ generate allure report");
  const generation = allureCommandline(
    JSONLoader.configData.allureCommandlineArgs
  );

  return new Promise((resolve, reject) => {
    const generationTimeout = setTimeout(() => {
      reject(
        new Error("[err]   timeout reached while generating allure report!")
      );
    }, 20000);
    generation.on("exit", (exitCode) => {
      clearTimeout(generationTimeout);
      if (exitCode !== 0) {
        return reject(new Error("[err]   could not generate allure report!"));
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
        .split("/")
        .pop()
        .split(".")
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
    await KASKOAPI.setToken();
    await dictionaryAPI.toggleVerification();
    await dictionaryAPI.toggleServer();
    const configData = JSON.parse(readFileSync(configDataFileLocation, "utf8"));
    const response = await dictionaryAPI.getESBDValue();
    global.withESBD = Boolean(JSON.parse(response.data.setting).value);
    configData.withESBD = global.withESBD;
    const configDataStream = createWriteStream(configDataFileLocation);
    configDataStream.write(JSON.stringify(configData, null, 2));
    const clients = await dictionaryAPI.fetchAllTestClients();
    const testClientsStream = createWriteStream(testClientsFileLocation);
    testClientsStream.write(JSON.stringify(clients.data, null, 2));
  },
  async afterAll() {
    await onesDB.closeConnection();

    /* eslint no-unused-expressions: ["error", { "allowTernary": true }] */
    this.test.parent.suites.some((suite) =>
      suite.tests.some((test) => test.state === "failed")
    )
      ? Logger.log(JSONLoader.configData.failed)
      : Logger.log(JSONLoader.configData.passed);

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
