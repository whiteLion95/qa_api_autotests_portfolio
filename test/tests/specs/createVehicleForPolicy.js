const JSONLoader = require('../../main/utils/data/JSONLoader');
const cascoAPI = require('../API/cascoAPI');

exports.createVehicleForPolicy = function (policyId) { // eslint-disable-line func-names
  it('create vehicle for policy', async () => {
    const vehiclePayload = JSONLoader.vehiclePayloads.passenger[0];
    const response = await cascoAPI.createVehicle(policyId, vehiclePayload);

    response.status.should.be.equal(201);
    response.data.should.containSubset(JSONLoader.templateResponse.createVehicle);
    response.data.should.be.jsonSchema(JSONLoader.createVehicleResponseSchema);
  });
};
