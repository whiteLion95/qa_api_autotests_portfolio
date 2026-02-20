const { Randomizer } = require('@amanat-qa/utils-backend');
const cascoAPI = require('../API/cascoAPI');
const JSONLoader = require('../../main/utils/data/JSONLoader');

exports.setTariffForPolicyVehicle = function () { // eslint-disable-line func-names
  it('set tariff for policy vehicle', async function () { // eslint-disable-line func-names
    const tariffs = await cascoAPI.getTariffs();
    tariffs.status.should.be.equal(200);
    const randomInt = Randomizer.getRandomInteger(tariffs.data.data.data.length - 1);
    const randomTariff = tariffs.data.data.data[randomInt];

    const payload = {
      is_new: 1,
      market_value: this.vehicle.pivot.insurance_sum,
      insurance_sum: this.vehicle.pivot.insurance_sum,
      tariff_id: randomTariff.id,
    };

    const response = await cascoAPI.updatePolicyVehicle(this.policyId, this.vehicle.id, payload);

    response.status.should.be.equal(200);
    response.data.should.containSubset(JSONLoader.templateResponse.updatePolicyVehicle);
    response.data.should.be.jsonSchema(JSONLoader.setTariffForPolicyVehicleResponseSchema);
  });
};
