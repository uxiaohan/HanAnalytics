import { UAParser } from "ua-parser-js";
export async function onRequest({ request, env }) {
  try {
    const { host, path, referrer, website, visitor, visit } = await request.json();
    // 校验统计白名单
    if (env.CLOUDFLARE_WEBSITE_WHITELIST) {
      const websiteArr = env.CLOUDFLARE_WEBSITE_WHITELIST.split("|");
      const currentWebsite = websiteArr.find(i => i.includes(website) && i.includes(host));
      if (!currentWebsite) return Response.json({ success: false, message: "当前网站不在白名单内" }, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
    }
    // UA
    const userAgent = request.headers.get("user-agent") || undefined;
    const parsedUserAgent = new UAParser(userAgent);
    const { browser, os } = parsedUserAgent.getResult();
    // Area
    const area = request.cf ? (String(request.cf.country).trim() || "Unknown") : "Unknown";
    // Referrer
    let referrerUrl = "";
    try {
      referrerUrl = new URL(referrer).host == host ? "" : referrer;
    } catch (error) {
      referrerUrl = referrer;
    }
    // 写数据
    website &&
      host &&
      env.AnalyticsBinding.writeDataPoint({
        blobs: [
          website, //website - blob1
          host, //Host - blob2
          path || '/', //path - blob3
          referrerUrl, //referrer - blob4
          os.name == 'android' ? 'Android' : (os.name || "Unknown"), //osName - blob5
          browser.name == "Chrome WebView" ? "Chrome" : (browser.name || "Unknown"), //browserName - blob6
          area, //areaCode - blob7
          userAgent //UA - blob8
        ],
        doubles: [visitor ? 1 : 0, visit ? 1 : 0]
      }); // Response
  } catch (error) {
    return Response.json({ success: false, error, message: "Han Analytics Send Error" }, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  }
  return Response.json({ success: true, message: "Hello Han Analytics" }, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
