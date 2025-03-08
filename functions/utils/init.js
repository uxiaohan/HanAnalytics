import { AREAS } from "./area.js";
import { formatTime, countData, echartsData } from "./index.js";
export const vh_INIT = async (env, time, siteID, tz, type = null) => {
  // 查询
  const defaultHeaders = { "content-type": "application/json;charset=UTF-8", "X-Source": "Cloudflare-Workers", Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` };
  const defaultUrl = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/analytics_engine/sql`;
  const SQL_WHERE = `FROM AnalyticsDataset WHERE timestamp >= ${formatTime(time, tz)} AND blob1 = '${siteID}'`;
  let resJSON;
  switch (type) {
    // 获取数据
    case "visit":
      {
        const query = `SELECT SUM(_sample_interval) AS views, SUM(IF(double1 = '1', double1, 0.0)) AS visitor, SUM(IF(double2 = '1', double2, 0.0)) AS visit ${SQL_WHERE}`;
        const res = await fetch(defaultUrl, { method: "POST", body: query, headers: defaultHeaders });
        const { data } = await res.json();
        const { visitor, visit, views } = data[0];
        resJSON = { visitor: visitor >= 1000 ? `${(visitor / 1000).toFixed(1)}K` : visitor, visit: visit >= 1000 ? `${(visit / 1000).toFixed(1)}K` : visit, views: Number(views) >= 1000 ? `${(Number(views) / 1000).toFixed(1)}K` : Number(views) };
      }
      break;

    // 获取 WebSite 列表
    case "list":
      {
        const query = "SELECT blob1 FROM AnalyticsDataset GROUP BY blob1";
        const res = await fetch(defaultUrl, { method: "POST", body: query, headers: defaultHeaders });
        const { data } = await res.json();
        // 校验白名单
        if (env.CLOUDFLARE_WEBSITE_WHITELIST) {
          const websiteArr = env.CLOUDFLARE_WEBSITE_WHITELIST.split("|");
          const websiteIDArr = websiteArr.map((i) => i.trim().split(",")[1]);
          resJSON = data
            .filter((i) => websiteIDArr.includes(i.blob1))
            .map((i) => i.blob1)
            .reverse();
        } else {
          resJSON = data.map((i) => i.blob1).reverse().slice(0, 100);
        }
      }
      break;

    // 获取图表
    case "echarts":
      {
        const query = `SELECT formatDateTime(timestamp, '%Y-%m-%d %H:00:00') AS hour, SUM(_sample_interval) AS count ${SQL_WHERE} GROUP BY hour ORDER BY hour`;
        const res = await fetch(defaultUrl, { method: "POST", body: query, headers: defaultHeaders });
        const { data } = await res.json();
        resJSON = echartsData(data, time, tz);
      }
      break;

    default:
      {
        const keyARR = { path: "blob3", referrer: "blob4", os: "blob5", soft: "blob6", area: "blob7" };
        const query = `SELECT ${keyARR[type]} ${SQL_WHERE}`;
        const res = await fetch(defaultUrl, { method: "POST", body: query, headers: defaultHeaders });
        const { data } = await res.json();
        // 处理其他数据
        resJSON = countData(data, keyARR[type], {}).slice(0, 100);
        // 处理Area
        if (type == "area") resJSON.forEach((i) => (i.code = AREAS[i.name]));
      }
      break;
  }
  return resJSON;
};
