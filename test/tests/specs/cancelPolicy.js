const JSONLoader = require('../../main/utils/data/JSONLoader');
const TWBHelpers = require('../helpers/TWBHelpers');
const cascoAPI = require('../API/cascoAPI');

exports.cancelPolicy = function () { // eslint-disable-line func-names, no-unused-vars
  it('Test: cancel policy', async function () { // eslint-disable-line func-names, prefer-arrow-callback
    await TWBHelpers.waitingCleanUp();

    const cancelPolicyResponse = await cascoAPI.cancelPolicy(this.policyId);
    cancelPolicyResponse.status.should.be.equal(200);
    cancelPolicyResponse.data.should.containSubset(
      JSONLoader.templateResponse.cancelPolicy,
    );
    cancelPolicyResponse.data.data.status.id
      .should.be.equal(JSONLoader.dictCasco.policy_status.cancelled);

    await TWBHelpers.startSetPolicyWaiting();
    await TWBHelpers.verifyCancelledPolicy(this.policyNumber);
  });
};
