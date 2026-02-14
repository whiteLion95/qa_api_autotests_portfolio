const onesDB = require('../DB/onesDB');
const TWBHelpers = require('../helpers/TWBHelpers');
const JSONLoader = require('../../main/utils/data/JSONLoader');

exports.setPolicyToTWB = function () { // eslint-disable-line func-names
  it('set policy to TWB', async function () { // eslint-disable-line func-names, prefer-arrow-callback
    if (JSONLoader.configData.setPolicyWaitingTWB) {
      await onesDB.waitStatusCodeUpdate(this.policyNumber);
      await TWBHelpers.startSetPolicyWaiting();
    } else {
      await TWBHelpers.setPolicyDirectly(this.policyNumber);
    }
    await TWBHelpers.verifyIssuedPolicy(this.policyNumber);
  });
};
