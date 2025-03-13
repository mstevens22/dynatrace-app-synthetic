import  { formatTimeValue, TAG_ONE_CORE } from '../commons/utils'

/******** SYNTHETIC ********/
// Get the list of countries
export const getCountryList = (filters) => `fetch dt.entity.synthetic_test, from: ${formatTimeValue(filters.timeframe.value.from.value)}, to: ${formatTimeValue(filters.timeframe.value.to.value)}
| filter matchesValue(tags, "${TAG_ONE_CORE}")
| filter matchesValue(tags, "Environment:PRD")
| expand tags
| filter contains(tags, "Market:")
| fieldsAdd market = replaceString(tags, "Market:", "")
| fieldsKeep market 
| dedup market`;

export const getAvailabilityByCountry = (filters) => `timeseries exec = sum(dt.synthetic.browser.executions), interval: 10m, by: {dt.entity.synthetic_test,state },filter: { matchesValue(entityAttr(dt.entity.synthetic_test, "tags"), "${TAG_ONE_CORE}") }, from: ${formatTimeValue(filters.timeframe.value.from.value)}, to: ${formatTimeValue(filters.timeframe.value.to.value)}
| fieldsAdd dt.entity.synthetic_test.name = entityName(dt.entity.synthetic_test)
| filter state == "SUCCESS"
| fieldsAdd executionSuccess = arraySum(exec)
| fieldsAdd tags = entityAttr(dt.entity.synthetic_test, "tags")
| expand tags
| join [timeseries exec = sum(dt.synthetic.browser.executions), interval: 10m, by: {dt.entity.synthetic_test,state },filter: { matchesValue(entityAttr(dt.entity.synthetic_test, "tags"), "${TAG_ONE_CORE}")}, from: ${formatTimeValue(filters.timeframe.value.from.value)}, to: ${formatTimeValue(filters.timeframe.value.to.value)}
| fieldsAdd dt.entity.synthetic_test.name = entityName(dt.entity.synthetic_test)
| filter state == "FAIL"
| fieldsAdd executionFail = arraySum(exec)
],kind: outer, on:{dt.entity.synthetic_test.name}
| fieldsAdd availability = iCollectArray(if(isNull(exec[]) and isNull(right.exec[]), 1, else: if(isNull(exec[]), 0, else: if(isNull(right.exec[]), 1, else: if(exec[] > right.exec[], 1, else: 0)))))
| fieldsAdd availabilityRate = if(isNull(executionSuccess) and isNull(right.executionFail), 0, else: if(isNull(executionSuccess), 0, else: if(isNull(right.executionFail), 100, else: arrayAvg(availability)*100)))
| fieldsKeep dt.entity.synthetic_test, dt.entity.synthetic_test.name, executionSuccess, right.executionFail, availabilityRate, tags
| fieldsRename scenarioId = dt.entity.synthetic_test, scenarioName = dt.entity.synthetic_test.name, executionFail = right.executionFail
| filter contains(tags, "Market:")
| fieldsAdd country = replaceString(tags, "Market:", "")
| summarize availability = round(avg(availabilityRate), decimals: 2), by:{country}`;

//Calculate if availability (algo: if at least one location/3 is ok over 10mns then 100%)
export const getAvailabilityByScenarioByCountry = (country, filters) => `
timeseries exec = sum(dt.synthetic.browser.executions), interval: 10m, by: {dt.entity.synthetic_test,state },filter: { matchesValue(entityAttr(dt.entity.synthetic_test, "tags"), "${TAG_ONE_CORE}") and matchesValue(entityAttr(dt.entity.synthetic_test, "tags"), "Market:${country}")}, from: ${formatTimeValue(filters.timeframe.value.from.value)}, to: ${formatTimeValue(filters.timeframe.value.to.value)}
| fieldsAdd dt.entity.synthetic_test.name = entityName(dt.entity.synthetic_test)
| filter state == "SUCCESS"
| fieldsAdd executionSuccess = arraySum(exec)
| join [timeseries exec = sum(dt.synthetic.browser.executions), interval: 10m, by: {dt.entity.synthetic_test,state },filter: { matchesValue(entityAttr(dt.entity.synthetic_test, "tags"), "${TAG_ONE_CORE}") and matchesValue(entityAttr(dt.entity.synthetic_test, "tags"), "Market:${country}")}, from: ${formatTimeValue(filters.timeframe.value.from.value)}, to: ${formatTimeValue(filters.timeframe.value.to.value)}
| fieldsAdd dt.entity.synthetic_test.name = entityName(dt.entity.synthetic_test)
| filter state == "FAIL"
| fieldsAdd executionFail = arraySum(exec)],kind: outer, on:{dt.entity.synthetic_test.name}
| fieldsAdd availability = iCollectArray(if(isNull(exec[]) and isNull(right.exec[]), 1, else: if(isNull(exec[]), 0, else: if(isNull(right.exec[]), 1, else: if(exec[] > right.exec[], 1, else: 0)))))
| fieldsAdd availabilityRate = if(isNull(executionSuccess) and isNull(right.executionFail), 0, else: if(isNull(executionSuccess), 0, else: if(isNull(right.executionFail), 100, else: arrayAvg(availability)*100)))
| fieldsKeep dt.entity.synthetic_test, dt.entity.synthetic_test.name, executionSuccess, right.executionFail, availabilityRate
| fieldsRename scenarioId = dt.entity.synthetic_test, scenarioName = dt.entity.synthetic_test.name, executionFail = right.executionFail
| fieldsAdd scenarioName = trim(splitString(scenarioName, " - ")[2])`;

export const getExecutionsByScenarioStepCountry = (country, filters) => `timeseries exec = sum(dt.synthetic.browser.event.executions), interval: 10m, by: {dt.entity.synthetic_test_step,dt.entity.synthetic_test,state },filter: { matchesValue(entityAttr(dt.entity.synthetic_test, "tags"), "${TAG_ONE_CORE}") and matchesValue(entityAttr(dt.entity.synthetic_test, "tags"), "Market:${country}")}, from: ${formatTimeValue(filters.timeframe.value.from.value)}, to: ${formatTimeValue(filters.timeframe.value.to.value)}
| fieldsAdd dt.entity.synthetic_test.name = entityName(dt.entity.synthetic_test)
| fieldsAdd stepName = entityName(dt.entity.synthetic_test_step)
| filter state == "SUCCESS"
| fieldsAdd executionSuccess = arraySum(exec)
| join [timeseries exec = sum(dt.synthetic.browser.event.executions), interval: 10m, by: {dt.entity.synthetic_test_step,dt.entity.synthetic_test,state },filter: { matchesValue(entityAttr(dt.entity.synthetic_test, "tags"), "${TAG_ONE_CORE}") and matchesValue(entityAttr(dt.entity.synthetic_test, "tags"), "Market:${country}")}, from: ${formatTimeValue(filters.timeframe.value.from.value)}, to: ${formatTimeValue(filters.timeframe.value.to.value)}
| fieldsAdd dt.entity.synthetic_test.name = entityName(dt.entity.synthetic_test)
| filter state == "FAIL"
| fieldsAdd executionFail = arraySum(exec)
],kind: outer, on:{dt.entity.synthetic_test_step,dt.entity.synthetic_test}
| fieldsAdd availability = iCollectArray(if(isNull(exec[]) and isNull(right.exec[]), 1, else: if(isNull(exec[]), 0, else: if(isNull(right.exec[]), 1, else: if(exec[] > right.exec[], 1, else: 0)))))
| fieldsAdd availabilityRate = if(isNull(executionSuccess) and isNull(right.executionFail), 0, else: if(isNull(executionSuccess), 0, else: if(isNull(right.executionFail), 100, else: arrayAvg(availability)*100)))
| fieldsKeep stepName, dt.entity.synthetic_test_step, dt.entity.synthetic_test, dt.entity.synthetic_test.name, executionSuccess, right.executionFail, availabilityRate
| fieldsRename step = dt.entity.synthetic_test_step,scenarioId = dt.entity.synthetic_test, scenarioName = dt.entity.synthetic_test.name, executionFail = right.executionFail
| fieldsAdd scenarioName = trim(splitString(scenarioName, " - ")[2])
| sort stepName asc`;
