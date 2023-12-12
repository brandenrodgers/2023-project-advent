const axios = require("axios");

exports.main = async (context = {}) => {
  const { PRIVATE_APP_ACCESS_TOKEN } = process.env;
  const { contactId, newValue } = context.parameters;

  try {
    await updateContactProperty(PRIVATE_APP_ACCESS_TOKEN, contactId, newValue);
  } catch (e) {
    return false;
  }

  return true;
};

// Update the naughty_or_nice contact property for this contact
const updateContactProperty = (token, contactId, newValue) => {
  return axios.patch(
    `https://api.hubapiqa.com/crm/v3/objects/contacts/${contactId}`,
    { properties: { naughty_or_nice: newValue } },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
