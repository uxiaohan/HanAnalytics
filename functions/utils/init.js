import { AREAS } from "./area.js";
import { formatTime, countData, echartsData } from "./index.js";
export const vh_INIT = async (env, time, siteID, tz, type = null) => {
  // 查询
  const query = type == "list" ? `SELECT blob1 FROM AnalyticsDataset GROUP BY blob1` : `SELECT blob2, blob3, blob4, blob5, blob6, blob7, double1, double2 ,timestamp FROM AnalyticsDataset WHERE timestamp >= ${formatTime(time, tz)} AND blob1 = '${siteID}' ORDER by timestamp`;
  const defaultUrl = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/analytics_engine/sql`;
  const defaultHeaders = { "content-type": "application/json;charset=UTF-8", "X-Source": "Cloudflare-Workers", Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` };
  const res = await fetch(defaultUrl, { method: "POST", body: query, headers: defaultHeaders });
  const { data } = await res.json();
  if (type == "list") {
    // 校验白名单
    if (env.CLOUDFLARE_WEBSITE_WHITELIST) {
      const websiteArr = env.CLOUDFLARE_WEBSITE_WHITELIST.split("|");
      const websiteIDArr = websiteArr.map((i) => i.trim().split(",")[1]);
      return data
        .filter((i) => websiteIDArr.includes(i.blob1))
        .map((i) => i.blob1)
        .reverse();
    }
    return data.map((i) => i.blob1).reverse();
  }
  // 独立访客
  const visitor = data.filter((i) => i.double1 == 1).length;
  // 访问次数
  const visit = data.filter((i) => i.double2 == 1).length;
  // 总访问量
  const views = data.length;
  // 数据分析
  const resObj = { path: "", referrer: "", os: "", soft: "", area: "" };
  Object.keys(resObj).forEach((i, idx) => {
    resObj[i] = countData(data, `blob${idx + 3}`, {});
  });
  resObj.area.forEach((i) => (i.code = AREAS[i.name]));
  // echarts数据处理
  const echarts_data = echartsData(data, time, tz);
  return { visitor: visitor >= 1000 ? `${(visitor / 1000).toFixed(1)}K` : visitor, visit: visit >= 1000 ? `${(visit / 1000).toFixed(1)}K` : visit, views: views >= 1000 ? `${(views / 1000).toFixed(1)}K` : views, ...resObj, echarts_data };
};
