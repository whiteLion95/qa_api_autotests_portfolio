const cascoAPI = require('../API/cascoAPI');
const JSONLoader = require('../../main/utils/data/JSONLoader');

exports.createPolicyDraft = function () { // eslint-disable-line func-names, no-unused-vars
  it('create policy draft', async function () { // eslint-disable-line func-names, prefer-arrow-callback
    const response = await cascoAPI.createPolicyDraft();
    response.status.should.be.equal(201);

    const policyStatus = response.data.data.status_id;

    response.data.should.containSubset(
      JSONLoader.templateResponse.createPolicy,
    );
    response.data.should.be.jsonSchema(JSONLoader.createPolicyResponseSchema);

    policyStatus.should.be.equal(JSONLoader.dictCasco.policy_status.draft);
  });
};
