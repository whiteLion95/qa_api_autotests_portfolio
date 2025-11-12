let userIDOnes;
const path = require('path');
const fs = require('fs');
const authAPI = require('./authAPI');
const BaseAPI = require('../../main/utils/API/baseAPI');
const TimeUtils = require('../../main/utils/time/timeUtils');
const DataUtils = require('../../main/utils/data/dataUtils');
const JSONMapper = require('../../main/utils/data/JSONMapper');
const JSONLoader = require('../../main/utils/data/JSONLoader');
const Randomizer = require('../../main/utils/random/randomizer');
require('dotenv').config({ path: path.join(__dirname, '../../../', '.env.test'), override: true });

class KASKOAPI extends BaseAPI {
  #API;

  #user;

  #options;

  constructor(options = {
    baseURL: '' || process.env.GATEWAY_URL,
  }) {
    super(options);
    this.#options = options;
  }

  get user() {
    return this.#user;
  }

  async setToken() {
    this.#user = await authAPI.getTestUser();
    const response = await authAPI.auth({ user: this.#user, APIName: 'KASKO API' });
    userIDOnes = response.data.data.user.id_1c;
    this.#options.headers = {};
    this.#options.headers.Authorization = `Bearer ${response.data.data.access_token}`;
    this.#API = new KASKOAPI(this.#options);
  }

  async getCarAveragePrice() {
    const params = JSONLoader.templateGetCarAveragePrice;

    return this.#API.get(JSONLoader.APIEndpoints.KASKO.getCarAveragePrice, params);
  }

  async issueTariffs() {
    const params = {
      insurance_sum: JSONLoader.templateSetPolicy.cars[0].insurance_sum,
      car_year: JSONLoader.templateSetPolicy.cars[0].NYEAR,
      agent_id_1c: userIDOnes,
    };

    return this.#API.get(JSONLoader.APIEndpoints.KASKO.issueTariffs, params);
  }

  async getCar() {
    const params = {
      reg_num: JSONLoader.templateSetPolicy.cars[0].number,
      reg_cert_num: JSONLoader.templateSetPolicy.cars[0].passport_number,
    };

    return this.#API.get(JSONLoader.APIEndpoints.KASKO.getCar, params);
  }

  async setPolicy(setPolicyTemplate) {
    const flattenedSetPolicyTemplate = JSONMapper.flattenJSON(setPolicyTemplate);

    const premium = Randomizer.getRandomInteger(JSONLoader.testData.maxPremiumAmount);
    const premiumFullKeys = JSONMapper.getNestedProperty(flattenedSetPolicyTemplate, 'premium').keys;
    premiumFullKeys.forEach((fullKey) => {
      flattenedSetPolicyTemplate[fullKey] = premium;
    });
    const externalIDFullKey = JSONMapper.getNestedProperty(flattenedSetPolicyTemplate, 'external_id').keys.pop();
    flattenedSetPolicyTemplate[externalIDFullKey] = Randomizer
      .getRandomString(true, true, true, false, false, 8, 10);
    const agentIDOnesFullKey = JSONMapper.getNestedProperty(flattenedSetPolicyTemplate, 'agent_id_1c').keys.pop();
    flattenedSetPolicyTemplate[agentIDOnesFullKey] = !this.#user.login.includes('tugelbassov')
      ? userIDOnes
      : 0;

    // insurance period randomization. 1 to 12 months.
    const insurancePeriod = Randomizer.getRandomInteger(12, 1);
    const datesInterval = TimeUtils
      .getDatesInterval(insurancePeriod, 'month');

    // payment type randomization (0 - onetime, 1 - installment).
    // default values are for one-time payment.
    const paymentType = Randomizer.getRandomInteger(1);
    let paymentCount = 1;
    let paymentStartDate = null;
    let paymentTransitionSum = premium;
    if (paymentType === 1) {
      // number of payments. once a month, up to 12 months.
      paymentCount = Randomizer.getRandomInteger(12, 2);
      paymentStartDate = datesInterval.startDate;
      paymentTransitionSum = Math.floor(paymentTransitionSum / paymentCount);
      paymentTransitionSum = premium - (paymentCount - 1) * paymentTransitionSum;
    }

    const paymentTypeFullKey = JSONMapper.getNestedProperty(flattenedSetPolicyTemplate, 'payment_type').keys.pop();
    flattenedSetPolicyTemplate[paymentTypeFullKey] = paymentType;
    const paymentCountFullKey = JSONMapper.getNestedProperty(flattenedSetPolicyTemplate, 'payment_count').keys.pop();
    flattenedSetPolicyTemplate[paymentCountFullKey] = paymentCount;
    const transitionSumFullKey = JSONMapper.getNestedProperty(flattenedSetPolicyTemplate, 'transitionSum').keys.pop();
    flattenedSetPolicyTemplate[transitionSumFullKey] = paymentTransitionSum;
    const paymentStartDateFullKey = JSONMapper.getNestedProperty(flattenedSetPolicyTemplate, 'payment_start_date').keys.pop();
    flattenedSetPolicyTemplate[paymentStartDateFullKey] = paymentStartDate;
    const insurancePeriodFullKeys = JSONMapper.getNestedProperty(flattenedSetPolicyTemplate, 'insurance_period').keys;
    insurancePeriodFullKeys.forEach((fullKey) => {
      flattenedSetPolicyTemplate[fullKey] = insurancePeriod;
    });
    const startDateFullKey = JSONMapper.getNestedProperty(flattenedSetPolicyTemplate, 'start_date').keys.pop();
    flattenedSetPolicyTemplate[startDateFullKey] = datesInterval.startDate;
    const endDateFullKey = JSONMapper.getNestedProperty(flattenedSetPolicyTemplate, 'end_date').keys.pop();
    flattenedSetPolicyTemplate[endDateFullKey] = datesInterval.finishDate;
    const priceTypeFullKey = JSONMapper.getNestedProperty(flattenedSetPolicyTemplate, 'price_type').keys.pop();
    flattenedSetPolicyTemplate[priceTypeFullKey] = Randomizer.getRandomInteger(2, 1);

    const params = JSONMapper.unflattenJSON(flattenedSetPolicyTemplate);

    let { testClients } = JSONLoader;
    testClients = DataUtils.filterClients(testClients, { isJuridical: false });
    const { beneficiary, insured } = DataUtils
      .createRandomBeneficiaryAndInsuredStructures(testClients);
    params.client = insured;
    params.beneficiary = beneficiary;

    const response = await this.#API.post(JSONLoader.APIEndpoints.KASKO.setPolicy, params);

    return { requestBody: params, response };
  }

  async policies() {
    const params = {
      'order[id]': 'desc',
      'pagination[pageSize]': 15,
      page: 1,
    };

    return this.#API.get(JSONLoader.APIEndpoints.KASKO.policies, params);
  }

  /* eslint camelcase: ["error", {"properties": "never",
  ignoreDestructuring: true, allow: ["policy_number"]}] */
  async cancelPolicy(policy_number) {
    const params = {
      policy_number,
    };

    return this.#API.post(JSONLoader.APIEndpoints.KASKO.cancelPolicy, params);
  }

  async uploadFile(policyID, fileName) {
    const filePath = path.join(__dirname, JSONLoader.testData.filePathForUploadMethod);
    const fileObject = fs.readFileSync(filePath, 'utf8');
    const params = new FormData();
    params.append('content_type', 'multipart/form-data');
    params.append(
      'file',
      new Blob(
        [fileObject],
        { type: 'application/pdf' },
      ),
      `${fileName}.pdf`,
    );
    params.append('policy_id', policyID);
    params.append('file_name', fileName);

    return this.#API.post(JSONLoader.APIEndpoints.KASKO.uploadFile, params);
  }
}

module.exports = new KASKOAPI();
