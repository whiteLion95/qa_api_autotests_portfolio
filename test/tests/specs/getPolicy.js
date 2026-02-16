const cascoAPI = require('../API/cascoAPI');
const JSONLoader = require('../../main/utils/data/JSONLoader');

exports.getPolicy = function () { // eslint-disable-line func-names
  it('get policy', async () => {
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
};
