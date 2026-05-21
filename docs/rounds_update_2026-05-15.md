# 轮次时间补充变更说明（2026-05-15）

## 本次新增 / 扩展字段
本次在 `data/programs.json` 的每个项目 `deadline` 对象下，基于既有结构扩展了以下字段，未破坏原有字段：

- `deadline.rounds[].start`：轮次开放时间（若官网未公开则为 `null`）
- `deadline.rounds[].end`：轮次截止时间
- `deadline.rounds[].note`：轮次说明（如 visa / rolling / scholarship / final round 等）
- `deadline.source_urls`：官方来源链接数组（保留 `deadline.source_url` 主链接）
- `deadline.last_verified`：本轮核对日期
- `deadline.cycle_label`：当前记录对应的申请周期标签
- `deadline.is_fallback`：是否因官网尚未公布最新周期而回退到上一公开周期
- `deadline.fallback_note`：回退说明

## 覆盖范围
- 覆盖项目数量：**67 / 67**
- 轮次数据统一核对日期：**2026-05-15**
- 核对原则：**以学校官方 admissions / programme 页面为准**

## 前端改动
- 项目详情页新增更清晰的「申请轮次 / Deadline」区块
- 每个轮次展示：**开放时间、截止时间、轮次备注、官方来源链接**
- 在轮次区块中增加：
  - **“以官网为准，申请前复核”** 提醒
  - **最后核对日期**
  - **fallback 标识**（如当前展示的是上一公开周期）

## 未拿到最新数据而回退的项目清单
以下项目官网截至 2026-05-15 尚未公布更新后的下一申请周期，因此当前展示为**上一公开周期参考数据**，并在前端显式标注“最新轮次以官网为准”：

1. `columbia-msba` — 哥伦比亚大学 / 商业分析理学硕士（MSBA）
2. `nus-msba` — 新加坡国立大学 / 商业分析理学硕士（MS in Business Analytics）
3. `mit-mban` — 麻省理工学院 / 商业分析硕士（MBAn）
4. `cmu-tepper-msba` — 卡内基梅隆大学 / 商业分析硕士（Tepper MSBA）
5. `cmu-heinz-mism` — 卡内基梅隆大学 / 信息系统管理硕士（MISM）
6. `duke-mqm-business-analytics` — 杜克大学 / 量化管理硕士（MQM：商业分析）
7. `nyu-stern-msbai` — 纽约大学 / 商务分析与人工智能硕士（MSBAi）
8. `nyu-shanghai-mrs` — 纽约大学 / 市场营销与零售科学硕士（MRS）
9. `usc-ms-business-analytics` — 南加州大学 / 商业分析硕士（USC MSBA）
10. `usc-ms-marketing` — 南加州大学 / 市场营销硕士（USC MS Marketing）
11. `ucla-msba` — 加州大学洛杉矶分校 / 商业分析硕士（UCLA MSBA）
12. `northwestern-mlds` — 西北大学 / 机器学习与数据科学硕士（MLDS）
13. `ut-austin-msba` — 德克萨斯大学奥斯汀分校 / 商业分析硕士（UT Austin MSBA）
14. `nus-msc-marketing-analytics-insights` — 新加坡国立大学 / 市场营销分析与洞察理学硕士
15. `nus-msc-finance` — 新加坡国立大学 / 金融理学硕士
16. `ntu-msc-marketing-science` — 南洋理工大学 / 市场营销科学理学硕士
17. `ntu-msc-business-analytics` — 南洋理工大学 / 商业分析理学硕士
18. `ntu-msc-financial-engineering` — 南洋理工大学 / 金融工程理学硕士
19. `us-cornell-aem` — 康奈尔大学 / 应用经济与管理专业硕士
20. `us-cornell-mps-management` — 康奈尔大学 / 管理学专业硕士
21. `us-cornell-ms-business-analytics` — 康奈尔大学 / 商业分析理学硕士
22. `us-yale-mam` — 耶鲁大学 / 高级管理硕士
23. `us-yale-mms-asset-management` — 耶鲁大学 / 资产管理管理学硕士
24. `us-jhu-ms-finance` — 约翰霍普金斯大学 / 金融理学硕士
25. `us-jhu-ms-marketing` — 约翰霍普金斯大学 / 市场营销理学硕士
26. `us-usc-ms-finance` — 南加州大学 / 金融理学硕士

## 额外说明
- `oxford-msc-marketing-consumer-analytics`：本轮核对时未在牛津大学官方研究生课程列表中找到精确同名项目，因此保留“需人工继续核对”的提示，不编造轮次日期。
- Rolling 类型项目（如 LSE 部分项目）若官网未给固定截止，前端展示为 **Rolling / 招满即止**，并保留官方来源链接与核对日期。
