const axios = require("axios");

exports.main = async (context = {}) => {
  const { PRIVATE_APP_ACCESS_TOKEN } = process.env;
  const { contactName, tableId, tableColumnMap } = context.parameters;

  try {
    const { status, data } = await getRowsForUser(
      PRIVATE_APP_ACCESS_TOKEN,
      tableId,
      contactName
    );

    if (status === 200 && data && data.objects) {
      const keys = Object.keys(tableColumnMap);
      const result = data.objects.map(({ values }) => {
        return keys.reduce((acc, k) => {
          acc[k] = values[tableColumnMap[k]];
          return acc;
        }, {});
      });
      return { success: true, items: result };
    }
    return { success: false, error: "Failed to get wish list items for user" };
  } catch (error) {
    return { success: false, error };
  }
};

// Function to fetch all HubDB table rows for a given user in HubSpot
const getRowsForUser = (token, tableId, user) => {
  return axios.get(
    `https://api.hubapiqa.com/hubdb/api/v2/tables/${tableId}/rows?name=${user}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
