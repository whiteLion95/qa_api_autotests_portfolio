/* eslint-disable no-unused-vars */
const chai = require('chai/index.js');
const moment = require('moment');
const {
  Logger,
  DataUtils,
  Randomizer,
  DateFormats,
} = require('@amanat-qa/utils-backend');
const onesDB = require('../DB/onesDB');
const TWBAPI = require('../API/TWBAPI');
const onesAPI = require('../API/onesAPI');
const ESBDAPI = require('../API/ESBDAPI');
const cascoAPI = require('../API/CascoAPI');
const authAPI = require('../API/authAPI');
const JSONLoader = require('../../main/utils/data/JSONLoader');

chai.should();
chai.use(require('chai-subset'));
chai.use(require('chai-json-schema'));

const today = moment().format(DateFormats.DMY);

const setPolicyTWB = async (policyNumber) => {
  if (JSONLoader.configData.setPolicyWaitingTWB) {
    const response = await TWBAPI.startSetPolicyWaiting();
    response.status.should.be.equal(200);
    response.data.should.containSubset(
      JSONLoader.templateResponse.startSetPolicyWaiting,
    );
  } else {
    const onesContent = await onesDB.getOnesContent(policyNumber);
    const response = await TWBAPI.setPolicy(onesContent);
    response.status.should.be.equal(200);
    response.data.should.containSubset(
      JSONLoader.templateResponse.setPolicyTWB,
    );
    response.data.message.should.be.equal(
      `Договор №${policyNumber} от ${today} успешно создан!`,
    );
  }
};

const getIssuedPolicy = async (policyNumber) => {
  const getPolicyResponse = JSONLoader.configData.getPolicyTWB
    ? await TWBAPI.getPolicy(policyNumber)
    : await onesAPI.getPolicy(policyNumber);
  getPolicyResponse.status.should.be.equal(200);
  getPolicyResponse.data.contracts[0].policy_status.should.be.equal(
    JSONLoader.dictOnes.policy_status.issued,
  );
  return getPolicyResponse;
};

describe('Casco API test suite. Policy:', async () => {
  // eslint-disable-next-line func-names
  beforeEach(function () {
    if (!JSONLoader.configData.parallel) Logger.log(this.currentTest.title);
  });

  // eslint-disable-next-line func-names
  afterEach(function () {
    if (!JSONLoader.configData.parallel && this.currentTest.state) {
      Logger.log(this.currentTest.state);
    }
  });

  // TODO: перенести закомментированные тесты в отдельные спеки

  // it('Test create policy draft:', async () => {
  //   const response = await cascoAPI.createPolicyDraft();
  //   response.status.should.be.equal(201);

  //   const policyStatus = response.data.data.status_id;

  //   response.data.should.containSubset(
  //     JSONLoader.templateResponse.createPolicy,
  //   );
  //   response.data.should.be.jsonSchema(JSONLoader.createPolicyResponseSchema);

  //   policyStatus.should.be.equal(JSONLoader.dictCasco.policy_status.draft);

  //   // ВОПРОС: нужно ли проверять, что задались верные значения
  //   // user_id, agent_id, manager_id, subagent_id?
  // });

  // it('Test create vehicle for policy:', async () => {
  //   const policy = await cascoAPI.createPolicyDraft();
  //   const policyId = policy.data.data.id;

  //   const vehiclePayload = JSONLoader.testCars.passenger;
  //   const response = await cascoAPI.createVehicle(policyId, vehiclePayload);

  //   response.status.should.be.equal(201);
  //   response.data.should.containSubset(JSONLoader.templateResponse.createVehicle);
  //   response.data.should.be.jsonSchema(JSONLoader.createVehicleResponseSchema);
  // });

  // it('Test set tariff for policy vehicle:', async () => {
  //   const policy = await cascoAPI.createPolicyDraft();
  //   const policyId = policy.data.data.id;

  //   const vehiclePayload = JSONLoader.testCars.passenger;
  //   const vehicle = await cascoAPI.createPolicyVehicle(policyId, vehiclePayload);
  //   const vehicleId = vehicle.data.data.id;

  //   const tariffs = await cascoAPI.getTariffs();
  //   tariffs.status.should.be.equal(200);
  //   const randomInt = Randomizer.getRandomInteger(tariffs.data.data.data.length - 1);
  //   const randomTariff = tariffs.data.data.data[randomInt];

  //   const payload = {
  //     is_new: 1,
  //     market_value: vehicle.data.data.pivot.insurance_sum,
  //     insurance_sum: vehicle.data.data.pivot.insurance_sum,
  //     tariff_id: randomTariff.id,
  //   };

  //   const response = await cascoAPI.updatePolicyVehicle(policyId, vehicleId, payload);

  //   response.status.should.be.equal(200);
  //   response.data.should.containSubset(JSONLoader.templateResponse.updatePolicyVehicle);
  //   response.data.should.be.jsonSchema(JSONLoader.setTariffForPolicyVehicleResponseSchema);
  // });

  it('Test set policy', async () => {
    Logger.log('Creating policy draft...');
    const createPolicyDraftResponse = await cascoAPI.createPolicyDraft();
    createPolicyDraftResponse.status.should.be.equal(201);
    const policyId = createPolicyDraftResponse.data.data.id;

    Logger.log('Creating vehicle for policy...');
    const vehiclePayload = JSONLoader.testCars.passenger;
    const createVehicleResponse = await cascoAPI.createPolicyVehicle(policyId, vehiclePayload);
    createVehicleResponse.status.should.be.equal(201);
    const vehicleId = createVehicleResponse.data.data.id;

    Logger.log('Setting tariff for policy vehicle...');
    const tariffs = await cascoAPI.getTariffs();
    tariffs.status.should.be.equal(200);
    const randomInt = Randomizer.getRandomInteger(tariffs.data.data.data.length - 1);
    const randomTariff = tariffs.data.data.data[randomInt];
    const setTariffPayload = {
      is_new: 1,
      market_value: createVehicleResponse.data.data.pivot.insurance_sum,
      insurance_sum: createVehicleResponse.data.data.pivot.insurance_sum,
      tariff_id: randomTariff.id,
    };
    const setTariffResponse = await cascoAPI
      .updatePolicyVehicle(policyId, vehicleId, setTariffPayload);
    setTariffResponse.status.should.be.equal(200);

    Logger.log('Creating client for policy...');
    const testClientPayload = JSONLoader.createClientPayloads.policyHolder;
    const createClientResponse = await cascoAPI.createClient(policyId, testClientPayload);
    createClientResponse.status.should.be.equal(200);

    Logger.log('Creating beneficiary for policy...');
    const beneficiaryPayload = JSONLoader.createClientPayloads.beneficiary;
    const createBeneficiaryResponse = await cascoAPI.createClient(policyId, beneficiaryPayload);
    createBeneficiaryResponse.status.should.be.equal(200);

    Logger.log('Creating payment...');
    const getPolicyResponse = await cascoAPI.getPolicy(policyId);
    getPolicyResponse.status.should.be.equal(200);
    const {
      premium,
      program: { id: programId },
    } = getPolicyResponse.data.data;

    const insurancePeriodsResponse = await cascoAPI.getInsurancePeriods({ program_id: programId });
    insurancePeriodsResponse.status.should.be.equal(200);
    const randomInsurancePeriodId = Randomizer
      .getRandomInteger(insurancePeriodsResponse.data.data.length, 1);
    const insurancePeriodInMonths = insurancePeriodsResponse
      .data.data[randomInsurancePeriodId - 1].months_value;
    const startDateMoment = moment().add(1, 'days');
    const startDate = startDateMoment.format(DateFormats.DMY);
    const endDate = startDateMoment.clone()
      .add(insurancePeriodInMonths, 'months')
      .add(-1, 'days')
      .format(DateFormats.DMY);

    const paymentPlanId = JSONLoader.dictCasco.payment_plan.full;
    const paymentScheduleResponse = await cascoAPI
      .getPaymentSchedule(policyId, startDate, paymentPlanId);
    paymentScheduleResponse.status.should.be.equal(200);

    const paymentPayload = {
      payment_plan_id: paymentPlanId,
      schedule: [
        {
          date: paymentScheduleResponse.data.data[0].date,
          amount: premium,
        },
      ],
    };
    const createPaymentResponse = await cascoAPI.createPayment(policyId, paymentPayload);
    createPaymentResponse.status.should.be.equal(201);

    Logger.log('Issuing policy...');
    const issuePolicyPayload = {
      insurance_period_id: randomInsurancePeriodId,
      start_date: startDate,
      end_date: endDate,
    };
    const issuePolicyResponse = await cascoAPI.issuePolicy(policyId, issuePolicyPayload);
    issuePolicyResponse.status.should.be.equal(200);

    const policyNumber = issuePolicyResponse.data.data.number;
    Logger.log(`Setting policy with policy_number: ${policyNumber} in TWB...`);
    await setPolicyTWB(policyNumber);
  });
});
