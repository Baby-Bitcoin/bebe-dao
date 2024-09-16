const { InMemoryDB, dbConnection } = require('./butterfly');
// const { getTokenBalance } = require('./js/web3');
const fs = require("fs");
const { currentUnixTimestamp } = require("./utilities");
const { FORBIDDEN_USERNAMES } = require("./configs");
const path = require("path");

const AVATAR_PREFIX = path.join(
  __dirname,
  "..",
  "..",
  "public_html",
  "images",
  "addresses"
);

const addressInfo = async function (data, avatarUrl = null) {
//console.log(await getTokenBalance(data.address));
  if (FORBIDDEN_USERNAMES.includes(data.username)) {
    throw new Error(`Not allowed to use ${data.username} as username`);
  }

  let address = await dbConnection.getKey(
    InMemoryDB.ADDRESSES_DB,
    data.address
  );

  // Initialize address if it does not exist
  const Authenticate = async () => {
    if (!address) {
      console.log('Register');
      address = {
        ...data,
        registeredAt: currentUnixTimestamp(),
        lastSessionAt: currentUnixTimestamp()
      };

      delete address.address; // Remove the `address` key before saving
      delete address.login;
      await dbConnection.setKey(InMemoryDB.ADDRESSES_DB, data.address, address);
    }

    else if (data.login && data.login === 'yes') {
      console.log('Login');
      address = {
        lastSessionAt: currentUnixTimestamp()
      };

      delete address.address; // Remove the `address` key before saving
      delete address.login;
      await dbConnection.setKey(InMemoryDB.ADDRESSES_DB, data.address, address);
    }
  }

  Authenticate();



  // Handle avatarUrl update and remove the old avatar file if it exists
  if (avatarUrl) {
    const oldAvatarUrl = address.avatarUrl;
    if (oldAvatarUrl) {
      fs.rmSync(path.join(AVATAR_PREFIX, oldAvatarUrl), { force: true });
      fs.rmSync(path.join(AVATAR_PREFIX+'/thumbnails', oldAvatarUrl), { force: true });
    }
    address.avatarUrl = avatarUrl;
  }


  // Remove the `banned` property if it exists and is set to false
  if (address.banned === false) {
    delete address.banned;
  }

  const result = await dbConnection.getKey(
    InMemoryDB.ADDRESSES_DB,
    data.address
  );

  return {
    ...result,
    address: data.address
  };
};

module.exports = class Address {
  static async find(publicKey) {
    return dbConnection.getKey(InMemoryDB.ADDRESSES_DB, publicKey);
  }

  static async isBanned(publicKey) {
    const address = await this.find(publicKey);
    if (!address) {
      return false;
    }

    return address.isBanned == true;
  }

  static async toggleAddressBan(publicKey, selfPublicKey) {
    const address = await this.find(publicKey);
    if (!address) {
      throw new Error(
        `The wallet address ${publicKey} doesn't exist in our records`
      );
    }

    if (publicKey == selfPublicKey) {
      throw new Error("You are not allowed to ban yourself!");
    }

    address.isBanned = !address.isBanned;

    await dbConnection.setKey(InMemoryDB.ADDRESSES_DB, publicKey, address);
    return dbConnection.getKey(InMemoryDB.ADDRESSES_DB, publicKey, address);
  }
};

module.exports.addressInfo = addressInfo;
