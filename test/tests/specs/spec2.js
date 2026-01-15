const chai = require('chai/index.js');
const {
  Logger,
} = require('@amanat-qa/utils-backend');
const cascoAPI = require('../API/cascoAPI');
const JSONLoader = require('../../main/utils/data/JSONLoader');

chai.should();
chai.use(require('chai-subset'));
chai.use(require('chai-json-schema'));

describe('Casco API test suite. Vehicles', async () => {
  // eslint-disable-next-line func-names
  beforeEach(function () {
    if (!JSONLoader.configData.parallel) Logger.log(this.currentTest.title);
  });

  // eslint-disable-next-line func-names
  afterEach(function () {
    if (!JSONLoader.configData.parallel && this.currentTest.state) {
      Logger.log(this.currentTest.state);
    }
  });

  it('Test create policy draft:', async () => {
    const response = await cascoAPI.createPolicyDraft();
    response.status.should.be.equal(201);

    const policyStatus = response.data.data.status_id;

    response.data.should.containSubset(
      JSONLoader.templateResponse.createPolicy,
    );
    response.data.should.be.jsonSchema(JSONLoader.createPolicyResponseSchema);

    policyStatus.should.be.equal(JSONLoader.dictCasco.policy_status.draft);
  });

  it('Test delete policy:', async () => {
    const policyDraftResponse = await cascoAPI.createPolicyDraft();
    policyDraftResponse.status.should.be.equal(201);
    const policyId = policyDraftResponse.data.data.id;

    const deleteResponse = await cascoAPI.deletePolicy(policyId);
    deleteResponse.status.should.be.equal(200);
    deleteResponse.data.should.containSubset(
      JSONLoader.templateResponse.deletePolicy,
    );
  });

  it('Test get policy:', async () => {
    const policyDraftResponse = await cascoAPI.createPolicyDraft();
    policyDraftResponse.status.should.be.equal(201);
    const policyId = policyDraftResponse.data.data.id;

    const getPolicyResponse = await cascoAPI.getPolicy(policyId);
    getPolicyResponse.status.should.be.equal(200);
    getPolicyResponse.data.should.containSubset(
      JSONLoader.templateResponse.getPolicy,
    );
    getPolicyResponse.data.should.be.jsonSchema(JSONLoader.getPolicyResponseSchema);
  });
});
