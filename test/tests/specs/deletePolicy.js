const cascoAPI = require('../API/cascoAPI');
const JSONLoader = require('../../main/utils/data/JSONLoader');

exports.deletePolicy = function () { // eslint-disable-line func-names
  it('delete policy', async function () { // eslint-disable-line func-names
    const deleteResponse = await cascoAPI.deletePolicy(this.policyId);
    deleteResponse.status.should.be.equal(200);
    deleteResponse.data.should.containSubset(
      JSONLoader.templateResponse.deletePolicy,
    );
  });
};
