((window) => {
  const { location, document, navigator } = window;
  const { hostname: host, pathname } = location;
  const { currentScript, referrer } = document;
  const currentRef = !referrer.includes(host) ? referrer : "";
  if (!currentScript || navigator.userAgent.indexOf("Electron") > 0) return;
  const attr = currentScript.getAttribute.bind(currentScript);
  const website = attr("data-website-id");
  const sendURL = new URL(currentScript.src).origin + "/send";
  let visitor = true;
  let visit = true;
  // 访问间隔 (分钟)
  const AccessInterval = 30;
  // 页面访问
  let PathVisit = {};
  try {
    PathVisit = JSON.parse(localStorage.getItem("_vhLastVisit")) || {};
    if (typeof PathVisit != "object") PathVisit = {};
  } catch (error) {
    localStorage.removeItem("_vhLastVisit");
  }
  const vhLastVisit = PathVisit[pathname] || 0;
  // 访客访问
  const vhLastVisitor = localStorage.getItem("_vhLastVisitor") || 0;
  // 是否是今天缓存
  const nowVisitDate = new Date();
  const vhLastVisitorDate = new Date(Number(vhLastVisitor));
  const vhLastVisitDate = new Date(Number(vhLastVisit));
  // 访客访问
  if (nowVisitDate.getFullYear() === vhLastVisitorDate.getFullYear() && nowVisitDate.getMonth() === vhLastVisitorDate.getMonth() && nowVisitDate.getDate() === vhLastVisitorDate.getDate()) {
    // 今天缓存即老用户
    visitor = false;
  } else {
    // 否则更新缓存时间
    localStorage.setItem("_vhLastVisitor", Date.now());
  }
  // 访问次数访问
  if (Date.now() - vhLastVisitDate.getTime() < AccessInterval * 60 * 1000) {
    // 超过访问间隔即老访客
    visit = false;
  } else {
    // 否则更新缓存时间
    PathVisit[pathname] = Date.now();
    localStorage.setItem("_vhLastVisit", JSON.stringify(PathVisit));
  }

  // URL转码
  const encode = (str) => {
    if (!str) return "";
    try {
      if (decodeURI(str) !== str) return decodeURI(str);
    } catch (e) {
      return str;
    }
    return encodeURI(str);
  };

  // 上报
  const send = async () => {
    if (!website) return;
    try {
      await fetch(sendURL, {
        method: "POST",
        body: JSON.stringify({
          website,
          host,
          path: encode(pathname),
          referrer: encode(currentRef),
          visitor,
          visit
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });
    } catch (e) {
      /* empty */
    }
  };
  send();
})(window);
