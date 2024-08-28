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

export { browserType };
