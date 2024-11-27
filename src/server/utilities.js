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

const prettifyNumber = (num) => {
  num = Number(num);
  if (isNaN(num)) {
    console.error(`Invalid number: ${num}`);
    return "NaN";
  }

  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (absNum >= 1_000_000_000) {
    return `${sign}${(absNum / 1_000_000_000).toFixed(2)}B`;
  } else if (absNum >= 1_000_000) {
    return `${sign}${(absNum / 1_000_000).toFixed(2)}M`;
  } else if (absNum >= 1_000) {
    return `${sign}${(absNum / 1_000).toFixed(2)}K`;
  } else {
    return `${sign}${num.toFixed(2)}`;
  }
};


module.exports = {
  currentUnixTimestamp,
  shorthandAddress,
  prettifyNumber
};
