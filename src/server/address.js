const RedisClient = require("./redis.js");
const { currentUnixTimestamp } = require("./utilities.js");

const addressInfo = async function (data) {
  let address = await RedisClient.jsonget(
    RedisClient.ADDRESSES_DB,
    data.address
  );

  if (!address) {
    address = {
      ...data,
      registeredAt: currentUnixTimestamp(),
    };
  }

  address = {
    ...address,
    lastSessionAt: currentUnixTimestamp(),
  };
  await RedisClient.jsonset(RedisClient.ADDRESSES_DB, data.address, address);

  return await RedisClient.jsonget(RedisClient.ADDRESSES_DB, data.address);
};

module.exports.addressInfo = addressInfo;
