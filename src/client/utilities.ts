/// <reference types="user-agent-data-types" />

const browserType = () => {
  const userAgent =
    navigator.userAgent ||
    navigator?.userAgentData?.brands?.map((b) => b.brand).join(" ") ||
    "";

  if (/chrome|chromium|crios/i.test(userAgent) && !/edg/i.test(userAgent)) {
    return "Chrome";
  } else if (/firefox|fxios/i.test(userAgent)) {
    return "Firefox";
  } else if (
    /safari/i.test(userAgent) &&
    !/chrome|chromium|crios/i.test(userAgent)
  ) {
    return "Safari";
  } else if (/edg/i.test(userAgent)) {
    return "Edge";
  } else if (/opr\//i.test(userAgent) || /opera/i.test(userAgent)) {
    return "Opera";
  } else {
    return "Other";
  }
};

const prettifyNumber = (num) => {
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

const formatDate = (date) => {
  var currentDate = new Date(date);
  var day = currentDate.getDate();
  var month = currentDate.getMonth() + 1;
  var year = currentDate.getFullYear();
  return (
    (day < 10 ? "0" + day : day) +
    "." +
    (month < 10 ? "0" + month : month) +
    "." +
    year
  );
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

export { browserType, prettifyNumber, formatDate, shorthandAddress };
