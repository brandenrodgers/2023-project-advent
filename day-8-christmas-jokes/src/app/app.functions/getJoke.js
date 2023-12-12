const axios = require("axios");

exports.main = async () => {
  let jokeResp;
  try {
    jokeResp = await getChristmasJoke();
  } catch (e) {
    return null;
  }
  return jokeResp && jokeResp.data ? jokeResp.data : null;
};

// Update the naughty_or_nice contact property for this contact
const getChristmasJoke = () => {
  return axios.get("https://v2.jokeapi.dev/joke/christmas");
};
