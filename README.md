# 留学项目对比与背景评估助手

一个面向申请者的纯静态网页工具，基于 **HTML + JavaScript + JSON** 实现，无需后端、无需构建流程。

## 当前能力

- 项目检索：搜索、地区筛选、方向标签筛选、排序（含 **性价比 PPP**：学费 ÷ QS 启发式）
- 项目库：**108** 个项目，覆盖 UK / US / HK / SG，方向含 MKT、Finance、BA、Management、Economics、MIS 等
- 背景评估：用户手动填写档案并点击评估后，展示 Reach / Match / Safety 结果
- 轻量 SaaS：本地档案保存 / 自动载入 / 清空，项目收藏，本地对比队列
- 横向滚动优化：列表表格 sticky 首列、横滚提示、移动端顺滑滚动
- 数据展示：学费、学制、Deadline、就业方向、语言 / GPA / GRE / GMAT 等字段

## 目录结构

```text
study-program-finder/
├─ index.html
├─ app.js
├─ deadline-ui.js
├─ fx-ui.js
├─ data/
│  ├─ programs.json
│  └─ fx_rates_fallback.json
├─ docs/
│  ├─ data_sources.md
│  ├─ fx_update_2026-05-15.md
│  ├─ rounds_update_2026-05-15.md
│  └─ saas_update_2026-05-15.md
├─ scripts/
└─ netlify.toml
```

## 本地预览

### 方式 A：使用 Python

```bash
cd study-program-finder
python3 -m http.server 8000
```

打开浏览器访问：

- `http://localhost:8000`

### 方式 B：使用 npx serve

```bash
cd study-program-finder
npx serve .
```

## 使用说明

1. 先通过搜索、筛选浏览项目本体信息
2. 如需个人匹配结果，展开“申请者档案与匹配评估”面板
3. 保存档案后可自动载入，但刷新页面不会自动重新评估
4. 收藏、对比、档案都仅保存在当前浏览器 localStorage 中

## 本地存储说明

- 档案、收藏、对比都不会上传到后端
- 清除浏览器缓存、切换浏览器或更换设备后，本地数据会丢失
- 若字段缺失，页面会直接标注“数据缺失”，不会补造内容
