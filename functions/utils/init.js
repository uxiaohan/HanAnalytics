import { AREAS } from './area.js';
import { formatTime, countData, echartsData } from './index.js';
export const vh_INIT = async (env, time, siteID, tz, type = null) => {
  // 查询
  const query = type == 'list' ? `SELECT blob1 FROM AnalyticsDataset GROUP BY blob1` : `SELECT blob2, blob3, blob4, blob5, blob6, blob7, double1, double2 ,timestamp FROM AnalyticsDataset WHERE timestamp > ${formatTime(time)} AND blob1 = '${siteID}'`;
  const defaultUrl = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/analytics_engine/sql`;
  const defaultHeaders = { 'content-type': 'application/json;charset=UTF-8', 'X-Source': 'Cloudflare-Workers', Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` };
  const res = await fetch(defaultUrl, { method: 'POST', body: query, headers: defaultHeaders });
  const { data } = await res.json();
  if (type == 'list') return data.map((i) => i.blob1).reverse();
  // 独立访客
  const visitor = data.filter((i) => i.double1 == 1).length;
  // 访问次数
  const visit = data.filter((i) => i.double2 == 1).length;
  // 总访问量
  const views = data.length;
  // 数据分析
  const resObj = { path: '', referrer: '', os: '', soft: '', area: '' };
  Object.keys(resObj).forEach((i, idx) => {
    resObj[i] = countData(data, `blob${idx + 3}`, {});
  });
  resObj.area.forEach((i) => i.code = AREAS[i.name]);
  // echarts数据处理
  const echarts_data = echartsData(data, time, tz);
  return { visitor, visit, views, ...resObj, echarts_data };
};
