const currentUnixTimestamp = () => {
  return Math.floor(Date.now() / 1000);
};

module.exports.currentUnixTimestamp = currentUnixTimestamp;
