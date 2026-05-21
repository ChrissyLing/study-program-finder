# 将 study-program-finder 部署到 Netlify 的操作指南

> 本文分为左右两栏：左边是**你需要自己完成的步骤**，右边是**之后我会帮你继续处理的步骤**。不需要一次做完，按顺序推进就可以。

| 你需要自己做的事 | 之后我会帮你做的事 |
| --- | --- |
| **1. 准备 GitHub 账号** | **A. 帮你检查本地仓库是否已具备 Netlify 部署条件** |
| 1）打开 https://github.com/ ，注册或登录你的 GitHub 账号。<br>2）如果你之前没用过 GitHub，建议先补充头像、昵称和基础个人资料，方便后续识别。 | 1）我会确认项目是否是纯静态站点。<br>2）帮你检查 `README.md`、`.gitignore`、`netlify.toml` 是否齐全。<br>3）帮你确认当前目录结构适合直接从 Git 导入部署。 |
| **2. 新建一个 GitHub 仓库** | **B. 帮你整理首次推送所需的 Git 操作** |
| 1）点击 GitHub 右上角「+」→「New repository」。<br>2）仓库名建议使用：`study-program-finder`。<br>3）可见性按你的需要选择 Public 或 Private。<br>4）不要额外勾选自动生成 README、.gitignore 或 license，因为本地项目里已经有。<br>5）点击「Create repository」。<br>（截图位：GitHub 新建仓库页面） | 1）后续你把仓库地址给我后，我可以帮你写好首轮推送命令。<br>2）例如：配置远程仓库、确认默认分支、整理 commit message。<br>3）如果你希望，我也可以在你准备好账号信息后继续帮你做 push 前检查。 |
| **3. 注册 / 登录 Netlify** | **C. 帮你确认导入时应该怎么选配置** |
| 1）访问 https://app.netlify.com/signup 。<br>2）推荐直接使用 **GitHub 账号登录/注册**，后续仓库授权更省事。<br>3）如果已经有 Netlify 账号，直接登录即可。<br>（截图位：Netlify 注册 / 登录页面） | 1）我会告诉你这个项目在 Netlify 中应按“纯静态站点”处理。<br>2）通常不需要额外构建命令。<br>3）发布目录使用项目根目录即可，本地已经准备好 `netlify.toml`。 |
| **4. 授权 Netlify 访问 GitHub 仓库** | **D. 帮你检查导入后的站点设置是否合理** |
| 1）登录 Netlify 后，点击 **Add new site** → **Import an existing project**。<br>2）选择 **GitHub**。<br>3）如果是第一次绑定，会跳到 GitHub 授权页面。<br>4）建议选择「Only select repositories」，只授权目标仓库，权限更清晰。<br>（截图位：GitHub 授权 Netlify 页面） | 1）我会提醒你重点核对：<br>- Site name 是否合适；<br>- Build command 是否留空；<br>- Publish directory 是否为根目录；<br>- 是否误填了不需要的环境变量。 |
| **5. 从 Git 导入项目并部署** | **E. 部署完成后我会帮你做页面验收** |
| 1）在 Netlify 中选中刚创建的 GitHub 仓库。<br>2）检查部署配置无误后，点击 **Deploy site**。<br>3）等待首次部署完成。<br>4）成功后你会拿到一个 `*.netlify.app` 的默认域名。<br>（截图位：Netlify 部署成功页面） | 1）等你把预览链接发给我后，我可以帮你验收：<br>- 首页是否正常打开；<br>- 数据是否正常加载；<br>- 搜索、筛选、评估等交互是否正常；<br>- 是否存在静态资源路径问题。 |
| **6. 绑定自定义域名（可选）** | **F. 我可以继续给你域名接入指引** |
| 1）如果你有自己的域名，可在 Netlify 后台进入站点设置。<br>2）打开 **Domain management** 或 **Custom domains** 相关页面。<br>3）添加你的域名，例如 `study.example.com`。<br>4）按 Netlify 提示去域名服务商后台配置 DNS 记录。<br>（截图位：Netlify 自定义域名设置页面） | 1）等你告诉我域名注册商后，我可以给你写更细的 DNS 配置步骤。<br>2）我也可以帮你解释应该加 A 记录、CNAME 还是使用 Netlify DNS。<br>3）域名接通后，我还可以陪你一起检查 HTTPS 是否已经自动生效。 |
| **7. 后续更新** | **G. 之后我可以继续帮你维护和发布** |
| 1）以后你每次把代码 push 到 GitHub，Netlify 都会自动重新部署。<br>2）如果你使用分支，还可以得到预览部署链接。 | 1）后续如果你要改字段、改文案、改 UI，或者继续补数据，我都可以在本地先帮你处理好。<br>2）等你准备好 GitHub / Netlify 账号接入信息后，我也可以继续协助完成实际接入步骤。 |

> 小结：这次本地准备工作的目标，是把项目整理成“**一旦你把仓库推到 GitHub，再在 Netlify 点几下就能部署**”的状态。真正的账号登录、授权、仓库创建和上线动作，仍由你亲自完成；后续代码侧的整理和接入配合，我再继续帮你补上。
