const { suiteHooks, caseHooks, itHooks } = require('../../main/hooks');
const JSONLoader = require('../../main/utils/data/JSONLoader');

describe('Test suite: Set and cancel policy', function () { // eslint-disable-line func-names
  suiteHooks({ suiteTitle: this.title });

  JSONLoader.testData.vehicleCounts.forEach((vehicleCount) => {
    describe(`Test case: vehicle count = ${vehicleCount}`, function () { // eslint-disable-line func-names
      caseHooks({ caseTitle: this.title });
      itHooks();

      // TODO: set and cancel policy test cases
    });
  });
});
