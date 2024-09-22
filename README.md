# Han-Analytics

· Han-Analytics 是一个简单的网络分析跟踪器和仪表板，托管在被称为赛博菩萨的 Cloudflare 上,无成本稳定运行,每天可达10万次免费统计。

· 域名、服务器、数据库 通通都不用! 托管在 Cloudflare Pages 上即可快速部署网站分析仪表板。

### 页面截图

![Han-Analytics](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727007937.webp)
![Han-Analytics](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1726993735.webp)

### 部署

- 登录到 [Cloudflare Login](https://dash.cloudflare.com/sign-up)，没有的注册一个 [Cloudflare SignUp](https://dash.cloudflare.com/sign-up)
- 点击 Workers 和 Pages 随便创建一个 workers 并开启 分析引擎，然后复制 workers ID 备用。[操作截图1](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001144.webp)，[操作截图2](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001550.webp)
- 创建一个 [Cloudflare API token](https://dash.cloudflare.com/profile/api-tokens) 备用。[操作截图1](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001058.webp)，[操作截图2](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001090.webp)，[操作截图3](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001118.webp)
- Fork 项目到自己的 Github 账户，修改 `wrangler.toml` 文件中的 `CLOUDFLARE_ACCOUNT_ID` 为自己的 Cloudflare Workers 账户 ID，`CLOUDFLARE_API_TOKEN` 为刚才创建的 API token。
- 登录 Cloudflare 并创建 Pages 项目 ，链接Github仓库，选择刚刚 Fork 的项目，架构选择Vue，部署即可。[操作截图1](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001163.webp)，[操作截图2](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001181.webp)，[操作截图3](https://i0.wp.com/uxiaohan.github.io/v2/2024/09/1727001197.webp)
- cloudflare pages 部署完成后，访问 `https://xxxxxx.pages.dev` 即可访问网站分析仪表板。（注意：首次部署生成的域名可能需要几分钟时间生效，请耐心等待）
- 部署成功后，首次打开页面没有数据，请尽快集成到自己的网站并出现有效访问后，再次打开页面即可看到数据！

### 集成使用

```js
// 在网站底部插入以下代码即可集成网站分析仪表板
<script defer src="https://xxxxxx.pages.dev/tracker.min.js" data-website-id="自定义网站唯一标识"></script>
```

### 数据问题

数据问题一般是由于 Cloudflare Analytics Engine 无法访问网站导致的，请确保网站可以正常访问，并且 Cloudflare Analytics Engine 已经开启。

使用 Cloudflare Analytics Engine 数据集，它完全通过 HTTP 使用 Cloudflare 的 API 进行通信，数据完全来源于 Cloudflare Analaytics Engine 数据集中读取
Cloudflare Analytics Engine 使用抽样技术，以可承受的规模化方式实现大量数据提取/查询（这类似于大多数其他分析工具，请参阅Google Analytics 上的抽样）。您可以在此处详细了解抽样技术如何与 CF AE 配合使用。

### 使用说明

https://www.vvhan.com/article/han-analytics.html