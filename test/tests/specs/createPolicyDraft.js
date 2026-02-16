const cascoAPI = require('../API/cascoAPI');
const JSONLoader = require('../../main/utils/data/JSONLoader');

exports.createPolicyDraft = function () { // eslint-disable-line func-names
  it('create policy draft', async () => {
    const response = await cascoAPI.createPolicyDraft();
    response.status.should.be.equal(201);

    const policyStatus = response.data.data.status_id;

    response.data.should.containSubset(
      JSONLoader.templateResponse.createPolicyDraft,
    );
    response.data.should.be.jsonSchema(JSONLoader.createPolicyDraftResponseSchema);

    policyStatus.should.be.equal(JSONLoader.dictCasco.policy_status.draft);
  });
};
