const chai = require('chai');
chai.use(require('chai-subset'));
chai.use(require('chai-json-schema'));
const docsAPI = require('../API/docsAPI');
const KASKOAPI = require('../API/KASKOAPI');
const dictionaryAPI = require('../API/dictionaryAPI');
const Logger = require('../../main/utils/log/logger');
const JSONLoader = require('../../main/utils/data/JSONLoader');
const Randomizer = require('../../main/utils/random/randomizer');

chai.should();

describe('KASKO API test suite:', async () => {
  beforeEach(function () { // eslint-disable-line func-names
    if (!JSONLoader.configData.parallel) Logger.log(this.currentTest.title);
  });

  it('Test car-marks:', async () => {
    const response = await dictionaryAPI.carMarks();
    response.status.should.be.equal(200);
    response.data.should.be.jsonSchema(JSONLoader.carMarksResponseSchema);
  });

  it('Test car-models:', async () => {
    const response = await dictionaryAPI.carModels();
    response.status.should.be.equal(200);
    response.data.should.be.jsonSchema(JSONLoader.carModelsResponseSchema);
  });

  it('Test get-car-average-price:', async () => {
    const response = await KASKOAPI.getCarAveragePrice();
    response.status.should.be.equal(200);
    const title = `${JSONLoader.templateSetPolicy.cars[0].mark} ${JSONLoader.templateSetPolicy.cars[0].model} ${JSONLoader.templateSetPolicy.cars[0].NYEAR} г.`;
    response.data.should.be.jsonSchema(JSONLoader.getCarAveragePriceResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.getCarAveragePrice);
    response.data.data.title.toLowerCase().should.be.equal(title.toLocaleLowerCase());
  });

  it('Test issue/tariffs:', async () => {
    const response = await KASKOAPI.issueTariffs();
    response.status.should.be.equal(200);
    response.data.should.be.jsonSchema(JSONLoader.issueTariffsResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.issueTariffs);
  });

  it('Test get-car:', async () => {
    const response = await KASKOAPI.getCar();
    response.status.should.be.equal(200);
    response.data.should.containSubset(JSONLoader.templateResponse.getCar);
    if (global.withESBD) {
      response.data.should.be.jsonSchema(JSONLoader.getCarResponseSchema);
    } else {
      response.data.should.be.jsonSchema(JSONLoader.getCarWithoutESBDResponseSchema);
    }
    response.data.data.reg_num.should.be.equal(JSONLoader.templateSetPolicy.cars[0].number);
    response.data.data.reg_cert_num
      .should.be.equal(JSONLoader.templateSetPolicy.cars[0].passport_number);
  });

  it('Test policies:', async () => {
    const response = await KASKOAPI.policies();
    response.status.should.be.equal(200);
    response.data.should.be.jsonSchema(JSONLoader.policiesResponseSchema);
  });

  it('Test upload-file:', async () => {
    let response = await KASKOAPI.policies();
    response.status.should.be.equal(200);
    const validPolicies = response.data.data
      .filter((policy) => policy.ones_status === JSONLoader.dictOnes.policy_status.issued);
    const randomPolicy = validPolicies[Randomizer.getRandomInteger(validPolicies.length - 1)];
    const fileName = Randomizer
      .getRandomString(true, false, false, false, false, 2, 10);

    response = await KASKOAPI
      .uploadFile(randomPolicy.id, fileName);
    response.status.should.be.equal(200);
    response.data.should.be.jsonSchema(JSONLoader.uploadFileResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.uploadFile);
    response.data.data.name.should.include(`${randomPolicy.policy_number}_${fileName}`);

    const responseGetFile = await docsAPI.getFile(randomPolicy.policy_number, fileName);
    responseGetFile.status.should.be.equal(200);
    responseGetFile.data.should.be.jsonSchema(JSONLoader.getFileResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.getFile);
    responseGetFile.data.data.path.should.be.equal(response.data.data.path);
    responseGetFile.data.message.should.be.equal(response.data.data.path);
    responseGetFile.data.data.file.should.have.length.above(0);
  });

  afterEach(function () { // eslint-disable-line func-names
    if (!JSONLoader.configData.parallel
      && this.currentTest.state) Logger.log(this.currentTest.state);
  });
});
