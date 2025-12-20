const path = require("path");
const {
  Logger,
  BaseAPI,
  Randomizer,
  JSONLoader,
} = require("@amanat-qa/utils-backend");
require("dotenv").config({
  path: path.join(__dirname, "../../../", ".env.test"),
  override: true,
});

class AuthAPI extends BaseAPI {
  #API;

  #login;

  #password;

  #options;

  constructor(
    options = {
      baseURL: "" || process.env.GATEWAY_URL,
    }
  ) {
    super(options);
    this.#options = options;
    this.#login = "" || process.env.AUTH_LOGIN;
    this.#password = "" || process.env.AUTH_PASSWORD;
  }

  async auth({ user, APIName }) {
    const params = user
      ? { login: user.login, password: user.password }
      : { login: this.#login, password: this.#password };
    Logger.log(`[inf]   login in ${APIName} as ${params.login}:`);

    return this.post(JSONLoader.APIEndpoints.auth.login, params);
  }

  async setToken() {
    const response = await this.auth({ APIName: "Auth API" });
    this.#options.logString = "[inf] ▶ set base API URL:";
    this.#options.headers = {};
    this.#options.headers.Authorization = `Bearer ${response.data.data.access_token}`;
    this.#API = new AuthAPI(this.#options);
  }

  async getTestUser(options = {}) {
    const { isManager } = options;
    const { isAgent } = options;
    const { isPartner } = options;
    const { isOnline } = options;
    let users = (
      await this.#API.get(JSONLoader.APIEndpoints.auth.testUsers)
    ).data.filter((elem) => elem.product === JSONLoader.APIConfigData.product);
    if (isManager) users = users.filter((elem) => elem.manager);
    if (isAgent) users = users.filter((elem) => elem.agent);
    if (isPartner) users = users.filter((elem) => elem.partner);
    if (isOnline) users = users.filter((elem) => elem.online);

    return users[Randomizer.getRandomInteger(users.length - 1)];
  }
}

module.exports = new AuthAPI();
