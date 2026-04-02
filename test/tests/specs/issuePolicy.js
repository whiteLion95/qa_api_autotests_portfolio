const { Logger, Randomizer, TimeUtils } = require('@amanat-qa/utils-backend');
const cascoAPI = require('../API/cascoAPI');
const JSONLoader = require('../../main/utils/data/JSONLoader');

exports.issuePolicy = function () { // eslint-disable-line func-names
  it('issue policy', async function () { // eslint-disable-line func-names
    Logger.log('Creating policy draft...');
    const createPolicyDraftResponse = await cascoAPI.createPolicyDraft();
    createPolicyDraftResponse.status.should.be.equal(201);
    const policyId = createPolicyDraftResponse.data.data.id;

    Logger.log('Creating vehicle for policy...');
    const vehiclePayload = JSONLoader.vehiclePayloads.passenger[0];
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
      tariff_value: randomTariff.value,
    };
    const setTariffResponse = await cascoAPI
      .updatePolicyVehicle(policyId, vehicleId, setTariffPayload);
    setTariffResponse.status.should.be.equal(200);

    Logger.log('Creating client for policy...');
    const testClientPayload = JSONLoader.createClientPayloads.natural_person_residents[0];
    const createClientResponse = await cascoAPI.createClient(policyId, testClientPayload);
    createClientResponse.status.should.be.equal(200);

    Logger.log('Creating beneficiary for policy...');
    const beneficiaryPayload = JSONLoader.createClientPayloads.natural_person_residents[1];
    beneficiaryPayload.type_id = JSONLoader.dictCasco.client_type.beneficiary_both;
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
    const randomInsurancePeriodIndex = Randomizer
      .getRandomInteger(insurancePeriodsResponse.data.data.length, 1);
    const randomInsurancePeriod = insurancePeriodsResponse
      .data.data[randomInsurancePeriodIndex - 1];
    const insurancePeriodInMonths = randomInsurancePeriod.months_value;
    const { startDate, finishDate } = TimeUtils
      .getDatesInterval(insurancePeriodInMonths, 'months');

    const paymentPlanId = JSONLoader.dictCasco.payment_plan.onetime;
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
      insurance_period_id: randomInsurancePeriod.id,
      start_date: startDate,
      end_date: finishDate,
      signatory_holder: JSONLoader.signatoryHolderParams,
      signatory_insurer: JSONLoader.signatoryInsurerParams,
    };
    const issuePolicyResponse = await cascoAPI.issuePolicy(policyId, issuePolicyPayload);
    issuePolicyResponse.status.should.be.equal(200);

    // Сохраняем id и номер полиса для дальнейшего использования в тестах в пределах suite1
    this.policyId = policyId;
    this.policyNumber = issuePolicyResponse.data.data.number;
  });
};
