const parseMs = (ms) => {

    if (typeof ms !== 'number') {
        throw new TypeError('Expected a number');
    }

    let roundTowardZero = ms > 0 ? Math.floor : Math.ceil;

    return {
        days: roundTowardZero(ms / 86400000),
        hours: roundTowardZero(ms / 3600000) % 24,
        minutes: roundTowardZero(ms / 60000) % 60,
        seconds: roundTowardZero(ms / 1000) % 60,
        milliseconds: roundTowardZero(ms) % 1000
    };

};

const addZero = (value, digits) => {
    digits = digits || 2;

    let isNegative = Number(value) < 0;
    let buffer = value.toString();
    let size = 0;

    // Strip minus sign if number is negative
    if (isNegative) {
        buffer = buffer.slice(1);
    }

    size = digits - buffer.length + 1;
    buffer = new Array(size).join('0').concat(buffer);

    // Adds back minus sign if needed
    return (isNegative ? '-' : '') + buffer;
};

export default (ms) => {

    let {days, hours, minutes, seconds} = parseMs(ms)
    seconds = addZero(seconds)
    if (days) return `${days}:${addZero(hours)}:${addZero(minutes)}:${seconds}`
    if (hours) return `${hours}:${addZero(minutes)}:${seconds}`
    if (minutes) return `${hours ? hours : 0}:${addZero(minutes)}:${seconds}`
    return `${hours ? hours : '0'}:${minutes}:${seconds}`
}