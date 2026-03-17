const JSONLoader = require('../../main/utils/data/JSONLoader');
const TWBHelpers = require('../helpers/TWBHelpers');
const cascoAPI = require('../API/cascoAPI');

exports.cancelPolicy = function () { // eslint-disable-line func-names
  it('cancel policy', async function () { // eslint-disable-line func-names
    const policyResponse = await cascoAPI.getPolicy(this.policyId);
    const policyStatus = policyResponse.data.data.status.id;

    if (policyStatus !== JSONLoader.dictCasco.policy_status.cancelled) {
      const cancelPolicyResponse = await cascoAPI.cancelPolicy(this.policyId);
      cancelPolicyResponse.status.should.be.equal(200);
      cancelPolicyResponse.data.should.containSubset(
        JSONLoader.templateResponse.cancelPolicy,
      );
      cancelPolicyResponse.data.data.status.id
        .should.be.equal(JSONLoader.dictCasco.policy_status.cancelled);
    }

    if (JSONLoader.configData.setPolicyWaitingTWB) {
      await TWBHelpers.startSetPolicyWaiting();
    } else {
      await TWBHelpers.setCancellation(this.policyNumber);
    }

    await TWBHelpers.verifyCancelledPolicy(this.policyNumber);
  });
};
