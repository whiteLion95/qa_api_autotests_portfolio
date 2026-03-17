const TWBHelpers = require('../helpers/TWBHelpers');
const JSONLoader = require('../../main/utils/data/JSONLoader');

exports.setCancellationToTWB = function () { // eslint-disable-line func-names
  it('set cancellation to TWB', async function () { // eslint-disable-line func-names
    if (JSONLoader.configData.setPolicyWaitingTWB) {
      await TWBHelpers.startSetPolicyWaiting();
    } else {
      await TWBHelpers.setCancellation(this.policyNumber);
    }

    await TWBHelpers.verifyCancelledPolicy(this.policyNumber);
  });
};
