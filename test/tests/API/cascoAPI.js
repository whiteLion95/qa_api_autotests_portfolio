const { BaseAPI, Logger } = require('@amanat-qa/utils-backend');
const authAPI = require('./authAPI');
const JSONLoader = require('../../main/utils/data/JSONLoader');

class CascoAPI extends BaseAPI {
  #API;

  #user;

  #options;

  constructor(
    options = {
      baseURL: '' || process.env.GATEWAY_URL,
    },
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
      APIName: 'CASKO API',
    });
    this.#options.headers = {};
    this.#options.headers.Authorization = `Bearer ${response.data.data.access_token}`;
    this.#API = new CascoAPI(this.#options);
  }

  async createPolicyDraft() {
    const response = await this.#API.post(JSONLoader.APIEndpoints.casco.policies);

    if (response.status === 201) {
      Logger.log(`Policy created - ID: ${response.data.data.id}`);
    }

    return response;
  }

  async createPolicyVehicle(policyId, payload) {
    const response = await this.#API.post(`${JSONLoader.APIEndpoints.casco.policies}/${policyId}/vehicles`, payload);

    if (response.status === 201) {
      Logger.log(`Vehicle created with ID: ${response.data.data.id} for Policy ID: ${policyId}`);
    }

    return response;
  }

  async updatePolicyVehicle(policyId, vehicleId, payload) {
    const response = await this.#API.put(`${JSONLoader.APIEndpoints.casco.policies}/${policyId}/vehicles/${vehicleId}`, payload);

    if (response.status === 200) {
      Logger.log(`Vehicle with ID: ${vehicleId} for Policy ID: ${policyId} updated`);
    }

    return response;
  }

  async getTariffs(params = {}) {
    const requestParams = {
      ...JSONLoader.getTariffsParams,
      ...params,
    };

    const response = await this.#API.get(
      JSONLoader.APIEndpoints.casco.tariffs,
      requestParams,
    );

    return response;
  }

  async createClient(policyId, payload) {
    const response = await this.#API.post(`${JSONLoader.APIEndpoints.casco.policies}/${policyId}/clients/create`, payload);

    if (response.status === 200) {
      Logger.log(`Client created with ID: ${response.data.data.id} for Policy ID: ${policyId}`);
    }

    return response;
  }

  async getPolicy(policyId) {
    const response = await this.#API.get(`${JSONLoader.APIEndpoints.casco.policies}/${policyId}`);
    return response;
  }

  async createPayment(policyId, payload) {
    const response = await this.#API.post(`${JSONLoader.APIEndpoints.casco.policies}/${policyId}/payment`, payload);

    if (response.status === 201) {
      Logger.log(`Payment created for Policy ID: ${policyId}`);
    }

    return response;
  }

  async getInsurancePeriods(params = {}) {
    const response = await this.#API.get(
      JSONLoader.APIEndpoints.casco.insurancePeriods,
      params,
    );

    return response;
  }

  /* eslint camelcase: ["error", {allow: ["start_date", "payment_plan_id"]}] */
  async getPaymentSchedule(policyId, start_date, payment_plan_id) {
    const params = {
      start_date,
      payment_plan_id,
    };

    const response = await this.#API.get(
      `${JSONLoader.APIEndpoints.casco.policies}/${policyId}/payment/schedule`,
      params,
    );

    return response;
  }

  async issuePolicy(policyId, payload) {
    const params = {
      ...payload,
      status: JSONLoader.dictCasco.policy_status.issued,
    };

    const response = await this.#API.put(
      `${JSONLoader.APIEndpoints.casco.policies}/${policyId}`,
      params,
    );

    if (response.status === 200) {
      Logger.log(`Policy with ID: ${policyId}, Number: ${response.data.data.number} issued.`);
    }

    return response;
  }

  async cancelPolicy(policyId) {
    const params = {
      status: JSONLoader.dictCasco.policy_status.cancelled,
    };

    const response = await this.#API.put(
      `${JSONLoader.APIEndpoints.casco.policies}/${policyId}`,
      params,
    );

    if (response.status === 200) {
      Logger.log(`Policy with ID: ${policyId}, Number: ${response.data.data.number} cancelled.`);
    }

    return response;
  }

  async deletePolicy(policyId) {
    const response = await this.#API.delete(
      `${JSONLoader.APIEndpoints.casco.policies}/${policyId}`,
    );

    if (response.status === 200) {
      Logger.log(`Policy with ID: ${policyId} deleted.`);
    }

    return response;
  }
}

module.exports = new CascoAPI();
