import { UAParser } from 'ua-parser-js';
export async function onRequest({ request, env }) {
  try {
    const { host, path, referrer, website, visitor, visit } = await request.json();
    // UA
    const userAgent = request.headers.get('user-agent') || undefined;
    const parsedUserAgent = new UAParser(userAgent);
    const { browser, os } = parsedUserAgent.getResult();
    // Area
    const area = request.cf ? request.cf.country : '-';
    // 写数据
    website &&
      host &&
      env.AnalyticsBinding.writeDataPoint({
        blobs: [
          website, //website - blob1
          host, //Host - blob2
          path, //path - blob3
          new URL(referrer).host == host ? '' : referrer, //referrer - blob4
          os.name || 'Windows', //osName - blob5
          browser.name == 'Chrome WebView' ? 'Chrome' : browser.name || 'Chrome', //browserName - blob6
          area, //areaCode - blob7
          userAgent //UA - blob8
        ],
        doubles: [visitor ? 1 : 0, visit ? 1 : 0]
      });  // Response
    return Response.json({ success: true, message: 'Hello Han Analytics' }, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  } catch (error) {
    return Response.json({ success: false, message: 'Han Analytics Send Error' }, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }
}
