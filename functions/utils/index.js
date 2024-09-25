import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
dayjs.extend(utc);
dayjs.extend(timezone);

// SqlTIme格式化
export const formatTime = (timeStr, tz) => {
  const defaultTz = new Intl.DateTimeFormat([], { timeZone: undefined }).resolvedOptions().timeZone || "UTC";
  const startDay = dayjs()
    .tz(tz)
    .subtract(Number(timeStr.replace("d", "")), "day")
    .startOf("day")
    .tz(defaultTz)
    .format("YYYY-MM-DD HH:mm:ss");
  const endDay = dayjs()
    .tz(tz)
    .add(timeStr == "1d" ? 0 : 1, "day")
    .startOf("day")
    .tz(defaultTz)
    .format("YYYY-MM-DD HH:mm:ss");
  let sqlTime = "";
  switch (timeStr) {
    case "1d":
    case "7d":
    case "30d":
    case "90d":
      sqlTime = `toDateTime('${startDay}') AND timestamp < toDateTime('${endDay}')`;
      break;
    default:
      sqlTime = `NOW() - INTERVAL '${dayjs().tz(tz).hour()}' HOUR`;
  }
  return sqlTime;
};

// 次数统计
export const countData = (arr, key, keyType, status = true) => {
  // 处理JS中对象无序排列问题
  const _StringKey = status ? "" : `-_-www.vvhan.com-_-`;
  let res = arr.reduce((_arr, v) => {
    _arr[`${v[key]}${_StringKey}`] ? (_arr[`${v[key]}${_StringKey}`] += 1) : (_arr[`${v[key]}${_StringKey}`] = 1);
    return _arr;
  }, {});

  // 数据处理
  const timeArr = {};
  switch (keyType.key) {
    case "today":
      Array.from({ length: keyType.now.hour() }).forEach((i, idx) => {
        timeArr[`${String(idx).padStart(2, "0")}${_StringKey}`] = 0;
      });
      break;

    case "1d":
      Array.from({ length: 24 }).forEach((i, idx) => {
        timeArr[`${String(idx).padStart(2, "0")}${_StringKey}`] = 0;
      });
      break;

    case "7d":
    case "30d":
    case "90d":
      Array.from({ length: Number(String(keyType.key).replace("d", "")) }).forEach((i, idx) => {
        timeArr[
          `${keyType.now
            .subtract(Number(String(keyType.key).replace("d", "")), "day")
            .add(idx, "day")
            .format("MM.DD")}${_StringKey}`
        ] = 0;
      });
      break;

    default:
      break;
  }
  res = { ...timeArr, ...res };
  return Object.entries(res)
    .map(([name, value]) => ({ name: name.replace(_StringKey, ""), value }))
    .sort((a, b) => (status ? b.value - a.value : Number(a.name) - Number(b.name)));
};

// Echarts
export const echartsData = (data, key, tz) => {
  // key=0 Today - 12小时
  // key=1 Last24小时 - 24小时
  // key=7 过去7天
  // key=30 过去30天
  // key=90 过去90天
  let timeArr = [];
  switch (key) {
    case "today":
    case "1d":
      timeArr = data.map(i => {
        i.t_str = dayjs.utc(i.timestamp).tz(tz).format("HH");
        return i;
      });
      break;
    case "7d":
    case "30d":
    case "90d":
      timeArr = data.map(i => {
        i.t_str = dayjs.utc(i.timestamp).tz(tz).format("MM.DD");
        return i;
      });
      break;
    default:
      timeArr = data.map(i => {
        i.t_str = dayjs.utc(i.timestamp).tz(tz).format("HH");
        return i;
      });
  }
  const now = dayjs().tz(tz);
  return countData(timeArr, "t_str", { key, now }, false);
};
