const chai = require('chai');
const moment = require('moment');
chai.use(require('chai-subset'));
chai.use(require('chai-json-schema'));
const onesDB = require('../DB/onesDB');
const TWBAPI = require('../API/TWBAPI');
const onesAPI = require('../API/onesAPI');
const ESBDAPI = require('../API/ESBDAPI');
const KASKOAPI = require('../API/KASKOAPI');
const Logger = require('../../main/utils/log/logger');
const DataUtils = require('../../main/utils/data/dataUtils');
const JSONLoader = require('../../main/utils/data/JSONLoader');
const Randomizer = require('../../main/utils/random/randomizer');

chai.should();
const today = moment().format(JSONLoader.testData.datesFormatDMY);
const setPolicyTWB = async (policyNumber) => {
  if (JSONLoader.configData.setPolicyWaitingTWB) {
    const response = await TWBAPI.startSetPolicyWaiting();
    response.status.should.be.equal(200);
    response.data.should.containSubset(JSONLoader.templateResponse.startSetPolicyWaiting);
  } else {
    const onesContent = await onesDB.getOnesContent(policyNumber);
    const response = await TWBAPI.setPolicy(onesContent);
    response.status.should.be.equal(200);
    response.data.should.containSubset(JSONLoader.templateResponse.setPolicyTWB);
    response.data.message.should.be.equal(`Договор №${policyNumber} от ${today} успешно создан!`);
  }
};

const getIssuedPolicy = async (policyNumber) => {
  const getPolicyResponse = JSONLoader.configData.getPolicyTWB
    ? await TWBAPI.getPolicy(policyNumber)
    : await onesAPI.getPolicy(policyNumber);
  getPolicyResponse.status.should.be.equal(200);
  getPolicyResponse.data.contracts[0].policy_status
    .should.be.equal(JSONLoader.dictOnes.policy_status.issued);
  return getPolicyResponse;
};

describe('KASKO API test suite:', async () => {
  beforeEach(function () { // eslint-disable-line func-names
    if (!JSONLoader.configData.parallel) Logger.log(this.currentTest.title);
  });

  it('Test set-policy:', async () => {
    const issueTariffsResponse = await KASKOAPI.issueTariffs();
    issueTariffsResponse.status.should.be.equal(200);
    const tariffs = issueTariffsResponse.data.data.pop();
    const filteredTariffs = tariffs.filter((tariff) => (KASKOAPI.user.login.includes('tugelbassov')
      ? tariff.agent_commission === 0
      : tariff.agent_commission !== 0));
    const randomTariff = filteredTariffs[Randomizer.getRandomInteger(filteredTariffs.length - 1)];
    const setPolicyTemplate = DataUtils.mapTariffToSetPolicy(randomTariff);
    // eslint-disable-next-line prefer-const
    let { requestBody, response } = await KASKOAPI.setPolicy(setPolicyTemplate);
    response.status.should.be.equal(200);
    response.data.should.containSubset(JSONLoader.templateResponse.setPolicy);
    if (global.withESBD) {
      response.data.should.be.jsonSchema(JSONLoader.setPolicyResponseSchema);
    } else {
      response.data.should.be.jsonSchema(JSONLoader.setPolicyWithoutESBDResponseSchema);
    }

    const policyNumber = response.data.data.policy_number;
    await onesDB.waitStatusCodeUpdate(policyNumber);
    await setPolicyTWB(policyNumber);
    const getPolicyResponse = await getIssuedPolicy(policyNumber);
    const getContractDsAutoByNumberResponse = await ESBDAPI
      .getContractDsAutoByNumber(policyNumber);
    if (global.withESBD) {
      getContractDsAutoByNumberResponse.status.should.be.equal(200);
    } else {
      getContractDsAutoByNumberResponse.status.should.be.equal(404);
    }

    let mappedData = await DataUtils.mapRequestToOnes(
      getPolicyResponse.data,
      requestBody,
    );
    getPolicyResponse.data.should.containSubset(mappedData);
    if (global.withESBD) {
      mappedData = DataUtils.mapESBDToOnes(
        getPolicyResponse.data,
        getContractDsAutoByNumberResponse.data,
      );
      getPolicyResponse.data.should.containSubset(mappedData);
    }
  });

  it('Test cancel-policy:', async () => {
    const issueTariffsResponse = await KASKOAPI.issueTariffs();
    issueTariffsResponse.status.should.be.equal(200);
    const tariffs = issueTariffsResponse.data.data.pop();
    const filteredTariffs = tariffs.filter((tariff) => (KASKOAPI.user.login.includes('tugelbassov')
      ? tariff.agent_commission === 0
      : tariff.agent_commission !== 0));
    const randomTariff = filteredTariffs[Randomizer.getRandomInteger(filteredTariffs.length - 1)];
    const setPolicyTemplate = DataUtils.mapTariffToSetPolicy(randomTariff);
    let { response } = await KASKOAPI.setPolicy(setPolicyTemplate);
    response.status.should.be.equal(200);
    const policyNumber = response.data.data.policy_number;
    await onesDB.waitStatusCodeUpdate(policyNumber);
    await setPolicyTWB(policyNumber);
    await getIssuedPolicy(policyNumber);
    response = await KASKOAPI.cancelPolicy(policyNumber);
    if (global.withESBD) {
      response.status.should.be.equal(200);
      response.data.should.be.jsonSchema(JSONLoader.cancelPolicyResponseSchema)
        .and.containSubset(JSONLoader.templateResponse.cancelPolicy);
      response.data.data.policy_number.should.be.equal(policyNumber);
      if (JSONLoader.configData.setPolicyWaitingTWB) {
        response = await TWBAPI.startSetPolicyWaiting();
        response.status.should.be.equal(200);
        response.data.should.containSubset(JSONLoader.templateResponse.startSetPolicyWaiting);
      } else {
        response = await TWBAPI.setCancellation(policyNumber);
        response.status.should.be.equal(200);
        response.data.should.containSubset(JSONLoader.templateResponse.setCancellationTWB);
        response.data.message
          .should.be.equal(`Договор №${policyNumber} от ${today} успешно аннулирован!`);
      }

      if (JSONLoader.configData.getPolicyTWB) {
        response = await TWBAPI.getPolicy(policyNumber);
        response.status.should.be.equal(422);
        response.data.errors.contracts[0]
          .should.be.equal(JSONLoader.dictOnes.policy_status.cancelled);
      } else {
        response = await onesAPI.getPolicy(policyNumber);
        response.status.should.be.equal(422);
        response.data.error.errors.contracts[0]
          .should.be.equal(JSONLoader.dictOnes.policy_status.cancelled);
      }
    } else {
      response.status.should.be.equal(500);
      await getIssuedPolicy(policyNumber);
    }

    response = await ESBDAPI.getContractDsAutoByNumber(policyNumber);
    if (global.withESBD) {
      response.status.should.be.equal(200);
      response.data.data
        .GetContractDsAuto_By_NumberResult.CONTRACT_DS_AUTO.RESCINDING_REASON_ID
        .should.be.equal(JSONLoader.dictESBD.policy_status.cancelled);
    } else {
      response.status.should.be.equal(404);
    }
  });

  afterEach(function () { // eslint-disable-line func-names
    if (!JSONLoader.configData.parallel
      && this.currentTest.state) Logger.log(this.currentTest.state);
  });
});
