export default (targetVal) => {
  
  const getAllOperations = require('@stoplight/spectral-rulesets/dist/oas/functions/utils/getAllOperations');
  const isObject = require('@stoplight/spectral-rulesets/dist/oas/functions/utils/isObject');

  if (!isObject.isObject(targetVal) || !isObject.isObject(targetVal.paths)) { return; }
    const results = [];
    const { paths } = targetVal;
    const seenIds = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const { path, operation } of getAllOperations.getAllOperations(paths)) {
      const pathValue = paths[path];
      // eslint-disable-next-line no-continue
      if (!isObject.isObject(pathValue)) { continue; }
      const operationValue = pathValue[operation];
      if (!isObject.isObject(operationValue)) {
        // eslint-disable-next-line no-continue
        continue;
      }
      const { operationId } = operationValue;
      if (!operationId) {
        results.push({
          message: '"operationId" is required',
          path: ['paths', path, operation, 'operationId'],
        });
      }
      if (seenIds.includes(operationId)) {
        results.push({
          message: 'The "operationId" must be a unique value',
          path: ['paths', path, operation, 'operationId'],
        });
      } else {
        seenIds.push(operationId);
      }
    }
    // eslint-disable-next-line consistent-return
    return results;
  };