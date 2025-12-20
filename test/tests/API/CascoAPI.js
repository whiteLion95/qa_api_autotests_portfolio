const BaseAPI = require("../../main/utils/API/baseAPI");
const authAPI = require("./authAPI");

class CascoAPI extends BaseAPI {
  #API;

  #user;

  #options;

  constructor(
    options = {
      baseURL: "" || process.env.GATEWAY_URL,
    }
  ) {
    super(options);
    this.#options = options;
  }

  get user() {
    return this.#user;
  }

  async setToken() {
    this.#user = await authAPI.getTestUser();
    const response = await authAPI.auth({
      user: this.#user,
      APIName: "CASKO API",
    });
    this.#options.headers = {};
    this.#options.headers.Authorization = `Bearer ${response.data.data.access_token}`;
    this.#API = new CascoAPI(this.#options);
  }
}

module.exports = new CascoAPI();
