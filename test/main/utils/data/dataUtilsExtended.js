const {
  DataUtils,
  JSONLoader,
  JSONMapper,
  TimeUtils,
  Randomizer,
  DateFormats,
} = require("@amanat-qa/utils-backend");
const fs = require("fs");
const moment = require("moment-business-days");
const dictionaryAPI = require("../../../tests/API/dictionaryAPI");

class DataUtilsExtended extends DataUtils {
  static passBugsTWB(mappedData, getPolicyData) {
    const outputData = { ...mappedData };

    // Pass TWB bug with "verify_bool" value without verification
    if (
      getPolicyData.contracts[0].verify_bool === 1 &&
      outputData["contracts.0.verify_bool"] === 0
    ) {
      outputData["contracts.0.verify_bool"] =
        getPolicyData.contracts[0].verify_bool;
    }

    return outputData;
  }

  static async mapRequestToOnes(getPolicyData, requestData, optionalSchema) {
    this.saveToJSON({ requestData });
    this.saveToJSON({ getPolicyData });

    // if payment type is one-time (payment_type: 0),
    // generate and write payments.payment_start_date in request body from scratch
    // to avoid null value being ignored in mapping and to assert that 1C gets the right date
    let requestDataCopy = { ...requestData };
    const flattenedRequestData = JSONMapper.flattenJSON(requestDataCopy);
    if (
      JSONMapper.getNestedProperty(
        flattenedRequestData,
        "payment_type"
      ).values.pop() === 0
    ) {
      const paymentStartDateFullKey = "policyData.payments.payment_start_date";
      const nextMonthFirstDay = moment()
        .add(1, "M")
        .startOf("month")
        .format(DateFormats.DMY);
      const paymentDate = await dictionaryAPI.getWorkingDay(nextMonthFirstDay);
      flattenedRequestData[paymentStartDateFullKey] = paymentDate.data.data;
      requestDataCopy = JSONMapper.unflattenJSON(flattenedRequestData);
    }

    let mappedData = JSONMapper.mapValues(
      { getPolicyData },
      { requestDataCopy },
      optionalSchema ?? JSONLoader.requestToGetPolicyMapSchema
    );

    const datesFullKeys = JSONMapper.getNestedProperty(
      mappedData,
      "date_begin"
    ).keys;
    datesFullKeys.push(
      ...JSONMapper.getNestedProperty(mappedData, "date_end").keys
    );
    datesFullKeys.push(
      ...JSONMapper.getNestedProperty(mappedData, "date").keys
    );
    datesFullKeys.forEach((fullKey) => {
      mappedData[fullKey] = TimeUtils.reformatDateFromYMDToDMY(
        mappedData[fullKey]
      );
    });

    const percentFullKeys = JSONMapper.getNestedProperty(
      mappedData,
      "franchise_percent"
    ).keys;
    percentFullKeys.push(
      ...JSONMapper.getNestedProperty(mappedData, "franchise_damage_percent")
        .keys
    );
    percentFullKeys.push(
      ...JSONMapper.getNestedProperty(mappedData, "franchise_loss_percent").keys
    );
    percentFullKeys.forEach((fullKey) => {
      mappedData[fullKey] = Number(
        mappedData[fullKey].substr(0, mappedData[fullKey].indexOf("%"))
      );
    });

    mappedData = this.passBugsTWB(mappedData, getPolicyData);
    const rewritedData = JSONMapper.rewriteValues(
      mappedData,
      global.withESBD ? JSONLoader.dictOnes : JSONLoader.dictOnesWithoutESBD,
      JSONLoader.dictRequest
    );

    const requestToOnesMappedData = JSONMapper.unflattenJSON(rewritedData);
    this.saveToJSON({ requestToOnesMappedData });
    return requestToOnesMappedData;
  }

  static mapESBDToOnes(getPolicyData, getContractByNumberData) {
    this.saveToJSON({ getPolicyData });
    const paymentType = JSONMapper.getNestedProperty(
      JSONMapper.flattenJSON(getPolicyData),
      "payment_form"
    ).values.pop();
    let mappedData = JSONMapper.mapValues(
      { getPolicyData },
      { getContractByNumberData },
      paymentType
        ? JSONLoader.getContractByNumberToGetPolicyMapSchemaInstallmentPayment
        : JSONLoader.getContractByNumberToGetPolicyMapSchemaOneTimePayment
    );

    const paymentFullKeys = JSONMapper.getNestedProperty(
      mappedData,
      "payment"
    ).keys;
    paymentFullKeys.forEach((fullKey) => {
      mappedData[fullKey] = Number(mappedData[fullKey]);
    });

    mappedData = this.passBugsTWB(mappedData, getPolicyData);
    const rewritedData = JSONMapper.rewriteValues(
      mappedData,
      JSONLoader.dictOnes,
      JSONLoader.dictESBD
    );

    const ESBDToOnesMappedData = JSONMapper.unflattenJSON(rewritedData);
    this.saveToJSON({ ESBDToOnesMappedData });
    this.saveToJSON({ getContractByNumberData });
    return ESBDToOnesMappedData;
  }

  static createRandomBeneficiaryAndInsuredStructures(clientsArr) {
    const randomBeneficiaryIndex = Randomizer.getRandomInteger(
      clientsArr.length - 1
    );
    let randomInsuredIndex;
    do {
      randomInsuredIndex = Randomizer.getRandomInteger(clientsArr.length - 1);
    } while (randomInsuredIndex === randomBeneficiaryIndex);
    const tempBeneficiary = clientsArr[randomBeneficiaryIndex];
    const tempInsured = clientsArr[randomInsuredIndex];
    const resultBeneficiary = { ...tempBeneficiary };
    const resultInsured = { ...tempInsured };

    resultBeneficiary.iin = tempBeneficiary.iin.toString();
    resultBeneficiary.name = `${tempBeneficiary.last_name} ${tempBeneficiary.first_name} ${tempBeneficiary.middle_name}`;

    resultBeneficiary.id_esbd = tempBeneficiary.client_id;

    resultBeneficiary.is_new = 0;

    resultInsured.id_esbd = tempInsured.client_id;

    resultInsured.fio = `${tempInsured.last_name} ${tempInsured.first_name} ${tempInsured.middle_name}`;
    resultInsured.iin = tempInsured.iin.toString();

    resultInsured.born = TimeUtils.reformatDateFromYMDToDMY(tempInsured.born);
    resultInsured.document_gived_date = TimeUtils.reformatDateFromYMDToDMY(
      tempInsured.document_gived_date
    );

    resultInsured.pdl = Randomizer.getRandomInteger(1);
    resultInsured.verify_bool = Number(JSONLoader.configData.verification);
    resultInsured.verify_type_id =
      Number(JSONLoader.configData.verification) || 3;

    resultInsured.address = JSONLoader.testData.address;
    resultInsured.email = JSONLoader.testData.email;
    resultInsured.phone = JSONLoader.testData.phone;
    resultInsured.document_gived_by = JSONLoader.testData.document_gived_by;
    resultInsured.activity_kind_id = JSONLoader.testData.activity_kind_id;
    resultInsured.class = JSONLoader.testData.class;
    resultInsured.class_id = JSONLoader.testData.class_id;
    resultInsured.country_id = JSONLoader.testData.country_id;
    resultInsured.economics_sector_id = JSONLoader.testData.economics_sector_id;
    resultInsured.settlement_id = JSONLoader.testData.settlement_id;
    resultInsured.terrorist = JSONLoader.testData.terrorist;
    resultInsured.unreliable_client = JSONLoader.testData.unreliable_client;
    resultInsured.mobile_phone = JSONLoader.testData.mobile_phone;

    return { beneficiary: resultBeneficiary, insured: resultInsured };
  }

  static mapTariffToSetPolicy(tariff) {
    this.saveToJSON({ tariff });
    const setPolicyTemplate = JSONLoader.templateSetPolicy;
    const flattenedTariff = JSONMapper.flattenJSON(tariff);
    const flattenedSetPolicyTemplate =
      JSONMapper.flattenJSON(setPolicyTemplate);
    const trimmedTariffKeys = Object.keys(flattenedTariff).map((key) =>
      key.split(".").pop()
    );
    const trimmedSetPolicyTemplateKeys = Object.keys(
      flattenedSetPolicyTemplate
    ).map((key) => key.split(".").pop());
    const matchingKeys = new Set(
      trimmedTariffKeys.filter((key) =>
        new Set(trimmedSetPolicyTemplateKeys).has(key)
      )
    );
    const mappingSchema = Array.from(matchingKeys).reduce(
      (obj, element) => ({ ...obj, [element]: element }),
      {}
    );
    const flattenedUpdatedSetPolicyTemplate = JSONMapper.mapValues(
      { setPolicyTemplate },
      { tariff },
      mappingSchema,
      { deleteNotMapped: false }
    );
    const IDFromOptions = JSONMapper.getNestedProperty(
      flattenedUpdatedSetPolicyTemplate,
      "id"
    ).values[0];
    const tarifIDOnesFullKey = JSONMapper.getNestedProperty(
      flattenedUpdatedSetPolicyTemplate,
      "tarif_id_1c"
    ).keys.pop();
    flattenedUpdatedSetPolicyTemplate[tarifIDOnesFullKey] = IDFromOptions;
    const updatedSetPolicyTemplate = JSONMapper.unflattenJSON(
      flattenedUpdatedSetPolicyTemplate
    );
    this.saveToJSON({ updatedSetPolicyTemplate });

    return updatedSetPolicyTemplate;
  }
}

module.exports = DataUtilsExtended;
