const path = require("path");
const authAPI = require("./authAPI");
const { BaseAPI } = require("@amanat-qa/utils-backend");
const JSONLoader = require("../../main/utils/data/JSONLoader");
require("dotenv").config({
  path: path.join(__dirname, "../../../", ".env.test"),
  override: true,
});

class DocsAPI extends BaseAPI {
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
    const response = await authAPI.auth({ APIName: "Docs API" });
    this.#options.headers = {};
    this.#options.headers.Authorization = `Bearer ${response.data.data.access_token}`;
    this.#API = new DocsAPI(this.#options);
  }

  async getFile(policyNumber, fileName) {
    const params = {
      title: `${JSONLoader.testData.filePathForTitle}/${policyNumber}/${policyNumber}_${fileName}.pdf`,
    };

    return this.#API.get(JSONLoader.APIEndpoints.docs.getFile, params);
  }
}

module.exports = new DocsAPI();
