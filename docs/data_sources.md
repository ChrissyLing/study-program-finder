# 字段来源清单（Phase 1 Demo）

更新时间：2026-04-27（人工/脚本抓取的**最后核对日期**，并不代表字段永久有效）

> 重要原则：
> - **不编造任何数据**。拿不到就写“数据缺失 / 未公开”。
> - 学费 / 语言 / 截止日期等字段会变动，页面与数据中都应提示：**以官网为准，申请前复核**。

---

## 1. 字段级别来源规则

### 1.1 QS 世界排名（来源：QS 官网）
- 来源站点：`topuniversities.com`（QS 旗下 TopUniversities）
- 取值逻辑：读取大学 Profile 页里的 “QS World University Rankings” 对应名次（例如 `# 8` / `# 44` / `# =38`）。
- 风险：
  - QS 页面结构可能变化，脚本解析可能失败；
  - 2026/27 期间若 QS 更新新一届，名次会变动。

### 1.2 学费（来源：学校/项目官网）
- 原则：只记录官网明确写出的费用数字与对应 intake/学年。
- 人民币换算：本 Phase 1 先不做换算（汇率波动大），避免制造“看起来很精确但不可靠”的数字。

### 1.3 语言要求（来源：学校/项目官网）
- 原则：尽量填写 TOEFL/IELTS 及小分；若官网只给“等级/分类”（如 Level 2、Standard），则：
  - 详情页仍展示等级；
  - 另外找该校官方“等级→分数”对照表补齐。

### 1.4 GPA / 学术门槛（来源：学校/项目官网）
- 只记录官网写的**最低门槛/建议门槛**。
- 必须标注：**官方最低要求，实际录取普遍高于此**。

### 1.5 GRE / GMAT（来源：学校/项目官网）
- 只记录官网写的 required / optional / recommended。
- 如果表述不明确，宁可写“要求可能变化（建议准备）”，不要推断。

### 1.6 申请截止（来源：学校/项目官网）
- 字段最容易变动：必须提示“以官网为准，申请前复核”。

### 1.7 第三方参考字段（来源：众包平台/第三方网站）
- Phase 1 Demo 暂不接入（统一标注“数据缺失”）。
- Phase 2 再接入时要求：
  - 必须写清楚来源（gradcafe / 一亩三分地 / Niche / chasedream 等）
  - 必须写清楚“截至日期”
  - 表述必须是“参考信息”，不能当作官方口径

### 1.8 就业方向（Phase 2 新增字段）
- 优先来源：项目/学院官网公开页面（例如 Career / Outcomes / Employment Report / Placement 等栏目）。
- 若项目未公开官方就业数据：
  - 允许填写“领域常见方向”（例如：数据分析、咨询、产品等），但必须标注为非官方信息，并提示申请者自行核对。
- 字段要求：必须附上 `source_url` 和 `last_verified`；拿不到就写“数据缺失”。

---

## 2. Phase 1 Demo：项目级别来源（5 个样例）

> 说明：下面链接主要用于“可追溯”。页面内容可能更新，因此建议你点开核对。

### 2.1 LSE — MSc Marketing
- 项目官网：
  - https://www.lse.ac.uk/study-at-lse/graduate/msc-marketing
- 学费（GBP 39,900，2026/27）：同上页面（Fees and funding 段落）
- 时长（12 months）：同上页面（Key information）
- 语言要求（Standard）：同上页面（Entry requirements / Additional tests）
- IELTS/TOEFL 分数对照（Standard → 分数表）：
  - https://www.lse.ac.uk/study-at-lse/Graduate/Prospective-students/Entry-requirements/English-language-requirements
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/london-school-economics-political-science-lse

### 2.2 UCL — Management MSc
- 项目官网：
  - https://www.ucl.ac.uk/prospective-students/graduate/taught-degrees/management-msc
- 学费（GBP 42,700，2026/27）：同上页面
- 时长（1 calendar year）：同上页面
- 语言等级（Level 2）：同上页面
- Level 2 → IELTS 分数对照（UCL 官方 Academic Manual）：
  - https://www.ucl.ac.uk/study/current-students/academic-manual/chapters/chapter-1-student-recruitment-and-admissions/section-2-entrance-requirements
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/ucl

### 2.3 HKUST — MSc in Business Analytics
- 项目官网：
  - https://msba.hkust.edu.hk/
- 学费（HKD 395,000，2026/27 intake）：
  - https://msba.hkust.edu.hk/admission/program-fee-expenses
- 时长（全日制 1 年 / 兼读制 2 年）：
  - https://msba.hkust.edu.hk/program/overview-schedule
- 语言要求、GMAT/GRE（官方最低要求/是否强制）：
  - https://msba.hkust.edu.hk/admission/admission-requirements
  - https://msba.hkust.edu.hk/admission/faq
- 截止日期（Phase 1~4）：
  - https://msba.hkust.edu.hk/admission/application-schedule-procedures
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/hong-kong-university-science-technology

### 2.4 Columbia — MS in Business Analytics (MSBA)
- 项目官网：
  - https://ieor.columbia.edu/business-analytics-msba
- 项目时长/学分、语言、GPA、GRE/GMAT（IEOR Admissions FAQ）：
  - https://ieor.columbia.edu/masters-admissions-faqs
- 学费：
  - https://ieor.columbia.edu/tuition-and-fees
  - 现状：该页面被 Cloudflare 安全验证拦截，Phase 1 Demo 无法自动抓取到具体数字 → 在数据中标“数据缺失”。
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/columbia-university

### 2.5 NUS — Master of Science in Business Analytics
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/national-university-singapore-nus
- 项目官网（用于后续补齐学费/语言/截止等）：
  - https://masters.nus.edu.sg/programmes/master-of-science-in-business-analytics
- 现状：Phase 1 Demo 先挂上条目，其他字段待 Phase 2 补齐。

---

## 3. Phase 3 新增项目来源清单（2026-04-28）

> 本轮目标：在不改动既有 44 个项目核心数据的前提下，将数据集扩展到 **67 个项目**。以下仅记录本轮新增项目的核心来源，学费 / 语言 / 截止日期等可能变动字段请以官网为准，申请前复核。

### 4.1 美国新增（9 个）
- Cornell MPS in Applied Economics and Management（Dyson）：项目页 https://dyson.cornell.edu/programs/graduate/mps/ ；学费/申请 https://dyson.cornell.edu/programs/graduate/mps/admissions/tuition/ 、https://dyson.cornell.edu/programs/graduate/mps/admissions/ ；QS https://www.topuniversities.com/universities/cornell-university
- Cornell MPS in Management：项目页 https://www.johnson.cornell.edu/programs/specialized-masters/mps-in-management/ ；学费/申请 https://www.johnson.cornell.edu/programs/specialized-masters/mps-in-management/tuition-and-funding/ 、https://www.johnson.cornell.edu/programs/specialized-masters/mps-in-management/application-guide/ ；QS https://www.topuniversities.com/universities/cornell-university
- Cornell MS in Business Analytics：项目页 https://www.johnson.cornell.edu/programs/specialized-masters/ms-in-business-analytics/ ；学费/申请 https://www.johnson.cornell.edu/programs/specialized-masters/ms-in-business-analytics/tuition-and-funding/ 、https://www.johnson.cornell.edu/programs/specialized-masters/ms-in-business-analytics/application-guide/ ；QS https://www.topuniversities.com/universities/cornell-university
- Yale SOM MAM：项目页 https://som.yale.edu/programs/mam ；学费/申请 https://som.yale.edu/programs/mam/affording-your-mam/mam-cost-information 、https://som.yale.edu/programs/mam/admissions/application-information ；QS https://www.topuniversities.com/universities/yale-university
- Yale SOM MMS in Asset Management：项目页 https://som.yale.edu/programs/mms-asset-management ；学费/申请 https://som.yale.edu/programs/mms-asset-management/affording-your-mms/cost-information 、https://som.yale.edu/programs/mms-asset-management/admissions/application-information ；QS https://www.topuniversities.com/universities/yale-university
- JHU Carey MS in Finance：项目页 https://carey.jhu.edu/programs/master-science-programs/ms-finance-full-time ；学费/申请/截止 https://carey.jhu.edu/admissions/tuition-fees 、https://carey.jhu.edu/admissions/how-to-apply/ms-full-time 、https://carey.jhu.edu/admissions/deadlines ；QS https://www.topuniversities.com/universities/johns-hopkins-university
- JHU Carey MS in Marketing：项目页 https://carey.jhu.edu/programs/master-science-programs/ms-marketing-full-time ；学费/申请/截止 https://carey.jhu.edu/admissions/tuition-fees 、https://carey.jhu.edu/admissions/how-to-apply/ms-full-time 、https://carey.jhu.edu/admissions/deadlines ；QS https://www.topuniversities.com/universities/johns-hopkins-university
- USC Marshall MS in Finance：项目页 https://www.marshall.usc.edu/programs/graduate-programs/specialized-masters/ms-finance/ ；学费/申请/截止 https://www.marshall.usc.edu/programs/graduate-programs/specialized-masters/ms-finance/tuition-fees 、https://www.marshall.usc.edu/programs/graduate-programs/specialized-masters/ms-finance/admissions 、https://www.marshall.usc.edu/programs/specialized-masters-programs/master-science-finance/admissions/dates-and-deadlines ；QS https://www.topuniversities.com/universities/university-southern-california
- UVA McIntire M.S. in Commerce（作为 UVA 泛商科对应项目）：项目页 https://www.commerce.virginia.edu/ms-commerce/ ；学费/申请 https://www.commerce.virginia.edu/ms-commerce/admissions/tuition-fees 、https://www.commerce.virginia.edu/ms-commerce/admissions ；QS https://www.topuniversities.com/universities/university-virginia

### 4.2 英国新增（8 个）
- LSE MSc Management and Strategy（用于承接用户点名的 Management Science）：项目页 https://www.lse.ac.uk/study-at-lse/graduate/msc-management-and-strategy ；英语要求 https://www.lse.ac.uk/study-at-lse/Graduate/Prospective-students/Entry-requirements/English-language-requirements ；费用表 https://info.lse.ac.uk/staff/divisions/Planning-Division/Assets/Documents/Table-of-Fees-2026-27-and-PGR-structure-combined-02Mar2026.pdf ；QS https://www.topuniversities.com/universities/london-school-economics-political-science-lse
- LSE MSc Finance：项目页 https://www.lse.ac.uk/study-at-lse/graduate/msc-finance-full-time ；QS https://www.topuniversities.com/universities/london-school-economics-political-science-lse
- LSE MSc Economics：项目页 https://www.lse.ac.uk/study-at-lse/graduate/msc-economics ；费用表同上；QS https://www.topuniversities.com/universities/london-school-economics-political-science-lse
- Imperial MSc Economics & Strategy for Business：项目页 https://www.imperial.ac.uk/business-school/masters/economics-strategy-business/ ；申请/就业 https://www.imperial.ac.uk/business-school/masters/economics-strategy-business/admissions/ 、https://www.imperial.ac.uk/business-school/masters/economics-strategy-business/career-impact/ ；QS https://www.topuniversities.com/universities/imperial-college-london
- Imperial MSc Risk Management & Financial Engineering：项目页 https://www.imperial.ac.uk/business-school/masters/risk-management/ ；费用/就业 https://www.imperial.ac.uk/business-school/masters/risk-management/fees-and-funding/ 、https://www.imperial.ac.uk/business-school/masters/risk-management/career-impact/ ；QS https://www.topuniversities.com/universities/imperial-college-london
- UCL Economics MSc：项目页 https://www.ucl.ac.uk/prospective-students/graduate/taught-degrees/economics-msc ；英语要求 https://www.ucl.ac.uk/prospective-students/graduate/learning-and-living-ucl/international-students/english-language-requirements ；QS https://www.topuniversities.com/universities/ucl
- Warwick MSc Business & Finance：项目页 https://www.wbs.ac.uk/courses/masters/business-finance/ ；要求/截止 https://wbs.ac.uk/courses/postgraduate/business-finance/requirements 、https://warwick.ac.uk/study/postgraduate/courses/msc-business-finance/ ；QS https://www.topuniversities.com/universities/university-warwick
- Edinburgh MSc Finance and Investment（作为用户点名 Edinburgh MSc Finance 的当前官方对应项目）：项目页 https://www.business-school.ed.ac.uk/msc/finance-investment ；费用/要求 https://www.business-school.ed.ac.uk/msc/finance-investment/fees-living-expenses 、https://www.business-school.ed.ac.uk/msc/finance-investment/entry-requirements ；QS https://www.topuniversities.com/universities/university-edinburgh

### 4.3 港新新增（6 个）
- HKU Master of Economics：项目页 https://masters.hkubs.hku.hk/articles/masterofeconomics ；学费/申请/就业 https://masters.hkubs.hku.hk/articles/tuitionfee 、https://masters.hkubs.hku.hk/articles/admissionsschedule 、https://masters.hkubs.hku.hk/articles/graduatedestinations ；QS https://www.topuniversities.com/universities/university-hong-kong
- HKUST MSc in Finance：项目页 https://mfin.hkust.edu.hk/ ；费用/申请/就业 https://mfin.hkust.edu.hk/admissions/program-fee-and-expenses 、https://mfin.hkust.edu.hk/admissions/admissions-requirement 、https://mfin.hkust.edu.hk/student-n-alumni/alumni ；QS https://www.topuniversities.com/universities/hong-kong-university-science-technology
- NTU MSc in Applied Economics：项目页 https://www.ntu.edu.sg/sss/admissions/graduate-education/msc-in-applied-economics ；费用/申请 https://www.ntu.edu.sg/sss/admissions/graduate-education/msc-in-applied-economics/fees-and-awards 、https://www.ntu.edu.sg/sss/admissions/graduate-education/msc-in-applied-economics/admissions ；QS https://www.topuniversities.com/universities/nanyang-technological-university-singapore-ntu-singapore
- NUS Master of Economics：项目页 https://fass.nus.edu.sg/ecs/master-of-economics/ ；费用/申请 https://fass.nus.edu.sg/ecs/me-fees-and-payment-2025/ 、https://fass.nus.edu.sg/ecs/admission-requirement/ 、https://fass.nus.edu.sg/ecs/me-application-information/ ；QS https://www.topuniversities.com/universities/national-university-singapore-nus
- SMU MSc in Wealth Management：项目页 https://masters.smu.edu.sg/programme/msc-in-wealth-management ；就业页 https://cn.masters.smu.edu.sg/postgraduate/lkcsb/mwm/career ；QS https://www.topuniversities.com/universities/singapore-management-university
- SMU MSc in Applied Finance（作为用户所说 MSM Finance 的官方替代名）：项目页 https://masters.smu.edu.sg/programme/msc-in-applied-finance ；QS https://www.topuniversities.com/universities/singapore-management-university

### 4.4 本轮命名与去重说明
- Cornell Johnson "MPS Business Analytics"：按官网当前正式名称收录为 **MS in Business Analytics**。
- Yale SOM MMS：当前收录为 **MMS in Asset Management**，作为仍开放、最贴近用户需求的 MMS 项目。
- HKUST MSc Investment Management：官网已并入 **MSc in Finance** 的 concentration，因此不单独新增旧项目名。
- Warwick MSc Business Analytics：官网已升级/更名为 **MSc Business Analytics & Artificial Intelligence**，数据集中已有对应条目，因此不重复新增。
- SMU MSM Finance：官网无该正式项目名，本轮以 **MSc in Applied Finance** 替代收录。

## 4. 置信度（仅用于你自己做判断）

- QS 排名：高（来自 QS/TopUniversities 页面）
- 学费：高（来自项目官网明确数字）
- 语言要求：中-高（若来自对照表则较高；若来自“FAQ 提示阈值”而非 minimum，则需谨慎解读）
- 截止日期：中（极易变化，必须复核）
- 第三方录取背景：Phase 1 不提供；Phase 2 提供后通常为中（众包数据，波动大）
## 3. Phase 2 新增项目来源清单

### 2.6 University of Oxford — MSc Financial Economics
- 项目官网：
  - https://www.sbs.ox.ac.uk/programmes/degrees/msc-financial-economics
- 学费（GBP 52000）：
  - https://www.sbs.ox.ac.uk/programmes/degrees/msc-financial-economics
- 语言要求/GPA等：
  - https://www.sbs.ox.ac.uk/programmes/degrees/msc-financial-economics/application-requirements
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/university-oxford

### 2.7 University of Oxford — MSc Marketing and Consumer Analytics
- 项目官网：
  - https://www.ox.ac.uk/admissions/graduate/courses/find-your-course
- 学费（数据缺失）：
  - https://www.ox.ac.uk/admissions/graduate/courses/find-your-course
- 语言要求/GPA等：
  - https://www.ox.ac.uk/admissions/graduate/courses/find-your-course
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/university-oxford

### 2.8 University of Cambridge — MPhil in Management
- 项目官网：
  - https://www.jbs.cam.ac.uk/masters-degrees/mphil-management/
- 学费（GBP 42468）：
  - https://www.jbs.cam.ac.uk/masters-degrees/mphil-management/
- 语言要求/GPA等：
  - https://www.jbs.cam.ac.uk/masters-degrees/mphil-management/apply/
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/university-cambridge

### 2.9 University of Cambridge — MPhil in Finance
- 项目官网：
  - https://www.jbs.cam.ac.uk/phd-research-masters/mphil-finance/
- 学费（GBP 48192）：
  - https://www.jbs.cam.ac.uk/phd-research-masters/mphil-finance/
- 语言要求/GPA等：
  - https://www.jbs.cam.ac.uk/phd-research-masters/mphil-finance/apply/
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/university-cambridge

### 2.10 Imperial College London — MSc Business Analytics & AI
- 项目官网：
  - https://www.imperial.ac.uk/business-school/masters/business-analytics/
- 学费（GBP 47000）：
  - https://www.imperial.ac.uk/business-school/masters/business-analytics/admissions/
- 语言要求/GPA等：
  - https://www.imperial.ac.uk/business-school/masters/business-analytics/admissions/
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/imperial-college-london

### 2.11 Imperial College London — MSc Strategic Marketing
- 项目官网：
  - https://www.imperial.ac.uk/business-school/masters/strategic-marketing/
- 学费（GBP 45500）：
  - https://www.imperial.ac.uk/business-school/masters/strategic-marketing/admissions/
- 语言要求/GPA等：
  - https://www.imperial.ac.uk/business-school/masters/strategic-marketing/admissions/
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/imperial-college-london

### 2.12 University of Warwick — MSc Business Analytics & Artificial Intelligence
- 项目官网：
  - https://www.wbs.ac.uk/courses/masters/business-analytics-artificial-intelligence/
- 学费（GBP 38150）：
  - https://www.wbs.ac.uk/courses/masters/business-analytics-artificial-intelligence/requirements/
- 语言要求/GPA等：
  - https://www.wbs.ac.uk/courses/masters/business-analytics-artificial-intelligence/requirements/
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/university-warwick

### 2.13 University of Warwick — MSc Marketing & Strategy
- 项目官网：
  - https://www.wbs.ac.uk/courses/masters/marketing-and-strategy/
- 学费（GBP 37450）：
  - https://www.wbs.ac.uk/courses/masters/marketing-and-strategy/requirements/
- 语言要求/GPA等：
  - https://www.wbs.ac.uk/courses/masters/marketing-and-strategy/requirements/
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/university-warwick

### 2.14 University of Manchester — MSc Business Analytics and Artificial Intelligence
- 项目官网：
  - https://www.manchester.ac.uk/study/masters/courses/list/22043/msc-business-analytics-and-artificial-intelligence/
- 学费（GBP 35700）：
  - https://www.manchester.ac.uk/study/masters/courses/list/22043/msc-business-analytics-and-artificial-intelligence/
- 语言要求/GPA等：
  - https://www.manchester.ac.uk/study/masters/courses/list/22043/msc-business-analytics-and-artificial-intelligence/
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/university-manchester

### 2.15 University of Manchester — MSc Marketing
- 项目官网：
  - https://www.manchester.ac.uk/study/masters/courses/list/02247/msc-marketing/
- 学费（GBP 33100）：
  - https://www.manchester.ac.uk/study/masters/courses/list/02247/msc-marketing/
- 语言要求/GPA等：
  - https://www.manchester.ac.uk/study/masters/courses/list/02247/msc-marketing/
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/university-manchester

### 2.16 The University of Edinburgh — MSc Business Analytics
- 项目官网：
  - https://www.business-school.ed.ac.uk/msc/business-analytics
- 学费（GBP 34800）：
  - https://www.business-school.ed.ac.uk/msc/business-analytics/fees-living-expenses
- 语言要求/GPA等：
  - https://www.business-school.ed.ac.uk/msc/business-analytics/entry-requirements
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/university-edinburgh

### 2.17 The University of Edinburgh — MSc Marketing
- 项目官网：
  - https://www.business-school.ed.ac.uk/msc/marketing
- 学费（GBP 33200）：
  - https://www.business-school.ed.ac.uk/msc/marketing/fees-living-expenses
- 语言要求/GPA等：
  - https://www.business-school.ed.ac.uk/msc/marketing/entry-requirements
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/university-edinburgh

### 2.18 Massachusetts Institute of Technology (MIT) — Master of Business Analytics (MBAn)
- 项目官网：
  - https://mitsloan.mit.edu/master-of-business-analytics
- 学费（USD 91250）：
  - https://mitsloan.mit.edu/master-of-business-analytics/admissions/frequently-asked-questions
- 语言要求/GPA等：
  - https://mitsloan.mit.edu/master-of-business-analytics/admissions/how-to-apply
- 就业报告：
  - https://mitsloan.mit.edu/sites/default/files/2026-04/2025%20MBAn%20Employment%20Report%204.24.2026.pdf
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/massachusetts-institute-technology-mit

### 2.19 Carnegie Mellon University — Master of Science in Business Analytics (MSBA)
- 项目官网：
  - https://www.cmu.edu/tepper/programs/master-business-analytics/full-time
- 学费（数据缺失）：
  - https://www.cmu.edu/sfs/tuition/graduate/index.html
- 语言要求/GPA等：
  - https://www.cmu.edu/tepper/programs/master-business-analytics/admissions/apply/international-applicants.html
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/carnegie-mellon-university

### 2.20 Carnegie Mellon University — Master of Information Systems Management (MISM)
- 项目官网：
  - https://www.heinz.cmu.edu/programs/information-systems-management-master/
- 学费（数据缺失）：
  - https://www.cmu.edu/sfs/tuition/graduate/heinz/mism-2526.html
- 语言要求/GPA等：
  - https://www.heinz.cmu.edu/programs/information-systems-management-master/admissions-how-to-apply
- 就业报告：
  - https://www.heinz.cmu.edu/about/salary-and-employment-statistics
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/carnegie-mellon-university

### 2.21 Duke University — Master of Quantitative Management (MQM): Business Analytics
- 项目官网：
  - https://www.fuqua.duke.edu/programs/mqm-business-analytics
- 学费（USD 75000）：
  - https://www.fuqua.duke.edu/programs/mqm-business-analytics/tuition-costs
- 语言要求/GPA等：
  - https://www.fuqua.duke.edu/programs/mqm-business-analytics/admissions-facts-dates
- 就业报告：
  - https://www.business.duke.edu/sites/default/files/media/programs/mqmba/2025%20MQM%20Employment%20Report_Final.pdf
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/duke-university

### 2.22 New York University (NYU) — MS in Business Analytics and AI (MSBAi)
- 项目官网：
  - https://www.stern.nyu.edu/programs-admissions/ms-business-analytics-ai
- 学费（USD 93100）：
  - https://www.stern.nyu.edu/programs-admissions/ms-business-analytics-ai/admissions/program-cost-and-financial-aid
- 语言要求/GPA等：
  - https://www.stern.nyu.edu/programs-admissions/ms-business-analytics-ai/admissions/international-applicants
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/new-york-university-nyu

### 2.23 New York University (NYU) — MS in Marketing and Retail Science (MRS)
- 项目官网：
  - https://stern.shanghai.nyu.edu/en/program/ms-marketing-and-retail-science
- 学费（USD 75000）：
  - https://stern.shanghai.nyu.edu/en/program/ms-marketing-and-retail-science/program-information
- 语言要求/GPA等：
  - https://stern.shanghai.nyu.edu/en/admissions/ms-marketing-and-retail-science
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/new-york-university-nyu

### 2.24 University of Southern California (USC) — MS in Business Analytics (MSBA)
- 项目官网：
  - https://www.marshall.usc.edu/programs/graduate-programs/specialized-masters/ms-business-analytics
- 学费（数据缺失）：
  - https://www.marshall.usc.edu/programs/graduate-programs/specialized-masters/ms-business-analytics/tuition-and-fees
- 语言要求/GPA等：
  - https://www.marshall.usc.edu/programs/graduate-programs/specialized-masters/ms-business-analytics/admissions
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/university-southern-california

### 2.25 University of Southern California (USC) — MS in Marketing
- 项目官网：
  - https://www.marshall.usc.edu/programs/graduate-programs/specialized-masters/ms-marketing
- 学费（数据缺失）：
  - https://www.marshall.usc.edu/programs/graduate-programs/specialized-masters/ms-marketing/tuition-fees
- 语言要求/GPA等：
  - https://www.marshall.usc.edu/programs/graduate-programs/specialized-masters/ms-marketing/admissions
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/university-southern-california

### 2.26 University of Michigan-Ann Arbor — Master of Business Analytics (MBAn)
- 项目官网：
  - https://michiganross.umich.edu/graduate/master-of-business-analytics
- 学费（USD 62000）：
  - https://michiganross.umich.edu/graduate/master-of-business-analytics/admissions/tuition-financial-aid
- 语言要求/GPA等：
  - https://michiganross.umich.edu/graduate/master-of-business-analytics/admissions/application-requirements
- 就业报告：
  - https://michiganross.umich.edu/graduate/master-of-business-analytics/careers/employment-data
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/university-michigan-ann-arbor

### 2.27 University of California, Los Angeles (UCLA) — MS in Business Analytics (MSBA)
- 项目官网：
  - https://www.anderson.ucla.edu/degrees/master-of-science-in-business-analytics
- 学费（USD 75000）：
  - https://www.anderson.ucla.edu/degrees/master-of-science-in-business-analytics/financing
- 语言要求/GPA等：
  - https://www.anderson.ucla.edu/degrees/master-of-science-in-business-analytics/admissions
- 就业报告：
  - https://www.anderson.ucla.edu/sites/default/files/document/2025-04/2025MSBA%20Employment%20Report%20Updates.pdf
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/university-california-los-angeles-ucla

### 2.28 Northwestern University — MS in Machine Learning and Data Science (MLDS)
- 项目官网：
  - https://www.mccormick.northwestern.edu/machine-learning-data-science/
- 学费（数据缺失）：
  - https://www.mccormick.northwestern.edu/machine-learning-data-science/admissions/tuition-financial-aid.html
- 语言要求/GPA等：
  - https://www.mccormick.northwestern.edu/machine-learning-data-science/admissions/application-materials.html
- 就业报告：
  - https://www.mccormick.northwestern.edu/machine-learning-data-science/overview/career-internship-report.html
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/northwestern-university

### 2.29 The University of Texas at Austin — MS in Business Analytics (MSBA)
- 项目官网：
  - https://www.mccombs.utexas.edu/graduate/specialized-masters/ms-business-analytics/
- 学费（USD 58000）：
  - https://www.mccombs.utexas.edu/graduate/specialized-masters/ms-business-analytics/ms-business-analytics-on-campus/admissions/tuition-financial-aid/
- 语言要求/GPA等：
  - https://www.mccombs.utexas.edu/graduate/specialized-masters/ms-business-analytics/ms-business-analytics-on-campus/admissions/application-process/
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/university-texas-austin

### 2.30 Emory University — MS in Business Analytics (MSBA)
- 项目官网：
  - https://goizueta.emory.edu/msba
- 学费（USD 69900）：
  - https://goizueta.emory.edu/msba/admissions/tuition
- 语言要求/GPA等：
  - https://goizueta.emory.edu/msba/admissions/application
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/emory-university

### 2.31 The University of Hong Kong — MSc in Business Analytics
- 项目官网：
  - https://masters.hkubs.hku.hk/articles/masterofscienceinbusinessanalytics
- 学费（HKD 398000）：
  - https://masters.hkubs.hku.hk/articles/tuitionfee
- 语言要求/GPA等：
  - https://admissions.hku.hk/tpg/programme/master-science-business-analytics
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/university-hong-kong

### 2.32 The University of Hong Kong — MSc in Marketing
- 项目官网：
  - https://masters.hkubs.hku.hk/articles/masterofscienceinmarketing
- 学费（数据缺失）：
  - https://masters.hkubs.hku.hk/articles/tuitionfee
- 语言要求/GPA等：
  - http://www.fbe.hku.hk/msmkt/admissions/faqs
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/university-hong-kong

### 2.33 The University of Hong Kong — Master of Finance
- 项目官网：
  - https://masters.hkubs.hku.hk/articles/masteroffinance
- 学费（HKD 462000）：
  - https://masters.hkubs.hku.hk/articles/tuitionfee
- 语言要求/GPA等：
  - http://www.fbe.hku.hk/mfin/admissions/faqs
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/university-hong-kong

### 2.34 The Chinese University of Hong Kong (CUHK) — MSc in Management
- 项目官网：
  - https://masters.bschool.cuhk.edu.hk/programmes/mim/
- 学费（HKD 405000）：
  - https://masters.bschool.cuhk.edu.hk/programmes/mim/admissions/
- 语言要求/GPA等：
  - https://masters.bschool.cuhk.edu.hk/programmes/mim/admissions/
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/chinese-university-hong-kong-cuhk

### 2.35 The Chinese University of Hong Kong (CUHK) — MSc in Marketing
- 项目官网：
  - https://masters.bschool.cuhk.edu.hk/programmes/mscmkt/
- 学费（HKD 390000）：
  - https://masters.bschool.cuhk.edu.hk/programmes/mscmkt/admissions/
- 语言要求/GPA等：
  - https://masters.bschool.cuhk.edu.hk/apply/
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/chinese-university-hong-kong-cuhk

### 2.36 The Chinese University of Hong Kong (CUHK) — MSc in Business Analytics
- 项目官网：
  - https://masters.bschool.cuhk.edu.hk/programmes/mscba/
- 学费（HKD 360000）：
  - https://masters.bschool.cuhk.edu.hk/wp-content/uploads/CUHK-MScBA-Brochure-2026-2027.pdf
- 语言要求/GPA等：
  - https://masters.bschool.cuhk.edu.hk/apply/
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/chinese-university-hong-kong-cuhk

### 2.37 The Hong Kong Polytechnic University — MSc in Business Management
- 项目官网：
  - https://www.polyu.edu.hk/fb/study/tpg-landing/tpg/bm/
- 学费（HKD 351000）：
  - https://www.polyu.edu.hk/study/pg/taught-postgraduate/tuition-fees-tpg
- 语言要求/GPA等：
  - https://www.polyu.edu.hk/study/pg/taught-postgraduate/admission-requirements-tpg
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/hong-kong-polytechnic-university

### 2.38 The Hong Kong Polytechnic University — MSc in Marketing Management
- 项目官网：
  - https://www.polyu.edu.hk/mm/study/tpg/mm/
- 学费（HKD 360000）：
  - https://www.polyu.edu.hk/mm/study/tpg/mm/
- 语言要求/GPA等：
  - https://www.polyu.edu.hk/study/pg/taught-postgraduate/admission-requirements-tpg
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/hong-kong-polytechnic-university

### 2.39 City University of Hong Kong — MSc Business Information Systems
- 项目官网：
  - https://www.cb.cityu.edu.hk/is/postgraduate-degrees/taught-postgraduate/msc-business-information-systems
- 学费（数据缺失）：
  - https://www.cityu.edu.hk/pg/programme/p05a
- 语言要求/GPA等：
  - https://www.cityu.edu.hk/pg/taught-postgraduate-programmes/entrance-requirements
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/city-university-hong-kong-cityuhk

### 2.40 National University of Singapore (NUS) — MSc in Marketing Analytics and Insights
- 项目官网：
  - https://mscmarketing.nus.edu.sg/
- 学费（SGD 75210）：
  - https://mscmarketing.nus.edu.sg/fees-finances/programme-fees/
- 语言要求/GPA等：
  - https://mscmarketing.nus.edu.sg/admissions/admission-requirements/
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/national-university-singapore-nus

### 2.41 National University of Singapore (NUS) — MSc in Finance
- 项目官网：
  - https://mscfin.nus.edu.sg/
- 学费（SGD 75210）：
  - https://mscfin.nus.edu.sg/fees-finances/programme-fees/
- 语言要求/GPA等：
  - https://mscfin.nus.edu.sg/admissions/admission-requirements/
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/national-university-singapore-nus

### 2.42 Nanyang Technological University, Singapore (NTU) — MSc in Marketing Science
- 项目官网：
  - https://www.ntu.edu.sg/business/admissions/graduate-studies/msc-marketing-science
- 学费（SGD 69760）：
  - https://www.ntu.edu.sg/education/graduate-programme/master-of-science-in-marketing-science
- 语言要求/GPA等：
  - https://www.ntu.edu.sg/business/admissions/graduate-studies/msc-marketing-science/admissions
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/nanyang-technological-university-singapore-ntu-singapore

### 2.43 Nanyang Technological University, Singapore (NTU) — MSc in Business Analytics
- 项目官网：
  - https://www.ntu.edu.sg/business/admissions/graduate-studies/msc-business-analytics
- 学费（SGD 71940）：
  - https://www.ntu.edu.sg/education/graduate-programme/master-of-science-in-business-analytics
- 语言要求/GPA等：
  - https://www.ntu.edu.sg/business/admissions/graduate-studies/msc-business-analytics/admissions
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/nanyang-technological-university-singapore-ntu-singapore

### 2.44 Nanyang Technological University, Singapore (NTU) — MSc in Financial Engineering
- 项目官网：
  - https://www.ntu.edu.sg/business/admissions/graduate-studies/msc-financial-engineering
- 学费（SGD 69760）：
  - https://www.ntu.edu.sg/business/admissions/graduate-studies/msc-financial-engineering/admissions
- 语言要求/GPA等：
  - https://www.ntu.edu.sg/business/admissions/graduate-studies/msc-financial-engineering/admissions
- 就业报告：数据缺失
- QS 排名（QS WUR 2026）：
  - https://www.topuniversities.com/universities/nanyang-technological-university-singapore-ntu-singapore


---

## 5. Phase 4：申请难度评估字段来源与推断规则（2026-04-28）

### 5.1 新增硬门槛字段

本轮在 `data/programs.json` 为 67 个项目新增了 `min_gpa`、`min_ielts`、`min_toefl`、`gre_required`、`gmat_required`、`min_work_exp_years`。

这些字段的来源规则如下：

- `min_ielts` / `min_toefl`：直接复用项目现有 `language_requirement` 中来自官网的最低总分。
- `min_gpa`：只在现有 `gpa.official_min` 已经是可量化数值时写入；如果官网只给 UK honours 口径（如 `2:1` / `First Class`）、只给 preferred GPA、或完全没有最低 GPA，则统一写 `null`。
- `gre_required` / `gmat_required`：基于现有官网字段 `gre_gmat.gre` 与 `gre_gmat.gmat` 归一化；`Required` 记为 `true`，`Not Required` / `Not Accepted` 记为 `false`，`Optional` / `Recommended` / `Highly Recommended` / `Accepted` / 中文“建议 / 不强制”统一记为 `"optional"`。
- `min_work_exp_years`：仅在官网文本里能明确抽出最低年限时填写；当前数据集以硕士项目为主，大多为 `null`。

> 说明：JSON 本身不支持注释，因此 `null` 的原因统一记录在本文档与原有 `official_note` / `note` 字段中，而不是直接写在 JSON 行尾。

### 5.2 经验性画像字段

本轮新增 `selectivity_tier` 与 `is_list_based`，用于前端做“冲 / 稳 / 保”分档。这两类字段都属于经验性推断，不是官网字段，页面上会显式提示：`⚠️ 经验性参考，非官方数据，仅供决策参考`。

推断规则如下：

- `selectivity_tier`
  - QS 前 20：`top`
  - QS 20-50：`high`
  - QS 50-150：`mid`
  - QS 150+：`accessible`
  - 对 LSE、CMU 等项目知名度显著高于学校综合 QS 感知的学校，做了保守上调。
- `is_list_based`
  - 伦敦政经、UCL、帝国理工、曼大、爱丁堡、华威、牛剑等英国名校，按 `true` 处理。
  - 多数美国、港校（除 HKU 保留 `null`）与新加坡项目按 `false` 处理。
  - HKU 保留 `null`，表示不同项目对 list 的依赖程度可能不同，需要人工复核。

### 5.3 前端评估逻辑的口径说明

- GPA 容忍度：4.0 制按 `0.1`，100 制按 `2` 分处理；100 制容忍度是前端近似假设，用于避免把非常接近的申请者直接判成红灯。
- IELTS 容忍度：`0.5`。
- TOEFL 容忍度：`5` 分。
- 如果官网未给出可量化门槛，则不会伪造数字，而是回退为“需手动核对”。
- 如果项目要求 GRE / GMAT，但用户未填写任一成绩，会直接在硬门槛里标记为不达标。

### 5.4 已知数据缺失口径

当前数据集中，最主要的缺失仍然是 `min_gpa`：一部分项目官网只给 UK honours / preferred GPA / broad academic requirement，无法直接换算为统一数值，因此保持为 `null`。这不是漏填，而是为了遵守“不编造数据”的原则。
