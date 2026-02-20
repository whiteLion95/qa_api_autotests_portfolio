const cascoAPI = require('../API/cascoAPI');
const JSONLoader = require('../../main/utils/data/JSONLoader');

exports.createPolicyDraft = function () { // eslint-disable-line func-names
  it('create policy draft', async function () { // eslint-disable-line func-names
    const response = await cascoAPI.createPolicyDraft();
    response.status.should.be.equal(201);

    const policyStatus = response.data.data.status_id;

    response.data.should.containSubset(
      JSONLoader.templateResponse.createPolicyDraft,
    );
    response.data.should.be.jsonSchema(JSONLoader.createPolicyDraftResponseSchema);

    policyStatus.should.be.equal(JSONLoader.dictCasco.policy_status.draft);

    // Сохраняем id полиса для дальнейшего использования в тестах в пределах suite2
    this.policyId = response.data.data.id;
  });
};
