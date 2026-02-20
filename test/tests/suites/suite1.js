const { suiteHooks, caseHooks, itHooks } = require('../../main/hooks');
const { issuePolicy } = require('../specs/issuePolicy');
const { setPolicyToTWB } = require('../specs/setPolicyToTWB');
const { cancelPolicy } = require('../specs/cancelPolicy');

describe('e2e - Set and cancel policy', function () { // eslint-disable-line func-names
  suiteHooks({ suiteTitle: this.title });

  describe('Happy case: 1 passenger vehicle, natural person resident holder and beneficiary', function () { // eslint-disable-line func-names
    caseHooks({ caseTitle: this.title });
    itHooks();

    issuePolicy();
    setPolicyToTWB();
    cancelPolicy();
  });
});
