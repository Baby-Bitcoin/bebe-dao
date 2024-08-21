const RedisClient = require("./redis.js");

const addressInfo = async function (data) {
  const address = await RedisClient.jsonget(
    RedisClient.ADDRESSES_DB,
    data.address
  );

  if (address) {
    return address;
  }

  const newAddress = await RedisClient.jsonset(
    RedisClient.ADDRESSES_DB,
    data.address,
    JSON.stringify(data)
  );

  return newAddress;
};

module.exports.addressInfo = addressInfo;
