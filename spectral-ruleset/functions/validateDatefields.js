export default (document) => {

  const DATE_PARAM_NAMES = [
    'date',
    'date_time',
    'date_created',
    'date_updated',
    'created_at',
    'updated_at',
    'timestamp',
    'last_updated',
    'last_updated_at',
    'dateTime',
    'dateCreated',
    'dateUpdated',
    'createdAt',
    'updatedAt',
    'timestamp',
    'lastUpdated',
    'lastUpdatedAt',
  ];

  const isNotValidDateType = (schema) =>
  !schema || schema.type !== 'string' || !['date', 'date-time'].includes(schema.format);

  const extractParametersAndProperties = (document) => {
    const parameters = [];
    const properties = [];
    const queue = [document];

    while (queue.length > 0) {
      const obj = queue.shift();

      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          queue.push(...obj);
        } else {
          Object.values(obj).forEach((value) => queue.push(value));

          if (obj.parameters && Array.isArray(obj.parameters)) {
            parameters.push(...obj.parameters);
          }

          if (obj.properties && typeof obj.properties === 'object') {
            properties.push(obj.properties);
          }
        }
      }
    }

    return { parameters, properties };
  };

  const { parameters, properties } = extractParametersAndProperties(document);
  const wrongFields = [];

  parameters.forEach((param) => {
    if (DATE_PARAM_NAMES.includes(param.name)) {
      if (isNotValidDateType(param.schema)) {
        wrongFields.push(param.name);
      }
    }
  });

  properties.forEach((property) => {
    Object.entries(property).forEach(([id, schema]) => {
      if (DATE_PARAM_NAMES.includes(id)) {
        if (isNotValidDateType(schema)) {
          wrongFields.push(id);
        }
      }
    });
  });

  if (wrongFields.length > 0) {
    return [
      {
        message: `Date parameters or properties are in the wrong format: ${wrongFields.join(', ')}`,
      },
    ];
  }
};