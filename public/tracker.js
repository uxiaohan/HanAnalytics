((window) => {
  const { location, document, navigator } = window;
  const { host, pathname } = location;
  const { currentScript, referrer } = document;
  const currentRef = referrer !== host ? referrer : '';
  if (!currentScript || navigator.userAgent.indexOf('Electron') > 0) return;
  const attr = currentScript.getAttribute.bind(currentScript);
  const website = attr('data-website-id');
  const sendURL = new URL(currentScript.src).origin + '/send';
  let visitor = true;
  let visit = true;
  // 访问间隔 (分钟)
  const AccessInterval = 30;
  const vhLastVisitT = Number(localStorage.getItem('_vhLastVisitT')) || 0;
  // 是否是今天缓存
  const nowVisitDate = new Date();
  const vhLastVisitDate = new Date(vhLastVisitT);
  if (nowVisitDate.getFullYear() === vhLastVisitDate.getFullYear() && nowVisitDate.getMonth() === vhLastVisitDate.getMonth() && nowVisitDate.getDate() === vhLastVisitDate.getDate()) {
    // 今天缓存即老用户
    visitor = false;
  }
  if (Date.now() - vhLastVisitDate.getTime() < AccessInterval * 60 * 1000) {
    // 超过访问间隔即老访客
    visit = false;
  } else {
    // 否则更新缓存时间
    localStorage.setItem('_vhLastVisitT', Date.now());
  }

  // URL转码
  const encode = (str) => {
    if (!str) return '';
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
        method: 'POST',
        body: JSON.stringify({
          website,
          host,
          path: encode(pathname),
          referrer: encode(currentRef),
          visitor,
          visit
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (e) {
      /* empty */
    }
  };
  send();
})(window);
