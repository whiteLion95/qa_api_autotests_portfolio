const cascoAPI = require('../API/cascoAPI');
const JSONLoader = require('../../main/utils/data/JSONLoader');

exports.deletePolicy = function () { // eslint-disable-line func-names
  it('delete policy', async () => {
    const policyDraftResponse = await cascoAPI.createPolicyDraft();
    policyDraftResponse.status.should.be.equal(201);
    const policyId = policyDraftResponse.data.data.id;

    const deleteResponse = await cascoAPI.deletePolicy(policyId);
    deleteResponse.status.should.be.equal(200);
    deleteResponse.data.should.containSubset(
      JSONLoader.templateResponse.deletePolicy,
    );
  });
};
