const path = require("path");
const authAPI = require("./authAPI");
const { BaseAPI } = require("@amanat-qa/utils-backend");
const JSONLoader = require("../../main/utils/data/JSONLoader");
require("dotenv").config({
  path: path.join(__dirname, "../../../", ".env.test"),
  override: true,
});

class DictionaryAPI extends BaseAPI {
  #API;

  #options;

  constructor(
    options = {
      baseURL: "" || process.env.GATEWAY_URL,
    }
  ) {
    super(options);
    this.#options = options;
  }

  async setToken() {
    const response = await authAPI.auth({ APIName: "Dictionary API" });
    this.#options.headers = {};
    this.#options.headers.Authorization = `Bearer ${response.data.data.access_token}`;
    this.#API = new DictionaryAPI(this.#options);
  }

  async toggleServer() {
    const params = {
      setting: JSONLoader.configData.servers,
    };

    return this.#API.post(JSONLoader.APIEndpoints.dictionary.servers, params);
  }

  async toggleVerification() {
    const params = {
      value: Number(JSONLoader.configData.verification),
    };

    return this.#API.patch(
      JSONLoader.APIEndpoints.dictionary.verifyBool,
      params
    );
  }

  async carMarks() {
    return this.#API.get(JSONLoader.APIEndpoints.dictionary.carMarks);
  }

  async carModels() {
    const params = {
      "where[title]": JSONLoader.templateSetPolicy.cars.mark,
    };

    return this.#API.get(JSONLoader.APIEndpoints.dictionary.carModels, params);
  }

  async fetchAllTestClients() {
    return this.#API.get(JSONLoader.APIEndpoints.dictionary.testClients);
  }

  async fetchAllTestCars() {
    return this.#API.get(JSONLoader.APIEndpoints.dictionary.testCars);
  }

  async getWorkingDay(nextMonthFirstDay) {
    const params = {
      work_day_num: JSONLoader.testData.paymentDateBusinessDaysIncrement,
      start_date: nextMonthFirstDay,
    };

    return this.#API.get(
      JSONLoader.APIEndpoints.dictionary.weekendGetWorkDay,
      params
    );
  }

  async getESBDValue() {
    return this.#API.get(JSONLoader.APIEndpoints.dictionary.ESBD);
  }
}

module.exports = new DictionaryAPI();
