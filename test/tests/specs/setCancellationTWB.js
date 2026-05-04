const TWBHelpers = require('../helpers/TWBHelpers');
const JSONLoader = require('../../main/utils/data/JSONLoader');

exports.setCancellationTWB = function () { // eslint-disable-line func-names
  it('set cancellation TWB', async function () { // eslint-disable-line func-names
    if (JSONLoader.configData.setPolicyWaitingTWB) {
      await TWBHelpers.startSetPolicyWaiting();
    } else {
      await TWBHelpers.setCancellationDirectly(this.policyNumber);
    }

    await TWBHelpers.verifyCancelledPolicy(this.policyNumber);
  });
};
