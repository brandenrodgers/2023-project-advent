const axios = require("axios");

exports.main = async () => {
  const { PRIVATE_APP_ACCESS_TOKEN } = process.env;

  const TABLE_NAME = "Christmas wish list";

  let tables;
  try {
    const { data, status } = await fetchHubDBTables(PRIVATE_APP_ACCESS_TOKEN);
    if (status === 200 && data && data.objects) {
      tables = data.objects;
    } else {
      return { success: false, error: "Failed to fetch HubDB tables" };
    }
  } catch (error) {
    return { success: false, error };
  }

  let table = tables.find((table) => table.label === TABLE_NAME);

  if (!table) {
    try {
      table = await createHubDBTable(PRIVATE_APP_ACCESS_TOKEN, {
        name: TABLE_NAME,
        columns: [
          {
            name: "name",
            type: "TEXT",
          },
          {
            name: "item",
            type: "TEXT",
          },
          {
            name: "image",
            type: "TEXT",
          },
          {
            name: "link",
            type: "TEXT",
          },
          {
            name: "description",
            type: "TEXT",
          },
        ],
      });
    } catch (error) {
      return { success: false, error };
    }
  }

  return { success: !!table, table };
};

// Function to fetch all HubDB table in HubSpot
const fetchHubDBTables = (token) => {
  return axios.get("https://api.hubapiqa.com/hubdb/api/v2/tables", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

// Function to create a new HubDB table in HubSpot
const createHubDBTable = (token, tableData = {}) => {
  return axios.post(
    "https://api.hubapiqa.com/hubdb/api/v2/tables",
    { ...tableData, publishedAt: Date.now() },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
