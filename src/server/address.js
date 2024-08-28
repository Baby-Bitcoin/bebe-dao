const RedisClient = require("./redis.js");
const fs = require("fs");
const { currentUnixTimestamp } = require("./utilities.js");

const AVATAR_PREFIX = `${__dirname}/../../public_html/images/addresses`;
const AVATAR_PUBLIC_URL = "images/addresses";

const addressInfo = async function (data, avatarUrl = null) {
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

  if (avatarUrl) {
    const oldAvatarUrl = address.avatarUrl;
    if (oldAvatarUrl) {
      fs.rmSync(`${AVATAR_PREFIX}/${oldAvatarUrl}`, {
        force: true,
      });
    }

    address = {
      ...data,
      ...address,
      avatarUrl,
    };
  }

  address = {
    ...address,
    lastSessionAt: currentUnixTimestamp(),
    avatarPublicUrl: `${AVATAR_PUBLIC_URL}/${address.avatarUrl}`,
  };

  await RedisClient.jsonset(RedisClient.ADDRESSES_DB, data.address, address);

  return await RedisClient.jsonget(RedisClient.ADDRESSES_DB, data.address);
};

module.exports.addressInfo = addressInfo;
