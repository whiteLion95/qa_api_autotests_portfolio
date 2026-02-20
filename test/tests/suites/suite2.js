const { suiteHooks, caseHooks, itHooks } = require('../../main/hooks');
const { createPolicyDraft } = require('../specs/createPolicyDraft');
const { createVehicleForPolicy } = require('../specs/createVehicleForPolicy');
const { deletePolicy } = require('../specs/deletePolicy');
const { getPolicy } = require('../specs/getPolicy');
const { setTariffForPolicyVehicle } = require('../specs/setTariffForPolicyVehicle');

describe('Test suite: Set and cancel policy', function () { // eslint-disable-line func-names
  suiteHooks({ suiteTitle: this.title });

  describe('Functional tests', function () { // eslint-disable-line func-names
    caseHooks({ caseTitle: this.title });
    itHooks();

    createPolicyDraft();
    createVehicleForPolicy();
    deletePolicy();
    getPolicy();
    setTariffForPolicyVehicle();
  });
});
