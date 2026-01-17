const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../', '.env.test'), override: true });
const { BaseDB, Logger, DataUtils } = require('@amanat-qa/utils-backend');
const JSONLoader = require('../../main/utils/data/JSONLoader');
const Policy = require('./models/policy');

class OnesDB extends BaseDB {
  constructor() {
    super(process.env.DB_ONES_DATABASE);
    this.Policy = Policy(this.sequelize);
  }

  /* eslint camelcase: ["error", {allow: ["policy_number"]}] */
  async waitStatusCodeUpdate(policy_number) {
    Logger.log('[inf] ▶ wait policy status update');

    const target = 'status';
    while (true) { // eslint-disable-line no-constant-condition
      // eslint-disable-next-line no-await-in-loop
      const record = await this.Policy.findOne({
        where: { policy_number },
        attributes: [target],
      });

      if (record?.[target] === JSONLoader.dictOnes.policy_status.issued) {
        break;
      }
    }
  }

  async getOnesContent(policy_number) {
    const target = 'request_body';
    const record = await this.Policy.findOne({
      where: { policy_number },
      attributes: [target],
    });

    const onesContent = record?.[target];
    DataUtils.saveToJSON({ onesContent });
    return onesContent;
  }
}

module.exports = new OnesDB();
