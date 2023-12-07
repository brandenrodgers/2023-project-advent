const axios = require("axios");

exports.main = async (context = {}) => {
  const { PRIVATE_APP_ACCESS_TOKEN } = context.secrets;
  const { contactName, tableId, item } = context.parameters;

  try {
    const { data } = await getRow(
      PRIVATE_APP_ACCESS_TOKEN,
      tableId,
      contactName,
      item
    );

    if (data && data.objects && data.objects[0]) {
      const rowId = data.objects[0].id;
      const { status: deleteStatus } = await deleteRow(
        PRIVATE_APP_ACCESS_TOKEN,
        tableId,
        rowId
      );
      if (deleteStatus === 204) {
        const { status: publishStatus } = await publishChanges(
          PRIVATE_APP_ACCESS_TOKEN,
          tableId
        );
        return { success: publishStatus === 200 };
      }
    }
    return {
      success: false,
      error: `Could not find row to delete for ${item}`,
    };
  } catch (error) {
    return { success: false, error };
  }
};

// Function to remove a HubDB table row in HubSpot
const deleteRow = (token, tableId, rowId) => {
  return axios.delete(
    `https://api.hubapiqa.com/hubdb/api/v2/tables/${tableId}/rows/${rowId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Function to fetch a specific HubDB table row for a given user in HubSpot
const getRow = (token, tableId, user, item) => {
  return axios.get(
    `https://api.hubapiqa.com/hubdb/api/v2/tables/${tableId}/rows?name=${user}&item=${item}`,
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
