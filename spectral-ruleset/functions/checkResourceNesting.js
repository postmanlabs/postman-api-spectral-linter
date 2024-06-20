export default (path) => {
    const pathComponents = path.split('/');
    let previousWasNotVariable = false;
    // eslint-disable-next-line no-restricted-syntax
    for (const component of pathComponents) {
      if (!component) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (!component.match(/^{[a-z-A-Z0-9]+}$/) && !component.match(/^\.\*$/)) {
        if (previousWasNotVariable) {
          return [{
            message: 'Path contains consecutive non-variables',
          }];
        }
        previousWasNotVariable = true;
      } else {
        previousWasNotVariable = false;
      }
    }
  };