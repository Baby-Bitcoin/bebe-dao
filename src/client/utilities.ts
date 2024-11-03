//<reference types="user-agent-data-types" />

import { $ } from "./ui.js";
import { showModal } from "./modal.js";

const browserType = () => {
  const userAgent =
    navigator.userAgent ||
    (navigator as any)?.userAgentData?.brands?.map((b) => b.brand).join(" ") ||
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

const prettifyNumber = (num: any) => {
  // Convert num to a number in case it's a string or another type
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

const wait = (seconds: number = 1) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

const countdown = (seconds: number, divId: string) => {
  if (seconds < 0) {
    return "Closed";
  }

  const formatTime = (secs: number): string => {
    const days = Math.floor(secs / (24 * 60 * 60));
    secs %= 24 * 60 * 60;
    const hours = Math.floor(secs / (60 * 60));
    secs %= 60 * 60;
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = secs % 60;

    let output = [];
    if (days > 0) {
      output.push(`${days}d`);
    }
    if (hours > 0) {
      output.push(`${hours}h`);
    }
    if (minutes > 0) {
      output.push(`${minutes}m`);
    }
    if (remainingSeconds > 0) {
      output.push(`${remainingSeconds}s`);
    }
    // Simplified formatting
    return output.join(" ");
  };

  const intervalId = setInterval(() => {
    const element = $(divId);
    if (!element) {
      clearInterval(intervalId);
      // console.error(`Element with ID ${divId} not found`);
      //$("#posts").innerHTML = '(ℹ) No posts in this category.'
      return;
    }
    element.innerHTML = formatTime(seconds);
    if (seconds <= 0) clearInterval(intervalId);
    seconds--;
  }, 1000);

  return formatTime(seconds);
};

const currentUnixTimestamp = () => {
  return Math.floor(Date.now() / 1000);
};

const overlayMSG = (text : string) => {
  const html = `
  <div class="overlayMessage">${text}</div>
  `;
  $("#loader").style.display = "none";
  showModal(html);
}

const debounce = (func: Function, wait: number) => {
  let timeout: number | undefined;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

export {
  browserType,
  prettifyNumber,
  formatDate,
  shorthandAddress,
  wait,
  countdown,
  currentUnixTimestamp,
  overlayMSG,
  debounce
};
