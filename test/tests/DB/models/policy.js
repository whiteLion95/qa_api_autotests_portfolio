const { DataTypes } = require('sequelize');
const { baseModel } = require('@amanat-qa/utils-backend');

module.exports = (sequelize) => sequelize.define(
  'Policy',
  {
    ...baseModel.attributes,
    policy_number: { type: DataTypes.STRING(255), allowNull: true },
    global_id: { type: DataTypes.STRING(255), allowNull: true },
    contract_id: { type: DataTypes.STRING(255), allowNull: true },
    request_body: { type: DataTypes.JSON, allowNull: true },
    response_body: { type: DataTypes.JSON, allowNull: true },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    in_use: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    errors: { type: DataTypes.TEXT, allowNull: true },
    sent_attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    views: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  baseModel.getOptions({ tableName: 'policies', withSoftDelete: true }),
);
