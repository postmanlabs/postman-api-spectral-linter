export default (paths) => {

  function has(object, path) {
    return object != null && object.hasOwnProperty(path);
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

  const wrongPaths = [];
  Object.entries(paths).forEach(([pathName, pathDefinition]) => {
    Object.entries(pathDefinition)
      .forEach(([verb, verbInfo]) => {
        if (
          Object.keys(HttpMethod).includes(verb)
          && !verb.startsWith('x-')
          //path parameter in path or verb
          && ((typeof pathDefinition.parameters !== 'undefined' && pathDefinition.parameters.filter(param => param.in === 'path').length > 0)
            || (typeof verbInfo.parameters !== 'undefined' && verbInfo.parameters.filter(param => param.in === 'path').length > 0))
          && (!has(verbInfo.responses, '404'))) {
          wrongPaths.push(`${pathName} - ${verb}`);
        }
      });
  });
  if (wrongPaths.length > 0) {
    return [
      {
        message: `The following paths and verbs require a 404 response: ${wrongPaths.join(', ')}`,
      },
    ];
  }
}