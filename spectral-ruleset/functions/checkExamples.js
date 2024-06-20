export default (mediaType) => {

  const every = (collection, predicate) => {
    // If the collection is an object, extract its values into an array
    if (typeof collection === 'object' && !Array.isArray(collection)) {
        collection = Object.values(collection);
    }

    // If the predicate is a string, use it to make a function that gets object properties
    if (typeof predicate === 'string') {
        const property = predicate;
        predicate = function(item) {
            return item[property];
        };
    }

    // If the predicate is an object, use it to make a function that checks object properties
    if (typeof predicate === 'object' && predicate !== null && !Array.isArray(predicate)) {
        const properties = predicate;
        predicate = function(item) {
            for (const key in properties) {
                if (properties.hasOwnProperty(key) && item[key] !== properties[key]) {
                    return false;
                }
            }
            return true;
        };
    }

    // Iterate over the collection and return false if any item does not match the predicate
    for (let i = 0; i < collection.length; i++) {
        if (!predicate(collection[i])) {
            return false;
        }
    }

    // If all items match the predicate, return true
    return true;
}


  const has = (object, path) => {
    return object != null && object.hasOwnProperty(path);
  }

  const propertyHasExample = (property) => {
    if (property.type === 'object') {
      const childProperties = Object.values(property.properties || []);
      return childProperties.every(propertyHasExample);
    }
    return has(property, 'example');
  };

  const examplesHaveProperty = (examples, name) => examples && every(examples, (example) => has(example.value, name));

  const { schema } = mediaType;
  const propertiesWithoutExamples = [];
  if (schema && schema.properties) {
    Object.entries(schema.properties).forEach(([name, property]) => {
      if (
        !propertyHasExample(property)
        && !has(schema.example, name)
        && !has(mediaType.example, name)
        && !examplesHaveProperty(mediaType.examples, name)
      ) {
        propertiesWithoutExamples.push(name);
      }
    });
  }

  if (propertiesWithoutExamples.length > 0) {
    return [{
      message: `Properties without examples: ${propertiesWithoutExamples.join(', ')}`,
    }];
  }
};