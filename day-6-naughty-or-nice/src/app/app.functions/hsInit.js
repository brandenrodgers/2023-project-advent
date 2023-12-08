const axios = require("axios");

let DOMAIN = null;
let result = null;

exports.main = async (context = {}) => {
  const { PRIVATE_APP_ACCESS_TOKEN } = process.env;
  const { data, qa } = context.parameters;
  result = {};

  DOMAIN = `https://api.hubapi${qa ? "qa" : ""}.com`;

  if (!data) {
    return fail("No data parameter passed to serverless function");
  }

  if (data.properties) {
    result.properties = {};

    for (let i = 0; i < data.properties.length; i++) {
      const property = data.properties[i];

      if (!property.options || !property.options.name) {
        return fail("Missing the required options.name field on the property");
      }

      if (!property.objectType) {
        return fail(
          `Missing the objectType field for property: `,
          property.options.name
        );
      }

      const { error: propertyError, data: propertyData } =
        await safeAddProperty(PRIVATE_APP_ACCESS_TOKEN, property);

      if (propertyError) {
        return fail(propertyError);
      }
      result.properties[property.options.name] = propertyData;
    }
  }

  if (data.objectSchemas) {
    result.objectSchemas = {};
    let allObjectSchemas = [];

    try {
      const allSchemasResp = await getAllObjectSchemas(
        PRIVATE_APP_ACCESS_TOKEN
      );

      if (allSchemasResp.status === 200 && allSchemasResp.data) {
        allObjectSchemas = allSchemasResp.data.results;
      }
    } catch (err) {
      return fail(handleError(err));
    }

    for (let i = 0; i < data.objectSchemas.length; i++) {
      const objectSchema = data.objectSchemas[i];

      if (!objectSchema.name) {
        return fail("Missing the name field on the object schema");
      }

      const { error: objectSchemaError, data: objectSchemaData } =
        await safeAddObjectSchema(
          PRIVATE_APP_ACCESS_TOKEN,
          objectSchema,
          allObjectSchemas
        );

      if (objectSchemaError) {
        return fail(objectSchemaError);
      }
      result.objectSchemas[objectSchema.name] = objectSchemaData;
    }
  }

  return succeed();
};

// Response utils
const succeed = () => ({ status: "SUCCESS", data: result });
const fail = (error) => ({ status: "ERROR", data: result, error });

// Property utils
const safeAddProperty = async (token, property) => {
  const safeAddResult = { data: null, error: null };
  let propertyExists = false;

  try {
    const { status, data } = await getPropertyForObject(token, property);

    if (status === 200 && data) {
      propertyExists = true;
      safeAddResult.data = true;
    }
  } catch (err) {
    if (!err.response || err.response.status !== 404) {
      safeAddResult.error = handleError(err);
      return safeAddResult;
    }
  }

  if (!propertyExists) {
    try {
      await createPropertyForObject(token, property);
      propertyExists = true;
      safeAddResult.data = true;
    } catch (err) {
      safeAddResult.error = handleError(err);
    }
  }

  return safeAddResult;
};

const safeAddObjectSchema = async (token, objectSchema, allObjectSchemas) => {
  const safeAddResult = { data: null, error: null };
  let objectSchemaExists = false;

  const existingObjectSchema = allObjectSchemas.find(
    (s) => s.name === objectSchema.name
  );

  if (!!existingObjectSchema) {
    objectSchemaExists = true;
    safeAddResult.data = existingObjectSchema.id;
  }

  if (!objectSchemaExists) {
    try {
      const { data } = await createObjectSchema(token, objectSchema);
      objectSchemaExists = true;
      safeAddResult.data = data.id;
    } catch (err) {
      safeAddResult.error = handleError(err);
    }
  }

  return safeAddResult;
};

// API utils
const handleError = (err) => {
  if (!err) {
    return "Unknown error";
  }

  if (!err.response) {
    return err.message;
  }

  // Handle permission errors
  if (err.response.status === 403) {
    const errorData = err.response.data;

    if (errorData && errorData.errors && errorData.errors.length) {
      let errResult = null;

      for (let i = 0; i < errorData.errors.length; i++) {
        const error = errorData.errors[i];
        if (error.context) {
          if (error.context.requiredGranularScopes) {
            errResult = `${
              error.message
            }: ${error.context.requiredGranularScopes.join(", ")}`;
            break; // Prioritize logging granular scopes. They're more useful
          }
          if (error.context.requiredScopes) {
            errResult = `${error.message}: ${error.context.requiredScopes.join(
              ", "
            )}`;
          }
        }
      }
      if (errResult) {
        return errResult;
      }
    }
  }

  if (err.response.data && err.response.data.message) {
    return err.response.data.message;
  }
  return err.message;
};

// API requests
const getPropertyForObject = (token, property) => {
  return axios.get(
    `${DOMAIN}/properties/v1/${property.objectType}/properties/named/${property.options.name}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const createPropertyForObject = (token, property) => {
  return axios.post(
    `${DOMAIN}/properties/v1/${property.objectType}/properties`,
    property.options,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const getAllObjectSchemas = (token) => {
  return axios.get(`${DOMAIN}/crm/v3/schemas`, {
    params: { archived: false },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

const createObjectSchema = (token, objectSchema) => {
  return axios.post(`${DOMAIN}/crm/v3/schemas`, objectSchema, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
