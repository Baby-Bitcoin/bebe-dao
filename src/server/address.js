const { InMemoryDB, dbConnection } = require('./butterfly');
const fs = require("fs");
const { currentUnixTimestamp } = require("./utilities");
const { FORBIDDEN_USERNAMES } = require("./configs");
const path = require("path");
const { getTokenBalance } = require("./web3");

const AVATAR_PREFIX = path.join(
  __dirname,
  "..",
  "..",
  "public_html",
  "images",
  "addresses"
);

const addressInfo = async function (data, avatarUrl = null) {

  // Check for forbidden username
  if (FORBIDDEN_USERNAMES.includes(data.username)) {
    throw new Error(`Not allowed to use ${data.username} as username`);
  }

  // Fetch the existing keyObject from the database
  let keyObject = await dbConnection.getKey(InMemoryDB.ADDRESSES_DB, data.address);

  const nowTime = currentUnixTimestamp();
  const sessionTimeout = 86400; // 24 hours in seconds
  let shouldSave = false; // Flag to track if we need to save data

  // Initialize keyObject if it doesn't exist (new registration)
  if (!keyObject) {
    keyObject = {
      registeredAt: nowTime,
      lastSessionAt: nowTime,
      // Initialize other properties if needed
    };
    shouldSave = true; // New registration, so we need to save
  }

  // Determine if we should update session based on actual time difference
  const lastSession = keyObject.lastSessionAt || 0;
  if (data.login === 'yes' && (nowTime - lastSession) > sessionTimeout) {
    keyObject.lastSessionAt = nowTime;
    shouldSave = true; // Legitimate session update based on timeout
  }

  // Handle avatarUrl update and remove the old avatar file if it exists
  if (avatarUrl && avatarUrl !== keyObject.avatarUrl) {
    const oldAvatarUrl = keyObject.avatarUrl;
    if (oldAvatarUrl) {
      fs.rmSync(path.join(AVATAR_PREFIX, oldAvatarUrl), { force: true });
      fs.rmSync(path.join(AVATAR_PREFIX + '/thumbnails', oldAvatarUrl), { force: true });
    }
    keyObject.avatarUrl = avatarUrl;
    shouldSave = true; // Avatar has changed, so save
  }

  // Remove the `banned` property if it exists and is set to false
  if (keyObject.banned === false) {
    delete keyObject.banned;
    shouldSave = true; // Banned property modified, so save
  }

  // Clean up unwanted properties before saving
  delete keyObject.login;
  delete keyObject.address;

  // Save data only if necessary (new registration, legitimate login, or avatar update)
  if (shouldSave) {
    await dbConnection.setKey(InMemoryDB.ADDRESSES_DB, data.address, keyObject);
  }

  const balance = await getTokenBalance(data.address);

  return {
    ...keyObject,
    address: data.address,
    balance: balance
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
