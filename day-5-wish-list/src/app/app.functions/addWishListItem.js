const axios = require("axios");

exports.main = async (context = {}) => {
  const { PRIVATE_APP_ACCESS_TOKEN } = process.env;
  const {
    contactName,
    tableId,
    tableColumnMap,
    item,
    image,
    link,
    description,
  } = context.parameters;

  try {
    const { status: addStatus } = await addRowForUser(
      PRIVATE_APP_ACCESS_TOKEN,
      tableId,
      {
        values: {
          1: contactName,
          [tableColumnMap["item"]]: item,
          [tableColumnMap["image"]]: image,
          [tableColumnMap["link"]]: link,
          [tableColumnMap["description"]]: description,
        },
      }
    );
    if (addStatus === 200) {
      const { status: publishStatus } = await publishChanges(
        PRIVATE_APP_ACCESS_TOKEN,
        tableId
      );
      return { success: publishStatus === 200 };
    }
    return { success: false };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};

// Function to add a new HubDB table row for a given user in HubSpot
const addRowForUser = (token, tableId, rowData = {}) => {
  return axios.post(
    `https://api.hubapiqa.com/hubdb/api/v2/tables/${tableId}/rows`,
    rowData,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Function to publish the recent HubDB table changes in in HubSpot
const publishChanges = (token, tableId) => {
  return axios.put(
    `https://api.hubapiqa.com/hubdb/api/v2/tables/${tableId}/publish`,
    null,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
