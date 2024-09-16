/// <reference types="user-agent-data-types" />
import { $ } from "./ui.js";
const browserType = () => {
    var _a, _b;
    const userAgent = navigator.userAgent ||
        ((_b = (_a = navigator === null || navigator === void 0 ? void 0 : navigator.userAgentData) === null || _a === void 0 ? void 0 : _a.brands) === null || _b === void 0 ? void 0 : _b.map((b) => b.brand).join(" ")) ||
        "";
    if (/chrome|chromium|crios/i.test(userAgent) && !/edg/i.test(userAgent)) {
        return "Chrome";
    }
    else if (/firefox|fxios/i.test(userAgent)) {
        return "Firefox";
    }
    else if (/safari/i.test(userAgent) &&
        !/chrome|chromium|crios/i.test(userAgent)) {
        return "Safari";
    }
    else if (/edg/i.test(userAgent)) {
        return "Edge";
    }
    else if (/opr\//i.test(userAgent) || /opera/i.test(userAgent)) {
        return "Opera";
    }
    else {
        return "Other";
    }
};
const prettifyNumber = (num) => {
    const absNum = Math.abs(num);
    const sign = num < 0 ? "-" : "";
    if (absNum >= 1000000000) {
        return `${sign}${(absNum / 1000000000).toFixed(2)}B`;
    }
    else if (absNum >= 1000000) {
        return `${sign}${(absNum / 1000000).toFixed(2)}M`;
    }
    else if (absNum >= 1000) {
        return `${sign}${(absNum / 1000).toFixed(2)}K`;
    }
    else {
        return `${sign}${num.toFixed(2)}`;
    }
};
const formatDate = (date) => {
    var currentDate = new Date(date);
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();
    return ((day < 10 ? "0" + day : day) +
        "." +
        (month < 10 ? "0" + month : month) +
        "." +
        year);
};
const shorthandAddress = (address, length = 4) => {
    if (!address) {
        return "";
    }
    return `${address.substr(0, length)}...${address.substr(address.length - length, length)}`;
};
const wait = (seconds = 1) => {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};
const countdown = (seconds, divId) => {
    if (seconds < 0) {
        return "Closed";
    }
    const formatTime = (secs) => {
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
            console.error(`Element with ID ${divId} not found`);
            //$("#posts").innerHTML = '(ℹ) No posts in this category.'
            return;
        }
        element.innerHTML = formatTime(seconds);
        if (seconds <= 0)
            clearInterval(intervalId);
        seconds--;
    }, 1000);
    return formatTime(seconds);
};
const currentUnixTimestamp = () => {
    return Math.floor(Date.now() / 1000);
};
export { browserType, prettifyNumber, formatDate, shorthandAddress, wait, countdown, currentUnixTimestamp, };
//# sourceMappingURL=utilities.js.map