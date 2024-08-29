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

const roundDown = (num: number, decimalPlaces: number): number => {
  return Math.floor(num * 10 ** decimalPlaces) / 10 ** decimalPlaces;
};

const prettifyDecimal = (num: number, decimalPlaces: number = 2): string => {
  if (!num || num === 0) {
    return decimalPlaces === 0 ? "0" : `0.${"0".repeat(decimalPlaces)}`;
  }

  if (num < 0.01) return "<0.01";

  if (num >= 1e9) return `${roundDown(num / 1e9, decimalPlaces)}B`;

  if (num >= 1e6) return `${roundDown(num / 1e6, decimalPlaces)}M`;

  // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
  return `${roundDown(num, decimalPlaces)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

const tokenAtomicsToPrettyDecimal = (
  tokenAtomics: any,
  decimals: number = 0
) => {
  const decimalNum = tokenAtomicsToDecimal(tokenAtomics, decimals);
  return prettifyDecimal(decimalNum, 2);
};

const tokenAtomicsToDecimal = (tokenAtomics: any, decimals: number): number => {
  return Number(tokenAtomicsToDecimalString(tokenAtomics, decimals));
};

const tokenAtomicsToDecimalString = (
  tokenAtomics: any,
  decimals: number
): string => {
  const s = tokenAtomics.toString().padStart(decimals + 1, "0");
  const decIndex = s.length - decimals;
  return `${s.substring(0, decIndex)}.${s.substring(decIndex)}`;
};

export { browserType, tokenAtomicsToPrettyDecimal };
