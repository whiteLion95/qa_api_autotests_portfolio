const { TimeUtils } = require('@amanat-qa/utils-backend');
const TWBAPI = require('../API/TWBAPI');
const onesDB = require('../DB/onesDB');
const onesAPI = require('../API/onesAPI');
const JSONLoader = require('../../main/utils/data/JSONLoader');

class TWBHelpers {
  static async startSetPolicyWaiting() {
    const response = await TWBAPI.startSetPolicyWaiting();
    response.status.should.be.equal(200);
    response.data.should.containSubset(
      JSONLoader.templateResponse.startSetPolicyWaiting,
    );
  }

  static async setPolicyDirectly(policyNumber) {
    const onesContent = await onesDB.getOnesContent(policyNumber);
    const response = await TWBAPI.setPolicy(onesContent);
    response.status.should.be.equal(200);
    response.data.should.containSubset(
      JSONLoader.templateResponse.setPolicyTWB,
    );
    response.data.message.should.be.equal(
      `Договор №${policyNumber} от ${TimeUtils.today()} успешно создан!`,
    );
  }

  static async verifyIssuedPolicy(policyNumber) {
    const getPolicyResponse = JSONLoader.configData.getPolicyTWB
      ? await TWBAPI.getPolicy(policyNumber)
      : await onesAPI.getPolicy(policyNumber);
    getPolicyResponse.status.should.be.equal(200);
    getPolicyResponse.data.contracts[0].policy_status.should.be.equal(
      JSONLoader.dictOnes.policy_status.issued,
    );
  }

  static async verifyCancelledPolicy(policyNumber) {
    const getPolicyResponse = JSONLoader.configData.getPolicyTWB
      ? await TWBAPI.getPolicy(policyNumber)
      : await onesAPI.getPolicy(policyNumber);
    getPolicyResponse.status.should.be.equal(422);
    getPolicyResponse.data.should
      .deep.equal(JSONLoader.templateResponse.getCancelledPolicyTWB);
  }
}

module.exports = TWBHelpers;
