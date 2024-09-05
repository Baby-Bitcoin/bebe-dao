const currentUnixTimestamp = () => {
  return Math.floor(Date.now() / 1000);
};

const shorthandAddress = (address, length = 4) => {
  if (!address) {
    return "";
  }
  return `${address.substr(0, length)}...${address.substr(
    address.length - length,
    length
  )}`;
};

module.exports = {
  currentUnixTimestamp,
  shorthandAddress,
};
