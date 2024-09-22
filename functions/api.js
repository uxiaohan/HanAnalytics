import { vh_INIT } from './utils/init.js';
export async function onRequest({ request, env }) {
  try {
    let { time, siteID, type } = await request.json();
    if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_API_TOKEN) return Response.json({ success: false, message: '请设置 CLOUDFLARE_ACCOUNT_ID 和 CLOUDFLARE_API_TOKEN' }, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': '*', 'Access-Control-Allow-Headers': '*' } });
    // TZ
    const tz = request.cf.timezone || 'Asia/Shanghai';
    // // 时间校验
    const timeArr = ['today', '1d', '7d', '30d', '90d'];
    if (!timeArr.includes(time)) time = 'today';
    const data = await vh_INIT(env, time, siteID, tz, type);
    return Response.json({ success: true, data }, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': '*', 'Access-Control-Allow-Headers': '*' } });
  } catch (error) {
    return Response.json({ success: false, error }, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': '*', 'Access-Control-Allow-Headers': '*' } });
  }
}
