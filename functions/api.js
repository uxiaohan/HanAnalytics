import { vh_INIT } from "./utils/init.js";
export async function onRequest({ request, env }) {
  try {
    let { time, siteID, type, session } = await request.json();
    // 是否开启密码登录
    if (env.CLOUDFLARE_WEBSITE_PWD) {
      // 校验登录
      if (!session || session != env.CLOUDFLARE_WEBSITE_PWD) {
        return Response.json({ success: false, code: 401, message: "密码校验失败" }, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*", "Access-Control-Allow-Headers": "*" } });
      } else if (type == "Login") {
        return Response.json({ success: true, message: "登录成功" }, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*", "Access-Control-Allow-Headers": "*" } });
      }
    }
    // 是否配置Cloudflare信息
    if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_API_TOKEN) return Response.json({ success: false, message: "请设置 CLOUDFLARE_ACCOUNT_ID 和 CLOUDFLARE_API_TOKEN" }, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*", "Access-Control-Allow-Headers": "*" } });
    // 参数校验
    const typeARR = ["visit", "list", "path", "referrer", "os", "soft", "area", "echarts"];
    if (!typeARR.includes(type)) return Response.json({ success: false, message: "参数错误" }, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*", "Access-Control-Allow-Headers": "*" } });
    // 时区
    const tz = request.cf.timezone || "Asia/Shanghai";
    // 周期校验
    const timeArr = ["today", "1d", "7d", "30d", "60d", "90d"];
    if (!timeArr.includes(time)) time = "today";
    const data = await vh_INIT(env, time, siteID, tz, type);
    return Response.json({ success: true, data }, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*", "Access-Control-Allow-Headers": "*" } });
  } catch (error) {
    return Response.json({ success: false, error }, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*", "Access-Control-Allow-Headers": "*" } });
  }
}
