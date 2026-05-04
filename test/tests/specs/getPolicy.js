const cascoAPI = require('../API/cascoAPI');
const JSONLoader = require('../../main/utils/data/JSONLoader');

exports.getPolicy = function () { // eslint-disable-line func-names
  it('get policy', async function () { // eslint-disable-line func-names
    const getPolicyResponse = await cascoAPI.getPolicy(this.policyId);
    getPolicyResponse.status.should.be.equal(200);
    getPolicyResponse.data.should.containSubset(
      JSONLoader.templateResponse.getPolicy,
    );
    getPolicyResponse.data.should.be.jsonSchema(JSONLoader.getPolicyResponseSchema);
  });
};
