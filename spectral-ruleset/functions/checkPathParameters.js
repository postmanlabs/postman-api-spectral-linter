export default (paths) => {

  const has = (object, path) => {
    return object != null && object.hasOwnProperty(path);
  }

  const some = (collection, predicate) => {
    // If the collection is an object, extract its values into an array
    if (typeof collection === 'object' && !Array.isArray(collection)) {
      collection = Object.values(collection);
    }

    // If the predicate is a string, use it to make a function that gets object properties
    if (typeof predicate === 'string') {
      const property = predicate;
      predicate = function (item) {
        return item[property];
      };
    }

    // If the predicate is an object, use it to make a function that checks object properties
    if (typeof predicate === 'object' && predicate !== null && !Array.isArray(predicate)) {
      const properties = predicate;
      predicate = function (item) {
        for (const key in properties) {
          if (properties.hasOwnProperty(key) && item[key] !== properties[key]) {
            return false;
          }
        }
        return true;
      };
    }

    // Iterate over the collection and return true if any item matches the predicate
    for (let i = 0; i < collection.length; i++) {
      if (predicate(collection[i])) {
        return true;
      }
    }

    // If no items match the predicate, return false
    return false;
  }


  const isValidHttpVerb = (key) => {
    const uppercaseKey = key.toUpperCase();
    return Object.values(HttpMethod).some(method => method === uppercaseKey);
  }

  const HttpMethod = {
    get: 'GET',
    put: 'PUT',
    post: 'POST',
    delete: 'DELETE',
    options: 'OPTIONS',
    head: 'HEAD',
    patch: 'PATCH',
    trace: 'TRACE',
  };

  const isVariable = (text) => text.match(/^{[a-z-A-Z0-9]+}$/);
  const variableName = (pathComponent) => pathComponent.replace(/[{}]/g, '');
  const hasPathParameter = (parameters, parameterName) => some(
    parameters,
    (parameter) => parameter.name === parameterName && parameter.in === 'path',
  );

  const checkNonExistingPathVariables = (path, pathDefinition) => {
    const pathComponents = path.split('/').filter(Boolean);
    const nonExistingPathVariables = [];
    pathComponents.forEach(pathComponent => {
      if (isVariable(pathComponent)) {
        const varName = variableName(pathComponent);
        if (!(has(pathDefinition, 'parameters') && hasPathParameter(pathDefinition.parameters, varName))) {
          Object.entries(pathDefinition).forEach(([verb, verbInfo]) => {
            if (
              isValidHttpVerb(verb)
              && !hasPathParameter(verbInfo.parameters || [], varName)
            ) {
              nonExistingPathVariables.push(`${verb} - ${pathComponent}`);
            }
          });
        }
      }
    });
    return nonExistingPathVariables;
  };

  const errors = [];
  Object.entries(paths).forEach(([path, pathDefinition]) => {
    const wrongVariables = checkNonExistingPathVariables(path, pathDefinition);
    if (wrongVariables.length > 0) {
      errors.push(`${path} -> ${wrongVariables.join(', ')}`);
    }
  });
  if (errors.length > 0) {
    return [{
      message: `Paths and verbs that do not have existing path variable parameters: ${errors.join('. ')}`,
    }];
  }
};