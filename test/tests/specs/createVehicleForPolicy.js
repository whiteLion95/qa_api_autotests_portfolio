const JSONLoader = require('../../main/utils/data/JSONLoader');
const cascoAPI = require('../API/cascoAPI');

exports.createVehicleForPolicy = function () { // eslint-disable-line func-names
  it('create vehicle for policy', async function () { // eslint-disable-line func-names
    const vehiclePayload = JSONLoader.vehiclePayloads.passenger[0];
    const response = await cascoAPI.createPolicyVehicle(this.policyId, vehiclePayload);

    response.status.should.be.equal(201);
    response.data.should.containSubset(JSONLoader.templateResponse.createVehicle);
    response.data.should.be.jsonSchema(JSONLoader.createVehicleResponseSchema);

    this.vehicle = response.data.data;
  });
};
