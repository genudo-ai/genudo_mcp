import asyncio
from pathlib import Path

html_content = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>تقرير تحليل محادثات واستفسارات الزوار — مجموعة نهضة مصر</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  @page {
    size: A4;
    margin: 0;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Cairo', sans-serif;
    direction: rtl;
    background-color: #cbd5e1;
    color: #0f172a;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Fixed A4 Page Canvas */
  .page {
    width: 210mm;
    height: 297mm;
    background: #ffffff;
    margin: 0 auto;
    padding: 10mm 14mm 10mm 14mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    page-break-after: always;
    break-after: page;
    position: relative;
    overflow: hidden;
  }
  .page:last-child {
    page-break-after: auto;
    break-after: auto;
  }

  /* Page Top Nav / Running Header */
  .page-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 7px;
    border-bottom: 1.5px solid #e2e8f0;
    font-size: 8pt;
    color: #64748b;
    font-weight: 600;
    flex-shrink: 0;
  }
  .page-top-bar .nav-section {
    color: #1e3a8a;
    font-weight: 800;
    background: #eff6ff;
    padding: 2px 10px;
    border-radius: 99px;
    font-size: 7.8pt;
  }

  /* Page Footer */
  .page-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 7px;
    border-top: 1.5px solid #e2e8f0;
    font-size: 7.8pt;
    color: #64748b;
    flex-shrink: 0;
  }
  .page-num {
    background: #0f172a;
    color: #ffffff;
    font-weight: 800;
    padding: 2px 10px;
    border-radius: 4px;
    font-size: 7.8pt;
  }

  /* Page Content Area */
  .page-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px 0;
  }

  /* Cover / Page 1 Styles */
  .hero-header {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
    color: #ffffff;
    border-radius: 12px;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }
  .hero-badges {
    display: flex;
    gap: 6px;
    margin-bottom: 6px;
  }
  .hero-badge {
    font-size: 7.5pt;
    font-weight: 700;
    padding: 2px 9px;
    border-radius: 99px;
    background: rgba(255,255,255,0.15);
    color: #e0f2fe;
  }
  .hero-title {
    font-size: 17.5pt;
    font-weight: 900;
    line-height: 1.25;
    margin-bottom: 4px;
  }
  .hero-subtitle {
    font-size: 9.2pt;
    color: #cbd5e1;
    font-weight: 500;
  }
  .hero-meta-card {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 8px;
    padding: 9px 14px;
    min-width: 185px;
    font-size: 8pt;
    line-height: 1.65;
    color: #f8fafc;
  }
  .hero-meta-card strong {
    color: #93c5fd;
  }

  /* Executive Bullets Box */
  .exec-summary-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-right: 4px solid #2563eb;
    border-radius: 10px;
    padding: 10px 15px;
  }
  .exec-summary-title {
    font-size: 9.5pt;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 4px;
  }
  .exec-bullets {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 8.5pt;
    color: #334155;
  }
  .exec-bullets li {
    position: relative;
    padding-right: 12px;
    line-height: 1.45;
  }
  .exec-bullets li::before {
    content: "•";
    position: absolute;
    right: 0;
    color: #2563eb;
    font-weight: 900;
  }

  /* 4 KPI Row */
  .kpi-grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  .kpi-box {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 10px 10px;
    text-align: center;
    border-top: 3.5px solid #2563eb;
  }
  .kpi-box.green { border-top-color: #059669; }
  .kpi-box.amber { border-top-color: #d97706; }
  .kpi-box.purple { border-top-color: #7c3aed; }
  .kpi-big {
    font-size: 18pt;
    font-weight: 900;
    color: #0f172a;
    line-height: 1.1;
  }
  .kpi-label {
    font-size: 8pt;
    font-weight: 800;
    color: #475569;
    margin-top: 2px;
  }
  .kpi-sub {
    font-size: 7.2pt;
    color: #64748b;
  }

  /* Divided One-Line Bar Card */
  .capacity-card {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 12px 15px;
  }
  .capacity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .capacity-title {
    font-size: 10pt;
    font-weight: 800;
    color: #0f172a;
  }
  .capacity-subtitle {
    font-size: 8pt;
    color: #64748b;
  }
  .one-line-bar {
    display: flex;
    height: 30px;
    border-radius: 7px;
    overflow: hidden;
    margin-bottom: 10px;
    border: 1px solid #cbd5e1;
  }
  .bar-seg {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-weight: 800;
    font-size: 7.8pt;
    white-space: nowrap;
    overflow: hidden;
  }

  /* Clean Table */
  .clean-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.2pt;
  }
  .clean-table th {
    background: #f1f5f9;
    color: #1e293b;
    font-weight: 800;
    padding: 6px 8px;
    text-align: right;
    border-bottom: 1.5px solid #cbd5e1;
  }
  .clean-table td {
    padding: 5.5px 8px;
    border-bottom: 1px solid #e2e8f0;
    color: #334155;
    line-height: 1.35;
  }
  .clean-table tr:last-child td {
    border-bottom: none;
  }
  .dot {
    display: inline-block;
    width: 9px;
    height: 9px;
    border-radius: 2px;
    margin-left: 6px;
    vertical-align: middle;
  }
  .pill {
    display: inline-block;
    padding: 1.5px 7px;
    border-radius: 99px;
    font-size: 7.2pt;
    font-weight: 800;
    white-space: nowrap;
  }
  .pill-high { background: #fee2e2; color: #991b1b; }
  .pill-med { background: #dbeafe; color: #1e40af; }
  .pill-auto { background: #d1fae5; color: #065f46; }

  /* ================= CASE PAGE TEMPLATE ================= */
  .case-banner {
    border-radius: 12px;
    padding: 16px 20px;
    color: #ffffff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
  }
  .banner-blue { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); }
  .banner-red { background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%); }
  .banner-purple { background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%); }
  .banner-green { background: linear-gradient(135deg, #064e3b 0%, #059669 100%); }
  .banner-amber { background: linear-gradient(135deg, #78350f 0%, #d97706 100%); }
  .banner-pink { background: linear-gradient(135deg, #831843 0%, #db2777 100%); }
  .banner-slate { background: linear-gradient(135deg, #1e293b 0%, #475569 100%); }

  .case-num-tag {
    font-size: 7.8pt;
    font-weight: 800;
    background: rgba(255,255,255,0.2);
    padding: 2px 10px;
    border-radius: 99px;
    display: inline-block;
    margin-bottom: 4px;
  }
  .case-main-title {
    font-size: 15pt;
    font-weight: 900;
    line-height: 1.25;
  }
  .case-main-sub {
    font-size: 8.8pt;
    opacity: 0.92;
    margin-top: 3px;
  }
  .case-metrics-group {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
  .case-metric-pill {
    background: rgba(255,255,255,0.14);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 8px;
    padding: 8px 12px;
    text-align: center;
    min-width: 86px;
  }
  .cmp-val {
    font-size: 13.5pt;
    font-weight: 900;
    line-height: 1.15;
  }
  .cmp-lbl {
    font-size: 7pt;
    opacity: 0.9;
    margin-top: 2px;
  }

  /* Visual Progress / Share Bar inside Case Page */
  .share-meter-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 9px 14px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .share-meter-label {
    font-size: 8.4pt;
    font-weight: 800;
    color: #334155;
    white-space: nowrap;
  }
  .share-meter-track {
    flex: 1;
    height: 12px;
    background: #e2e8f0;
    border-radius: 99px;
    overflow: hidden;
  }
  .share-meter-fill {
    height: 100%;
    border-radius: 99px;
  }
  .share-meter-stat {
    font-size: 8.4pt;
    font-weight: 800;
    color: #0f172a;
    white-space: nowrap;
  }

  /* Two-Column Issue & Impact Cards */
  .two-col-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .info-panel {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 13px 15px;
  }
  .info-panel.impact-panel {
    background: #fff1f2;
    border-color: #fecdd3;
  }
  .panel-header {
    font-size: 9.8pt;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 8px;
    padding-bottom: 5px;
    border-bottom: 1px solid rgba(0,0,0,0.07);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .impact-panel .panel-header {
    color: #9f1239;
    border-bottom-color: #fecdd3;
  }
  .bullet-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 8.6pt;
    color: #334155;
  }
  .bullet-list li {
    position: relative;
    padding-right: 12px;
    line-height: 1.48;
  }
  .bullet-list li::before {
    content: "▪";
    position: absolute;
    right: 0;
    color: #2563eb;
  }
  .impact-panel .bullet-list li::before {
    color: #e11d48;
  }
  .bullet-list strong {
    color: #0f172a;
  }

  /* Real Quotes Section */
  .quotes-panel {
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 13px 15px;
  }
  .quotes-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 6px;
  }
  .quote-bubble {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-right: 3.5px solid #3b82f6;
    border-radius: 8px;
    padding: 9px 11px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 6px;
  }
  .quote-text {
    font-size: 8.2pt;
    color: #1e293b;
    line-height: 1.48;
    font-weight: 500;
  }
  .quote-meta {
    font-size: 7.2pt;
    color: #64748b;
    font-weight: 700;
    display: flex;
    justify-content: space-between;
    border-top: 1px dashed #e2e8f0;
    padding-top: 4px;
  }

  /* Agent Workflow Bottom Card */
  .agent-workflow-card {
    background: #f0fdf4;
    border: 1.5px solid #bbf7d0;
    border-radius: 10px;
    padding: 13px 15px;
  }
  .workflow-title {
    font-size: 9.8pt;
    font-weight: 800;
    color: #065f46;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .workflow-steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .wf-step {
    background: #ffffff;
    border: 1px solid #a7f3d0;
    border-radius: 8px;
    padding: 9px 11px;
  }
  .wf-step-num {
    font-size: 7.8pt;
    font-weight: 900;
    color: #059669;
    margin-bottom: 2px;
  }
  .wf-step-text {
    font-size: 8.2pt;
    color: #1e293b;
    line-height: 1.45;
  }

  /* Daily Bar Chart (Native CSS) */
  .daily-bars-box {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 12px 15px;
  }
  .daily-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 5.5px;
    font-size: 8pt;
  }
  .daily-row:last-child { margin-bottom: 0; }
  .daily-date {
    width: 115px;
    font-weight: 700;
    color: #334155;
    flex-shrink: 0;
  }
  .daily-track {
    flex: 1;
    height: 14px;
    background: #f1f5f9;
    border-radius: 4px;
    display: flex;
    overflow: hidden;
  }
  .daily-stat {
    width: 125px;
    text-align: left;
    font-weight: 800;
    color: #0f172a;
    flex-shrink: 0;
  }

  /* Unified Cost Box on Page 9 */
  .unified-cost-card {
    background: linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%);
    border: 1.5px solid #059669;
    border-radius: 12px;
    padding: 14px 18px;
  }
  .cost-tiers-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin: 10px 0;
  }
  .cost-tier-box {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 10px 12px;
    text-align: center;
  }
  .cost-tier-box.featured {
    border: 2px solid #059669;
    background: #ecfdf5;
  }
  .tier-badge {
    font-size: 7.5pt;
    font-weight: 800;
    color: #475569;
    margin-bottom: 2px;
  }
  .cost-tier-box.featured .tier-badge {
    color: #065f46;
  }
  .tier-price {
    font-size: 14.5pt;
    font-weight: 900;
    color: #0f172a;
    line-height: 1.2;
  }
  .cost-tier-box.featured .tier-price {
    color: #059669;
    font-size: 16pt;
  }
  .tier-sub {
    font-size: 7.5pt;
    color: #64748b;
    margin-top: 2px;
  }

  @media print {
    body { background: #ffffff; }
  }
</style>
</head>
<body>

<!-- ==================== PAGE 1: COVER & OVERVIEW ==================== -->
<div class="page">
  <div class="page-top-bar">
    <span>مجموعة نهضة مصر للنشر والمكتبات × منصة GenuDo للذكاء الاصطناعي</span>
    <span class="nav-section">الملخص التنفيذي وتوزيع السعة</span>
  </div>

  <div class="page-body">
    <div class="hero-header">
      <div>
        <div class="hero-badges">
          <span class="hero-badge">تقرير التدقيق التشغيلي</span>
          <span class="hero-badge">تحليل محادثات الزوار الفعليين</span>
          <span class="hero-badge">نموذج التكلفة وحالات الاستخدام</span>
        </div>
        <div class="hero-title">تحليل محادثات قنوات نهضة مصر وخارطة الأتمتة الذكية</div>
        <div class="hero-subtitle">دراسة تحليلية لاستفسارات العملاء عبر ماسنجر (المكتبة ودار النشر) وتوزيع الأحجام والتكلفة الشهرية المتوقعة</div>
      </div>
      <div class="hero-meta-card">
        <div><strong>فترة الرصد:</strong> 11 – 17 أكتوبر 2026 (7 أيام)</div>
        <div><strong>القنوات المتصلة:</strong> Facebook Messenger</div>
        <div><strong>مسار المكتبة:</strong> Pipeline 384</div>
        <div><strong>مسار دار النشر:</strong> Pipeline 385</div>
      </div>
    </div>

    <div class="exec-summary-card">
      <div class="exec-summary-title">منهجية التقرير والهدف التشغيلي:</div>
      <ul class="exec-bullets">
        <li><strong>رصد ميداني حقيقي:</strong> تم ربط قناتي ماسنجر لمكتبة نهضة مصر ودار نهضة مصر للنشر لمدة 7 أيام لتحليل الرسائل الفعلية الواردة من الزوار قبل تفعيل الرد الآلي.</li>
        <li><strong>تشخيص الاحتياجات وتوزيع السعة:</strong> تحديد الموضوعات الرئيسية التي يطلب العملاء الدعم بشأنها، وحصة كل موضوع من إجمالي السعة التشغيلية وحجم المحادثات.</li>
        <li><strong>تقدير الحجم والتكلفة والربط البرمجي:</strong> حساب الحجم المتوقع شهرياً وتقدير التكلفة (بمتوسط 1 جنيه للرسالة، وبنطاق يتراوح بين 0.5 إلى 1.5 جنيه حسب حالات الاستخدام النهائية والربط مع المتجر أو الأنظمة الداخلية، مع مرونة استخدام أي نموذج LLM).</li>
      </ul>
    </div>

    <div class="kpi-grid-4">
      <div class="kpi-box">
        <div class="kpi-big">255</div>
        <div class="kpi-label">إجمالي الرسائل (7 أيام)</div>
        <div class="kpi-sub">188 المكتبة • 67 دار النشر</div>
      </div>
      <div class="kpi-box green">
        <div class="kpi-big">62</div>
        <div class="kpi-label">إجمالي المحادثات (Leads)</div>
        <div class="kpi-sub">38 المكتبة • 24 دار النشر</div>
      </div>
      <div class="kpi-box amber">
        <div class="kpi-big">1,093</div>
        <div class="kpi-label">الرسائل المتوقعة شهرياً</div>
        <div class="kpi-sub">بمعدل 36.4 رسالة / يومياً</div>
      </div>
      <div class="kpi-box purple">
        <div class="kpi-big">266</div>
        <div class="kpi-label">العملاء المتوقعون شهرياً</div>
        <div class="kpi-sub">بمعدل 8.9 عميل جديد / يومياً</div>
      </div>
    </div>

    <div class="capacity-card">
      <div class="capacity-header">
        <div>
          <div class="capacity-title">شريط توزيع السعة والحجم حسب حالات استفسارات العملاء (Divided Capacity Chart)</div>
          <div class="capacity-subtitle">توزيع إجمالي المحادثات (62 محادثة) على الأقسام السبعة الرئيسية لطلبات الدعم (تفصيل كل حالة في صفحة مستقلة):</div>
        </div>
      </div>

      <div class="one-line-bar">
        <div class="bar-seg" style="width:22.6%; background:#2563eb;">22.6% الكتب</div>
        <div class="bar-seg" style="width:21.0%; background:#dc2626;">21.0% الشحنات</div>
        <div class="bar-seg" style="width:14.5%; background:#7c3aed;">14.5% النشر</div>
        <div class="bar-seg" style="width:14.5%; background:#059669;">14.5% الفروع</div>
        <div class="bar-seg" style="width:8.1%; background:#d97706;">8.1%</div>
        <div class="bar-seg" style="width:4.8%; background:#db2777;">4.8%</div>
        <div class="bar-seg" style="width:14.5%; background:#475569;">14.5% عامة</div>
      </div>

      <table class="clean-table">
        <thead>
          <tr>
            <th>القسم / محور احتياج العميل</th>
            <th>عدد المحادثات</th>
            <th>الحصة من السعة</th>
            <th>توزيع القنوات</th>
            <th>درجة التأثير</th>
            <th>صفحة التفصيل</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="dot" style="background:#2563eb;"></span><strong>1. توافر الكتب والعناوين والأسعار</strong></td>
            <td>14 محادثة</td>
            <td><strong>22.6%</strong></td>
            <td>10 مكتبة • 4 نشر</td>
            <td><span class="pill pill-high">فرص مبيعات مباشرة</span></td>
            <td><strong>صفحة 2</strong></td>
          </tr>
          <tr>
            <td><span class="dot" style="background:#dc2626;"></span><strong>2. تتبع الشحنات وتأخر التوصيل والشكاوى</strong></td>
            <td>13 محادثة</td>
            <td><strong>21.0%</strong></td>
            <td>12 مكتبة • 1 نشر</td>
            <td><span class="pill pill-high">حرج جداً (31.6% بالمكتبة)</span></td>
            <td><strong>صفحة 3</strong></td>
          </tr>
          <tr>
            <td><span class="dot" style="background:#7c3aed;"></span><strong>3. طلبات النشر والترجمة والأعمال الأدبية</strong></td>
            <td>9 محادثات</td>
            <td><strong>14.5%</strong></td>
            <td>7 نشر • 2 مكتبة</td>
            <td><span class="pill pill-med">رئيسي بدار النشر (29.2%)</span></td>
            <td><strong>صفحة 4</strong></td>
          </tr>
          <tr>
            <td><span class="dot" style="background:#059669;"></span><strong>4. عناوين الفروع ومنافذ البيع والخصومات</strong></td>
            <td>9 محادثات</td>
            <td><strong>14.5%</strong></td>
            <td>7 مكتبة • 2 نشر</td>
            <td><span class="pill pill-auto">أتمتة فورية 100%</span></td>
            <td><strong>صفحة 5</strong></td>
          </tr>
          <tr>
            <td><span class="dot" style="background:#d97706;"></span><strong>5. باقات قصص الأطفال وعروض المجموعات</strong></td>
            <td>5 محادثات</td>
            <td><strong>8.1%</strong></td>
            <td>3 مكتبة • 2 نشر</td>
            <td><span class="pill pill-med">رفع قيمة السلة (AOV)</span></td>
            <td><strong>صفحة 6</strong></td>
          </tr>
          <tr>
            <td><span class="dot" style="background:#db2777;"></span><strong>6. أعطال الدفع بالموقع الإلكتروني</strong></td>
            <td>3 محادثات</td>
            <td><strong>4.8%</strong></td>
            <td>2 مكتبة • 1 نشر</td>
            <td><span class="pill pill-high">إنقاذ سلات متروكة</span></td>
            <td><strong>صفحة 7</strong></td>
          </tr>
          <tr>
            <td><span class="dot" style="background:#475569;"></span><strong>7. البحث البصري بالصور والتوظيف والعام</strong></td>
            <td>9 محادثات (+30 مرفقاً)</td>
            <td><strong>14.5%</strong></td>
            <td>مشترك بالقناتين</td>
            <td><span class="pill pill-auto">رؤية بصرية وتوجيه</span></td>
            <td><strong>صفحة 8</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="page-footer">
    <span>تقرير تحليل قنوات المراسلة — مجموعة نهضة مصر</span>
    <span class="page-num">صفحة 1 من 10</span>
  </div>
</div>

<!-- ==================== PAGE 2: CASE 1 (BOOK AVAILABILITY) ==================== -->
<div class="page">
  <div class="page-top-bar">
    <span>تحليل حالات الدعم التفصيلية — المحور الأول</span>
    <span class="nav-section">الحالة 01 من 07 : توافر الكتب والأسعار</span>
  </div>

  <div class="page-body">
    <div class="case-banner banner-blue">
      <div>
        <span class="case-num-tag">المحور الأول — المبيعات المباشرة</span>
        <div class="case-main-title">الاستفسار عن توافر الكتب والعناوين والأسعار</div>
        <div class="case-main-sub">عملاء يبحثون عن إصدارات محددة، سلاسل تعليمية، ومجلات أطفال بغرض الشراء الفوري</div>
      </div>
      <div class="case-metrics-group">
        <div class="case-metric-pill">
          <div class="cmp-val">22.6%</div>
          <div class="cmp-lbl">حصة السعة الكلية</div>
        </div>
        <div class="case-metric-pill">
          <div class="cmp-val">14</div>
          <div class="cmp-lbl">محادثة مرصودة</div>
        </div>
        <div class="case-metric-pill">
          <div class="cmp-val">10 م | 4 ن</div>
          <div class="cmp-lbl">مكتبة | دار نشر</div>
        </div>
      </div>
    </div>

    <div class="share-meter-box">
      <span class="share-meter-label">نسبة الاستحواذ من إجمالي حجم المحادثات:</span>
      <div class="share-meter-track">
        <div class="share-meter-fill" style="width: 22.6%; background: #2563eb;"></div>
      </div>
      <span class="share-meter-stat">22.6% (المركز الأول من حيث حجم الطلب)</span>
    </div>

    <div class="two-col-grid">
      <div class="info-panel">
        <div class="panel-header">
          <span>تشخيص المشكلة وطبيعة الاستفسار</span>
          <span class="pill pill-med">طلب متكرر يومياً</span>
        </div>
        <ul class="bullet-list">
          <li><strong>البحث عن عناوين محددة بالاسم:</strong> يسأل الزوار عن توافر كتب بعينها مثل (جدد حياتك للغزالي، القناع لمصطفى حسني، مؤلفات يحيى حقي، والتراث الإسلامي لعلي جمعة).</li>
          <li><strong>إصدارات الأطفال والدوريات:</strong> طلبات مكثفة حول توافر <strong>مجلة ميكي</strong> الأسبوعية والمجلدات، وإمكانية الاشتراك السنوي أو ربع السنوي بها.</li>
          <li><strong>الكتب التعليمية (الأضواء):</strong> استفسارات حول توافر كتب الأضواء للمراحل الدراسية المختلفة (مثل ثانية بكالوريا) في المحافظات.</li>
        </ul>
      </div>

      <div class="info-panel impact-panel">
        <div class="panel-header">
          <span>الأثر التجاري والتشغيلي (Business Impact)</span>
          <span class="pill pill-high">تأثير مباشر على الإيراد</span>
        </div>
        <ul class="bullet-list">
          <li><strong>ضياع فرص بيعية محققة:</strong> العميل الذي يسأل عن كتاب محدد يمتلك نية شراء فورية؛ تأخر الرد لساعات يدفعه لشراء الكتاب من مكتبات أخرى.</li>
          <li><strong>تشتت الاستفسارات بين الصفحتين:</strong> 28% من أسئلة الكتب ترد إلى صفحة "دار النشر" بدلاً من "المكتبة"، مما يتطلب ربطاً معرفياً موحداً.</li>
          <li><strong>انخفاض معدل التحويل:</strong> غياب الرد الفوري بالسعر ورابط الشراء يوقف رحلة العميل في أول خطوة.</li>
        </ul>
      </div>
    </div>

    <div class="quotes-panel">
      <div class="panel-header" style="margin-bottom: 4px;">
        <span>نماذج حقيقية من رسائل العملاء المرصودة</span>
        <span style="font-size: 7.8pt; color: #64748b;">مقتبسة نصياً من سجل المحادثات</span>
      </div>
      <div class="quotes-grid">
        <div class="quote-bubble">
          <div class="quote-text">«مجلة ميكي موجودة؟ كنت عايز اعرف هيا موجودة في نهضة مصر اللي في المهندسين؟ بيقولولي ممكن اون لاين اشتراك سنوي وربع سنوي؟»</div>
          <div class="quote-meta"><span>عميل #1123529</span><span>قناة المكتبة (10 رسائل)</span></div>
        </div>
        <div class="quote-bubble">
          <div class="quote-text">«السلام عليكم ورحمة الله وبركاته، كتاب تلبيس ابليس لابن الجوزي، كتاب الاتقان للسيوطي، الكتب دي متاحة؟»</div>
          <div class="quote-meta"><span>عميل #1126862</span><span>قناة المكتبة</span></div>
        </div>
        <div class="quote-bubble">
          <div class="quote-text">«هل موجود كتب يحيى حقى في فرع الفجالة؟!»<br>«عايزة كتاب جدد حياتك للإمام محمد الغزالي»</div>
          <div class="quote-meta"><span>عملاء #1128709 / #1127867</span><span>دار النشر والمكتبة</span></div>
        </div>
      </div>
    </div>

    <div class="agent-workflow-card">
      <div class="workflow-title">
        <span>حالة استخدام وكيل الذكاء الاصطناعي (AI Agent Use Case): الباحث الفوري ومستشار الكتالوج</span>
        <span class="pill pill-auto">أتمتة كاملة 100%</span>
      </div>
      <div class="workflow-steps">
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 01 : الفهم والبحث</div>
          <div class="wf-step-text">يلتقط الوكيل اسم الكتاب أو المؤلف أو السلسلة ويبحث لحظياً في قاعدة بيانات الكتالوج الموحدة أو المتجر.</div>
        </div>
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 02 : عرض التفاصيل والسعر</div>
          <div class="wf-step-text">يرد الوكيل خلال ثوانٍ بحالة التوافر، السعر الرسمي، نبذة مختصرة، والفروع المتوفر بها الكتاب.</div>
        </div>
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 03 : الإغلاق البيعي</div>
          <div class="wf-step-text">يرسل رابط الشراء المباشر أو يعرض تسجيل الطلب مباشرة داخل الشات لتحقيق أعلى معدل تحويل.</div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>تقرير تحليل قنوات المراسلة — مجموعة نهضة مصر</span>
    <span class="page-num">صفحة 2 من 10</span>
  </div>
</div>

<!-- ==================== PAGE 3: CASE 2 (ORDER TRACKING) ==================== -->
<div class="page">
  <div class="page-top-bar">
    <span>تحليل حالات الدعم التفصيلية — المحور الثاني</span>
    <span class="nav-section">الحالة 02 من 07 : تتبع الشحنات والشكاوى</span>
  </div>

  <div class="page-body">
    <div class="case-banner banner-red">
      <div>
        <span class="case-num-tag">المحور الثاني — خدمة ما بعد البيع</span>
        <div class="case-main-title">تتبع الشحنات وتأخر التوصيل وطلبات الاستبدال</div>
        <div class="case-main-sub">العبء الأكبر على قناة المكتبة (31.6% من محادثات المكتبة) لمتابعة الطلبات المتأخرة</div>
      </div>
      <div class="case-metrics-group">
        <div class="case-metric-pill">
          <div class="cmp-val">21.0%</div>
          <div class="cmp-lbl">حصة السعة الكلية</div>
        </div>
        <div class="case-metric-pill">
          <div class="cmp-val">13</div>
          <div class="cmp-lbl">محادثة مرصودة</div>
        </div>
        <div class="case-metric-pill">
          <div class="cmp-val">31.6%</div>
          <div class="cmp-lbl">من سعة المكتبة!</div>
        </div>
      </div>
    </div>

    <div class="share-meter-box">
      <span class="share-meter-label">نسبة الاستحواذ من إجمالي حجم المحادثات:</span>
      <div class="share-meter-track">
        <div class="share-meter-fill" style="width: 21.0%; background: #dc2626;"></div>
      </div>
      <span class="share-meter-stat">21.0% إجمالاً (31.6% من إجمالي محادثات المكتبة)</span>
    </div>

    <div class="two-col-grid">
      <div class="info-panel">
        <div class="panel-header">
          <span>تشخيص المشكلة وطبيعة الاستفسار</span>
          <span class="pill pill-high">كثافة رسائل عالية</span>
        </div>
        <ul class="bullet-list">
          <li><strong>تأخر وصول الشحنات (7 إلى 15 يوماً):</strong> عملاء أتموا الشراء عبر الموقع ولم تصلهم الكتب أو أرقام التتبع لفترات طويلة.</li>
          <li><strong>تكرار الرسائل بسبب القلق:</strong> يرسل العميل الواحد ما بين 10 إلى 24 رسالة متتالية للاستفسار عن موعد وصول المندوب.</li>
          <li><strong>عيوب التغليف والطباعة:</strong> شكاوى من وصول كتب بها "خبطات" خارجية أو عدم سلامة الورق الداخلي وطلب استبدالها.</li>
        </ul>
      </div>

      <div class="info-panel impact-panel">
        <div class="panel-header">
          <span>الأثر التجاري والتشغيلي (Business Impact)</span>
          <span class="pill pill-high">مخاطر سمعة ومرتجعات</span>
        </div>
        <ul class="bullet-list">
          <li><strong>استنزاف طاقة فريق الدعم:</strong> تستهلك محادثات التتبع أكبر عدد من الرسائل لكل عميل (متوسط 8+ رسائل في المحادثة الواحدة).</li>
          <li><strong>ارتفاع نسبة المرتجعات (RTO):</strong> غياب التحديث الفوري يدفع العميل لإلغاء الطلب أو رفض الاستلام من شركة الشحن.</li>
          <li><strong>تضرر السمعة الرقمية:</strong> تحول العميل المحبط من الرسائل الخاصة إلى كتابة تعليقات سلبية على منشورات الصفحة العامة.</li>
        </ul>
      </div>
    </div>

    <div class="quotes-panel">
      <div class="panel-header" style="margin-bottom: 4px;">
        <span>نماذج حقيقية من رسائل العملاء المرصودة</span>
        <span style="font-size: 7.8pt; color: #64748b;">مقتبسة نصياً من سجل المحادثات</span>
      </div>
      <div class="quotes-grid">
        <div class="quote-bubble" style="border-right-color: #dc2626;">
          <div class="quote-text">«بقالي اسبوع الطلب مش وصل ليا.. رقم الطلب 550031777051.. الطلب يوصل امتى؟ شركة الشحن اجازة اليوم؟ محدش اتصل بيا»</div>
          <div class="quote-meta"><span>عميل #1125527</span><span>أرسل 24 رسالة متتالية!</span></div>
        </div>
        <div class="quote-bubble" style="border-right-color: #dc2626;">
          <div class="quote-text">«طلبت كتاب (التسلسل الزمني لكل شئ) من اكتر من ١٥ يوم عن طريق الرابط ومفيش حاجة وصلت.. وقالوا هيبعتوا رقم اوردر ومحدش بعت»</div>
          <div class="quote-meta"><span>عميل #1118539</span><span>قناة المكتبة</span></div>
        </div>
        <div class="quote-bubble" style="border-right-color: #dc2626;">
          <div class="quote-text">«وصلت لي نسخة الجزء ١٣ من الموسوعة لكن فيها خبطة ايضا وعاوز ابدلها.. رقم الطلب 28403 غير ان الورق من الداخل مش سليم»</div>
          <div class="quote-meta"><span>عميل #1124104</span><span>أرفق صورتين للتلف</span></div>
        </div>
      </div>
    </div>

    <div class="agent-workflow-card">
      <div class="workflow-title">
        <span>حالة استخدام وكيل الذكاء الاصطناعي (AI Agent Use Case): التتبع الآلي وإدارة الاستبدال</span>
        <span class="pill pill-auto">أتمتة الاستعلام + تذاكر استبدال</span>
      </div>
      <div class="workflow-steps">
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 01 : التحقق من الطلب</div>
          <div class="wf-step-text">يطلب الوكيل رقم الطلب أو رقم الهاتف المربوط بالشحنة ويتحقق منه تلقائياً عبر الربط مع المتجر أو شركة الشحن.</div>
        </div>
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 02 : الرد بحالة الشحنة</div>
          <div class="wf-step-text">يبلغ العميل فوراً بمرحلة الشحن الحالية وموعد التوصيل المتوقع لطمأنته ومنع تكرار الرسائل.</div>
        </div>
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 03 : تذاكر التلف والتأخير</div>
          <div class="wf-step-text">في حال تجاوز المدة أو وجود تلف، يستقبل الوكيل صور الكتاب وينشئ تذكرة استبدال عاجلة للفريق المختص.</div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>تقرير تحليل قنوات المراسلة — مجموعة نهضة مصر</span>
    <span class="page-num">صفحة 3 من 10</span>
  </div>
</div>

<!-- ==================== PAGE 4: CASE 3 (PUBLISHING & TRANSLATION) ==================== -->
<div class="page">
  <div class="page-top-bar">
    <span>تحليل حالات الدعم التفصيلية — المحور الثالث</span>
    <span class="nav-section">الحالة 03 من 07 : طلبات النشر والترجمة</span>
  </div>

  <div class="page-body">
    <div class="case-banner banner-purple">
      <div>
        <span class="case-num-tag">المحور الثالث — استقطاب المؤلفين والمترجمين</span>
        <div class="case-main-title">طلبات النشر، الترجمة، واستقبال الأعمال الأدبية</div>
        <div class="case-main-sub">المحور الأول على صفحة دار النشر (29.2% من محادثاتها) من كتاب ومترجمين محترفين</div>
      </div>
      <div class="case-metrics-group">
        <div class="case-metric-pill">
          <div class="cmp-val">14.5%</div>
          <div class="cmp-lbl">حصة السعة الكلية</div>
        </div>
        <div class="case-metric-pill">
          <div class="cmp-val">9</div>
          <div class="cmp-lbl">محادثات مرصودة</div>
        </div>
        <div class="case-metric-pill">
          <div class="cmp-val">29.2%</div>
          <div class="cmp-lbl">من سعة دار النشر!</div>
        </div>
      </div>
    </div>

    <div class="share-meter-box">
      <span class="share-meter-label">نسبة الاستحواذ من إجمالي حجم المحادثات:</span>
      <div class="share-meter-track">
        <div class="share-meter-fill" style="width: 14.5%; background: #7c3aed;"></div>
      </div>
      <span class="share-meter-stat">14.5% إجمالاً (المركز الأول في قناة دار النشر بنسبة 29.2%)</span>
    </div>

    <div class="two-col-grid">
      <div class="info-panel">
        <div class="panel-header">
          <span>تشخيص المشكلة وطبيعة الاستفسار</span>
          <span class="pill pill-med">قيمة فكرية وأدبية عالية</span>
        </div>
        <ul class="bullet-list">
          <li><strong>مواعيد وشروط التقديم الأدبي:</strong> كتاب وروائيون يسألون عن مواسم فتح باب استقبال الروايات والمخطوطات والضوابط المطلوبة.</li>
          <li><strong>عروض ترجمة احترافية:</strong> مترجمون ذوو خبرة يعرضون مشاريع ترجمة لكتب تاريخية وأدب عالمي (من الإنجليزية والتركية) مع إرفاق السيرة الذاتية.</li>
          <li><strong>مشاريع تعليمية وتربوية:</strong> معلمون وخبراء يعرضون سلاسل تعليمية (مثل تعليم العربية لغير الناطقين بها).</li>
        </ul>
      </div>

      <div class="info-panel impact-panel">
        <div class="panel-header">
          <span>الأثر التجاري والتشغيلي (Business Impact)</span>
          <span class="pill pill-high">فرص استقطاب ومخاطر غضب</span>
        </div>
        <ul class="bullet-list">
          <li><strong>فقدان مواهب وأعمال مميزة:</strong> غياب مسار استقبال آلي منظم يؤدي لضياع عروض ترجمة ومخطوطات قيمة وسط الرسائل اليومية.</li>
          <li><strong>غضب المبدعين عند تعطل الروابط:</strong> رُصدت حالة تحول فيها كاتب من الحماس الشديد إلى الغضب بسبب عدم عمل رابط التقديم وغياب الرد.</li>
          <li><strong>تشتت المؤلفين:</strong> 22% من طلبات النشر أُرسلت لصفحة المكتبة بدلاً من دار النشر.</li>
        </ul>
      </div>
    </div>

    <div class="quotes-panel">
      <div class="panel-header" style="margin-bottom: 4px;">
        <span>نماذج حقيقية من رسائل المؤلفين والمترجمين</span>
        <span style="font-size: 7.8pt; color: #64748b;">مقتبسة نصياً من سجل المحادثات</span>
      </div>
      <div class="quotes-grid">
        <div class="quote-bubble" style="border-right-color: #7c3aed;">
          <div class="quote-text">«مترجمة لغة تركية وإنجليزية.. أرغب في التعاون مع الدار ومعي كتاب عن الأندلس وسلسلة البؤساء وسقوط غرناطة.. مرفق السيرة الذاتية [PDF]»</div>
          <div class="quote-meta"><span>مترجمة #1126843</span><span>13 رسالة + ملف PDF</span></div>
        </div>
        <div class="quote-bubble" style="border-right-color: #7c3aed;">
          <div class="quote-text">«السلام عليكم، ممكن اعرف لو أنا حابب انشر روايتى مع حضراتكم ايه المطلوب منى عشان موافقه حضراتكم؟»</div>
          <div class="quote-meta"><span>مؤلف #1117121</span><span>وارد على قناة المكتبة</span></div>
        </div>
        <div class="quote-bubble" style="border-right-color: #7c3aed;">
          <div class="quote-text">«لو سمحت ممكن اسال حضراتكم عن مواعيد استقبال الأعمال الأدبية؟»<br>«عايزة اسأل عن النشر الورقي للرواية بيتفتح امتى؟»</div>
          <div class="quote-meta"><span>مؤلفون #1127034 / #1108419</span><span>قناة دار النشر</span></div>
        </div>
      </div>
    </div>

    <div class="agent-workflow-card">
      <div class="workflow-title">
        <span>حالة استخدام وكيل الذكاء الاصطناعي (AI Agent Use Case): بوابة استقبال وفرز الأعمال الأدبية</span>
        <span class="pill pill-auto">تأهيل وفرز آلي 100%</span>
      </div>
      <div class="workflow-steps">
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 01 : توضيح الضوابط والمواعيد</div>
          <div class="wf-step-text">يجيب الوكيل فوراً بشروط النشر المعتمدة بالدار، مواعيد فتح باب الاستقبال، والمدة الزمنية المتوقعة للرد.</div>
        </div>
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 02 : تأهيل العمل والمؤلف</div>
          <div class="wf-step-text">يجمع الوكيل بيانات المؤلف أو المترجم (الاسم، نوع العمل، عدد الصفحات، نبذة مختصرة، والسيرة الذاتية).</div>
        </div>
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 03 : الأرشفة للجان القراءة</div>
          <div class="wf-step-text">يسجل الطلب المصنف في قاعدة بيانات لجان القراءة والتحرير أو يزود الكاتب بالرابط الرسمي الفعال.</div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>تقرير تحليل قنوات المراسلة — مجموعة نهضة مصر</span>
    <span class="page-num">صفحة 4 من 10</span>
  </div>
</div>

<!-- ==================== PAGE 5: CASE 4 (BRANCHES & OUTLETS) ==================== -->
<div class="page">
  <div class="page-top-bar">
    <span>تحليل حالات الدعم التفصيلية — المحور الرابع</span>
    <span class="nav-section">الحالة 04 من 07 : الفروع ومنافذ البيع</span>
  </div>

  <div class="page-body">
    <div class="case-banner banner-green">
      <div>
        <span class="case-num-tag">المحور الرابع — الإرشاد الجغرافي والمنافذ</span>
        <div class="case-main-title">عناوين الفروع ومنافذ البيع الرسمية وسريان الخصومات</div>
        <div class="case-main-sub">استفسارات الزوار حول مواقع المكتبات في القاهرة والمحافظات ومواعيد العمل</div>
      </div>
      <div class="case-metrics-group">
        <div class="case-metric-pill">
          <div class="cmp-val">14.5%</div>
          <div class="cmp-lbl">حصة السعة الكلية</div>
        </div>
        <div class="case-metric-pill">
          <div class="cmp-val">9</div>
          <div class="cmp-lbl">محادثات مرصودة</div>
        </div>
        <div class="case-metric-pill">
          <div class="cmp-val">7 م | 2 ن</div>
          <div class="cmp-lbl">مكتبة | دار نشر</div>
        </div>
      </div>
    </div>

    <div class="share-meter-box">
      <span class="share-meter-label">نسبة الاستحواذ من إجمالي حجم المحادثات:</span>
      <div class="share-meter-track">
        <div class="share-meter-fill" style="width: 14.5%; background: #059669;"></div>
      </div>
      <span class="share-meter-stat">14.5% (أسئلة روتينية متكررة قابلة للأتمتة الفورية بنسبة 100%)</span>
    </div>

    <div class="two-col-grid">
      <div class="info-panel">
        <div class="panel-header">
          <span>تشخيص المشكلة وطبيعة الاستفسار</span>
          <span class="pill pill-auto">استفسار معلوماتي مباشر</span>
        </div>
        <ul class="bullet-list">
          <li><strong>مواقع الفروع بالقاهرة والمحافظات:</strong> سؤال مباشر عن عناوين الفروع في (المهندسين، الفجالة، طنطا، والإسكندرية) وطلب رابط الموقع الجغرافي (Location).</li>
          <li><strong>الموزعون ومنافذ البيع المعتمدة:</strong> عملاء في محافظات لا يوجد بها فرع مباشر يسألون عن المكتبات الكبرى الموزعة لإصدارات نهضة مصر.</li>
          <li><strong>تطبيق خصومات الأونلاين في الفروع:</strong> تساؤل متكرر عما إذا كانت العروض المعلنة سارية داخل الفروع أم عبر الموقع فقط.</li>
        </ul>
      </div>

      <div class="info-panel impact-panel">
        <div class="panel-header">
          <span>الأثر التجاري والتشغيلي (Business Impact)</span>
          <span class="pill pill-high">حركة زوار الفروع (Footfall)</span>
        </div>
        <ul class="bullet-list">
          <li><strong>تعطيل الزيارات الميدانية للفروع:</strong> العميل الذي يطلب "اللوكيشن" غالباً ما يكون في طريقه للفرع؛ تأخر الرد يلغي زيارته الشرائية.</li>
          <li><strong>البديل المثالي لرسوم الشحن:</strong> العملاء الذين يستثقلون رسوم التوصيل (100–150 ج) يبحثون عن أقرب فرع للشراء المباشر.</li>
          <li><strong>إشغال الموظفين بأسئلة نمطية:</strong> إهدار وقت فريق الدعم في نسخ ولصق العناوين ومواعيد العمل يومياً.</li>
        </ul>
      </div>
    </div>

    <div class="quotes-panel">
      <div class="panel-header" style="margin-bottom: 4px;">
        <span>نماذج حقيقية من رسائل العملاء المرصودة</span>
        <span style="font-size: 7.8pt; color: #64748b;">مقتبسة نصياً من سجل المحادثات</span>
      </div>
      <div class="quotes-grid">
        <div class="quote-bubble" style="border-right-color: #059669;">
          <div class="quote-text">«لو سمحت فين فروعكم في القاهرة والخصم ساري فيها والا اونلاين فقط؟»</div>
          <div class="quote-meta"><span>عميل #1128945</span><span>قناة المكتبة</span></div>
        </div>
        <div class="quote-bubble" style="border-right-color: #059669;">
          <div class="quote-text">«ليكم مكان فى طنطا؟»<br>«مشكلة أنا في اسكندرية ومش عارفة في اي مكتبات كبيرة متوفرة؟»</div>
          <div class="quote-meta"><span>عملاء #1124680 / #1122529</span><span>قناة المكتبة</span></div>
        </div>
        <div class="quote-bubble" style="border-right-color: #059669;">
          <div class="quote-text">«ممكن منافذ البيع الرسمية؟»<br>«العنوان ايه لو سمحت» — «اللوكيشن»</div>
          <div class="quote-meta"><span>عملاء #1127152 / #1130545</span><span>المكتبة ودار النشر</span></div>
        </div>
      </div>
    </div>

    <div class="agent-workflow-card">
      <div class="workflow-title">
        <span>حالة استخدام وكيل الذكاء الاصطناعي (AI Agent Use Case): الدليل الجغرافي التفاعلي للفروع</span>
        <span class="pill pill-auto">أتمتة كاملة 100%</span>
      </div>
      <div class="workflow-steps">
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 01 : تحديد المنطقة</div>
          <div class="wf-step-text">يتعرف الوكيل على المحافظة أو المنطقة التي يسأل عنها العميل (القاهرة، الجيزة، الإسكندرية، الدلتا).</div>
        </div>
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 02 : إرسال بيانات الفرع</div>
          <div class="wf-step-text">يزود العميل بالعنوان التفصيلي، رابط خرائط جوجل (Google Maps)، مواعيد العمل، ورقم هاتف الفرع.</div>
        </div>
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 03 : توضيح العروض والموزعين</div>
          <div class="wf-step-text">يوضح سياسة الخصومات بالفروع، ويرشح أقرب الموزعين المعتمدين في المحافظات التي لا تضم فرعاً مباشراً.</div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>تقرير تحليل قنوات المراسلة — مجموعة نهضة مصر</span>
    <span class="page-num">صفحة 5 من 10</span>
  </div>
</div>

<!-- ==================== PAGE 6: CASE 5 (READING BUNDLES & DISCOUNTS) ==================== -->
<div class="page">
  <div class="page-top-bar">
    <span>تحليل حالات الدعم التفصيلية — المحور الخامس</span>
    <span class="nav-section">الحالة 05 من 07 : باقات الأطفال وعروض المجموعات</span>
  </div>

  <div class="page-body">
    <div class="case-banner banner-amber">
      <div>
        <span class="case-num-tag">المحور الخامس — تعظيم قيمة السلة الشرائية</span>
        <div class="case-main-title">باقات القراءة المتدرجة للأطفال وعروض المجموعات</div>
        <div class="case-main-sub">أولياء أمور يطلبون ترشيحات عمرية ومجموعات قصصية كاملة بخصومات مجمعة</div>
      </div>
      <div class="case-metrics-group">
        <div class="case-metric-pill">
          <div class="cmp-val">8.1%</div>
          <div class="cmp-lbl">حصة السعة الكلية</div>
        </div>
        <div class="case-metric-pill">
          <div class="cmp-val">5</div>
          <div class="cmp-lbl">محادثات مرصودة</div>
        </div>
        <div class="case-metric-pill">
          <div class="cmp-val">3 م | 2 ن</div>
          <div class="cmp-lbl">مكتبة | دار نشر</div>
        </div>
      </div>
    </div>

    <div class="share-meter-box">
      <span class="share-meter-label">نسبة الاستحواذ من إجمالي حجم المحادثات:</span>
      <div class="share-meter-track">
        <div class="share-meter-fill" style="width: 8.1%; background: #d97706;"></div>
      </div>
      <span class="share-meter-stat">8.1% (أعلى المحاور من حيث متوسط قيمة الطلب المتوقع للعميل الواحد)</span>
    </div>

    <div class="two-col-grid">
      <div class="info-panel">
        <div class="panel-header">
          <span>تشخيص المشكلة وطبيعة الاستفسار</span>
          <span class="pill pill-med">شراء مجمع (Bundles)</span>
        </div>
        <ul class="bullet-list">
          <li><strong>قصص تأسيس القراءة للأطفال:</strong> أمهات يطلبن مجموعات قصصية مقسمة بالمستويات (المستوى الأول والثاني) للأطفال في بداية القراءة.</li>
          <li><strong>التساؤل عن خصم المجموعات:</strong> رغبة واضحة في شراء 10 إلى 15 قصة دفعة واحدة مع السؤال عن توفر خصم على المجموعة الكاملة.</li>
          <li><strong>كتب علمية ومترجمة للأطفال:</strong> طلب كتب علمية ثنائية اللغة (عربي/إنجليزي) لسن 7 سنوات فأكثر، وسلسلة حكاياتي الأولى.</li>
        </ul>
      </div>

      <div class="info-panel impact-panel">
        <div class="panel-header">
          <span>الأثر التجاري والتشغيلي (Business Impact)</span>
          <span class="pill pill-high">مضاعفة قيمة السلة (AOV)</span>
        </div>
        <ul class="bullet-list">
          <li><strong>فرصة مضاعفة حجم المبيعات:</strong> العميل هنا لا يشتري كتاباً واحداً بل يشتري مجموعة كاملة (12–15 قصة)، ما يرفع قيمة الفاتورة 5 أضعاف.</li>
          <li><strong>الحاجة للاستشارة التربوية:</strong> العميل يحتاج من يرشح له السلسلة المناسبة لسن طفله؛ غياب المرشد يوقف قرار الشراء.</li>
          <li><strong>الالتباس في شروط الخصم:</strong> عدم وضوح أي الإصدارات يشملها الخصم يسبب حيرة للعميل أثناء تكوين سلته.</li>
        </ul>
      </div>
    </div>

    <div class="quotes-panel">
      <div class="panel-header" style="margin-bottom: 4px;">
        <span>نماذج حقيقية من رسائل العملاء المرصودة</span>
        <span style="font-size: 7.8pt; color: #64748b;">مقتبسة نصياً من سجل المحادثات</span>
      </div>
      <div class="quotes-grid">
        <div class="quote-bubble" style="border-right-color: #d97706;">
          <div class="quote-text">«عايزه مجموعه قصص لطفل لسه بيتعلم القراءة.. انا اختارت ٦ قصص من مستوي ١ و٦ من مستوي ٢ و١٣ كمان.. هل في خصم ولا لا؟»</div>
          <div class="quote-meta"><span>عميل #1128290</span><span>قناة المكتبة (10 رسائل)</span></div>
        </div>
        <div class="quote-bubble" style="border-right-color: #d97706;">
          <div class="quote-text">«مساء الخير، كنت محتاجة كتب علمية للاطفال من سن ٧ سنوات تكون مكتوبة عربى و انجليزى الاقيها فين؟»</div>
          <div class="quote-meta"><span>عميل #1110410</span><span>قناة دار النشر</span></div>
        </div>
        <div class="quote-bubble" style="border-right-color: #d97706;">
          <div class="quote-text">«اسعار مجلدات ميكي» — «بكام حكاياتي الأولى» — «كتاب وصفات الاميرات بالانجليش موجود وسعره كام؟»</div>
          <div class="quote-meta"><span>عملاء #1116943 / #1111695</span><span>المكتبة ودار النشر</span></div>
        </div>
      </div>
    </div>

    <div class="agent-workflow-card">
      <div class="workflow-title">
        <span>حالة استخدام وكيل الذكاء الاصطناعي (AI Agent Use Case): مستشار القراءة والبيع الإضافي (Upselling)</span>
        <span class="pill pill-auto">أتمتة كاملة 100%</span>
      </div>
      <div class="workflow-steps">
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 01 : تحديد السن والمستوى</div>
          <div class="wf-step-text">يسأل الوكيل عن عمر الطفل ومستواه القرائي واللغة المفضلة ليقترح السلسلة الأنسب بدقة.</div>
        </div>
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 02 : عرض الباقات والخصومات</div>
          <div class="wf-step-text">يعرض الوكيل الباقات المجمعة المتاحة ويوضح نسبة الخصم السارية على كل مجموعة بشفافية.</div>
        </div>
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 03 : تجميع السلة وإتمام الطلب</div>
          <div class="wf-step-text">يحسب إجمالي تكلفة المجموعة بعد الخصم ورسوم التوصيل ويوجه العميل لإتمام الشراء فوراً.</div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>تقرير تحليل قنوات المراسلة — مجموعة نهضة مصر</span>
    <span class="page-num">صفحة 6 من 10</span>
  </div>
</div>

<!-- ==================== PAGE 7: CASE 6 (WEBSITE CHECKOUT & PAYMENT) ==================== -->
<div class="page">
  <div class="page-top-bar">
    <span>تحليل حالات الدعم التفصيلية — المحور السادس</span>
    <span class="nav-section">الحالة 06 من 07 : أعطال الموقع وإنقاذ المبيعات</span>
  </div>

  <div class="page-body">
    <div class="case-banner banner-pink">
      <div>
        <span class="case-num-tag">المحور السادس — إنقاذ السلات المتروكة</span>
        <div class="case-main-title">أعطال الدفع بالموقع الإلكتروني وعوائق التحصيل</div>
        <div class="case-main-sub">عملاء وصلوا لمرحلة الدفع النهائي بالموقع وواجهوا أعطالاً تقنية فتوجهوا لماسنجر</div>
      </div>
      <div class="case-metrics-group">
        <div class="case-metric-pill">
          <div class="cmp-val">4.8%</div>
          <div class="cmp-lbl">حصة السعة الكلية</div>
        </div>
        <div class="case-metric-pill">
          <div class="cmp-val">3</div>
          <div class="cmp-lbl">محادثات موثقة</div>
        </div>
        <div class="case-metric-pill">
          <div class="cmp-val">100%</div>
          <div class="cmp-lbl">نية شراء مؤكدة!</div>
        </div>
      </div>
    </div>

    <div class="share-meter-box">
      <span class="share-meter-label">نسبة الاستحواذ من إجمالي حجم المحادثات:</span>
      <div class="share-meter-track">
        <div class="share-meter-fill" style="width: 4.8%; background: #db2777;"></div>
      </div>
      <span class="share-meter-stat">4.8% (أخطر تسرب إيرادات: عملاء حاولوا الدفع فعلياً وفشل الموقع في إتمام العملية)</span>
    </div>

    <div class="two-col-grid">
      <div class="info-panel">
        <div class="panel-header">
          <span>تشخيص المشكلة وطبيعة الاستفسار</span>
          <span class="pill pill-high">عطل تقني وعائق دفع</span>
        </div>
        <ul class="bullet-list">
          <li><strong>توقف زر إتمام الدفع بالموقع:</strong> يشتكي العملاء من أن الضغط على "متابعة إلى الدفع" لا يستجيب حتى بعد تغيير المتصفح.</li>
          <li><strong>سقوط الموقع الإلكتروني المؤقت:</strong> بلاغات مباشرة من الزوار بأن "الموقع غير متاح" أثناء محاولتهم تصفح وطلب الكتب.</li>
          <li><strong>طلب بدائل دفع مرنة واعتراض على الشحن:</strong> طلب الدفع عبر (فودافون كاش / إنستاباي) والاعتراض على رسوم الشحن (150 ج).</li>
        </ul>
      </div>

      <div class="info-panel impact-panel">
        <div class="panel-header">
          <span>الأثر التجاري والتشغيلي (Business Impact)</span>
          <span class="pill pill-high">خسارة مبيعات جاهزة 100%</span>
        </div>
        <ul class="bullet-list">
          <li><strong>ضياع عملاء في الخطوة الأخيرة:</strong> هؤلاء ليسوا متصفحين عاديين، بل عملاء وضعوا الكتب في السلة وضغطوا زر الدفع فعلياً.</li>
          <li><strong>خطأ التوجيه التلقائي للموقع:</strong> إذا رد الموظف أو البوت بـ "اطلب من الموقع"، فسيخسر العميل فوراً لأن الموقع هو سبب المشكلة!</li>
          <li><strong>إلغاء الطلب بسبب رسوم التوصيل:</strong> عميلة ألغت طلبها بالكامل بعد تفاجئها بأن الشحن للإسكندرية 150 جنيهاً لكتاب واحد.</li>
        </ul>
      </div>
    </div>

    <div class="quotes-panel">
      <div class="panel-header" style="margin-bottom: 4px;">
        <span>نماذج حقيقية من رسائل العملاء المرصودة</span>
        <span style="font-size: 7.8pt; color: #64748b;">مقتبسة نصياً من سجل المحادثات</span>
      </div>
      <div class="quotes-grid">
        <div class="quote-bubble" style="border-right-color: #db2777;">
          <div class="quote-text">«بحاول ع موقع رسمي اطلب كتب مش بينجح عملية تسويق او دفع.. كل ما أدوس متابعه الي الدفع مش بيكمل.. غيرت متصفح بردوا نفس مشكلة»</div>
          <div class="quote-meta"><span>عميل #1122529</span><span>أرفق صورة شاشة العطل</span></div>
        </div>
        <div class="quote-bubble" style="border-right-color: #db2777;">
          <div class="quote-text">«لو سمحت كل لما ادخل على الويب سايت عشان اطلب اوردر ميرضاش يطلب.. انا عايزة التلاتة اللى فى الاسكرين دول»</div>
          <div class="quote-meta"><span>عميل #1135240</span><span>أرفق صورتين للسلة</span></div>
        </div>
        <div class="quote-bubble" style="border-right-color: #db2777;">
          <div class="quote-text">«طرق الدفع مش مناسبة معايا للأسف.. ممكن حل تاني غير الموقع؟ فودافون كاش أو انستا واطلبه من عندكم؟»</div>
          <div class="quote-meta"><span>عميل #1119666</span><span>قناة المكتبة</span></div>
        </div>
      </div>
    </div>

    <div class="agent-workflow-card">
      <div class="workflow-title">
        <span>حالة استخدام وكيل الذكاء الاصطناعي (AI Agent Use Case): إنقاذ السلة وإتمام الطلب داخل المحادثة</span>
        <span class="pill pill-auto">إنقاذ مباشر للمبيعات</span>
      </div>
      <div class="workflow-steps">
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 01 : التقاط صورة السلة</div>
          <div class="wf-step-text">يقرأ الوكيل لقطة الشاشة (Screenshot) التي أرسلها العميل لسلة المشتريات ويستخرج الكتب المطلوبة.</div>
        </div>
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 02 : جمع بيانات التوصيل</div>
          <div class="wf-step-text">يعتذر بلطف عن عطل الموقع ويأخذ بيانات العميل مباشرة في الشات (الاسم، الهاتف، العنوان بالتفصيل).</div>
        </div>
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 03 : تسجيل الطلب بالـ CRM</div>
          <div class="wf-step-text">ينشئ فرصة بيعية مكتملة البيانات (Opportunity) مع خيار الدفع عند الاستلام لإتمام البيع بنجاح.</div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>تقرير تحليل قنوات المراسلة — مجموعة نهضة مصر</span>
    <span class="page-num">صفحة 7 من 10</span>
  </div>
</div>

<!-- ==================== PAGE 8: CASE 7 (VISUAL SEARCH & HR/GENERAL) ==================== -->
<div class="page">
  <div class="page-top-bar">
    <span>تحليل حالات الدعم التفصيلية — المحور السابع</span>
    <span class="nav-section">الحالة 07 من 07 : الوسائط البصرية والتوجيه الإداري</span>
  </div>

  <div class="page-body">
    <div class="case-banner banner-slate">
      <div>
        <span class="case-num-tag">المحور السابع — القدرات البصرية والتوجيه المؤسسي</span>
        <div class="case-main-title">الاستفسارات البصرية بالصور وطلبات التوظيف والعام</div>
        <div class="case-main-sub">11.8% من إجمالي الرسائل تحتوي على صور أغلفة ومرفقات + استفسارات موارد بشرية</div>
      </div>
      <div class="case-metrics-group">
        <div class="case-metric-pill">
          <div class="cmp-val">30</div>
          <div class="cmp-lbl">مرفق وسائط (11.8%)</div>
        </div>
        <div class="case-metric-pill">
          <div class="cmp-val">28</div>
          <div class="cmp-lbl">صورة غلاف/شاشة</div>
        </div>
        <div class="case-metric-pill">
          <div class="cmp-val">14.5%</div>
          <div class="cmp-lbl">توظيف وتوجيه عام</div>
        </div>
      </div>
    </div>

    <div class="share-meter-box">
      <span class="share-meter-label">نسبة الرسائل الحاملة للصور والمرفقات:</span>
      <div class="share-meter-track">
        <div class="share-meter-fill" style="width: 11.8%; background: #475569;"></div>
      </div>
      <span class="share-meter-stat">11.8% من الرسائل (28 صورة + 1 ملف PDF + 1 رسالة صوتية)</span>
    </div>

    <div class="two-col-grid">
      <div class="info-panel">
        <div class="panel-header">
          <span>تشخيص المشكلة وطبيعة الاستفسار</span>
          <span class="pill pill-med">وسائط متعددة وتوجيه</span>
        </div>
        <ul class="bullet-list">
          <li><strong>إرسال صور أغلفة الكتب بدون نص:</strong> يرسل العميل صورة غلاف كتاب ويسأل "هل ده متوفر؟" أو "لغة الكتاب ده إيه؟" دون كتابة اسم الكتاب.</li>
          <li><strong>طلب معاينة صفحات داخلية:</strong> عملاء يطلبون صوراً أو فيديو من داخل الكتاب (مثل مغامرات سبايدر ويك) قبل قرار الشراء.</li>
          <li><strong>طلبات التوظيف والموارد البشرية:</strong> استفسارات عن وظائف (مصمم جرافيك) أو متابعة إجراءات إخلاء طرف لموظفين سابقين.</li>
        </ul>
      </div>

      <div class="info-panel impact-panel">
        <div class="panel-header">
          <span>الأثر التجاري والتشغيلي (Business Impact)</span>
          <span class="pill pill-high">مرونة اختيار نموذج الـ LLM</span>
        </div>
        <ul class="bullet-list">
          <li><strong>عجز البوتات النصية التقليدية:</strong> أي نظام أتمتة لا يدعم قراءة الصور (Vision) سيفشل تماماً في الرد على 1 من كل 8 عملاء.</li>
          <li><strong>حرية استخدام أي نموذج ذكاء اصطناعي (Any LLM):</strong> يتيح النظام ربط أي نموذج LLM مناسب لمعالجة النصوص والصور بكفاءة.</li>
          <li><strong>استقطاب الكفاءات المهنية:</strong> توجيه المتقدمين للوظائف بشكل احترافي يعكس الصورة المؤسسية العريقة لمجموعة نهضة مصر.</li>
        </ul>
      </div>
    </div>

    <div class="quotes-panel">
      <div class="panel-header" style="margin-bottom: 4px;">
        <span>نماذج حقيقية من رسائل العملاء المرصودة</span>
        <span style="font-size: 7.8pt; color: #64748b;">مقتبسة نصياً من سجل المحادثات</span>
      </div>
      <div class="quotes-grid">
        <div class="quote-bubble" style="border-right-color: #475569;">
          <div class="quote-text">«[صورة غلاف كتاب] محتاجة الكتاب ده بعد اذنك»<br>«[صورة غلاف] لغة الكتاب ده ايه لو سمحتم؟ هل متاح ريفيو لبعض الصفحات؟»</div>
          <div class="quote-meta"><span>عملاء #1123080 / #1128657</span><span>قناة المكتبة</span></div>
        </div>
        <div class="quote-bubble" style="border-right-color: #475569;">
          <div class="quote-text">«السلام عليكم لو سمحت ممكن صورة من داخل كتاب مغامرات ال سبايدر ويك؟»</div>
          <div class="quote-meta"><span>عميل #1117479</span><span>قناة دار النشر (4 رسائل)</span></div>
        </div>
        <div class="quote-bubble" style="border-right-color: #475569;">
          <div class="quote-text">«مساء الخير، أقدم ازاي علي وظيفه جرافيك ديزاينر؟؟ هل في رقم تواصل HR؟»</div>
          <div class="quote-meta"><span>عميل #1107726</span><span>قناة دار النشر</span></div>
        </div>
      </div>
    </div>

    <div class="agent-workflow-card">
      <div class="workflow-title">
        <span>حالة استخدام وكيل الذكاء الاصطناعي (AI Agent Use Case): الرؤية البصرية والتوجيه المؤسسي</span>
        <span class="pill pill-auto">يدعم أي نموذج LLM</span>
      </div>
      <div class="workflow-steps">
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 01 : قراءة الصور والصوت</div>
          <div class="wf-step-text">يحلل الوكيل صورة غلاف الكتاب المرسلة ويستخرج اسم الكتاب والمؤلف، ويحول الرسائل الصوتية لنصوص.</div>
        </div>
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 02 : المطابقة والرد الفوري</div>
          <div class="wf-step-text">يطابق الكتاب المستخرج من الصورة مع قاعدة المعرفة ويجيب العميل بالسعر واللغة والتوافر.</div>
        </div>
        <div class="wf-step">
          <div class="wf-step-num">الخطوة 03 : تحويل طلبات الـ HR</div>
          <div class="wf-step-text">يوجه راغبي التوظيف آلياً إلى بوابة الوظائف الرسمية وإيميل الموارد البشرية دون إشغال فريق المبيعات.</div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>تقرير تحليل قنوات المراسلة — مجموعة نهضة مصر</span>
    <span class="page-num">صفحة 8 من 10</span>
  </div>
</div>

<!-- ==================== PAGE 9: VOLUME & COST PROJECTIONS ==================== -->
<div class="page">
  <div class="page-top-bar">
    <span>التحليل الكمي والمالي — الحجم والتكلفة المتوقعة</span>
    <span class="nav-section">توقعات الحجم الشهري والتكلفة التقديرية</span>
  </div>

  <div class="page-body">
    <div class="case-banner banner-blue" style="padding: 13px 20px;">
      <div>
        <span class="case-num-tag">الدراسة الكمية والمالية</span>
        <div class="case-main-title">تحليل حجم الرسائل اليومي والتوقعات الشهرية والتكلفة</div>
        <div class="case-main-sub">حساب معدلات التدفق اليومية والشهرية وتقدير التكلفة الشهرية المتوقعة (بمتوسط 1 جنيه مصري للرسالة)</div>
      </div>
    </div>

    <!-- Daily Traffic Visual Breakdown -->
    <div class="daily-bars-box">
      <div class="panel-header" style="margin-bottom: 7px;">
        <span>التدفق اليومي الفعلي للرسائل والعملاء خلال فترة الرصد (11 – 17 أكتوبر 2026)</span>
        <span style="font-size: 7.8pt; color: #64748b;">الأزرق: المكتبة (384) • البنفسجي: دار النشر (385)</span>
      </div>

      <div class="daily-row">
        <div class="daily-date">الأحد 11 أكتوبر</div>
        <div class="daily-track">
          <div style="width: 3.2%; background: #2563eb;"></div>
          <div style="width: 15.9%; background: #7c3aed;"></div>
        </div>
        <div class="daily-stat">12 رسالة (4 عملاء)</div>
      </div>
      <div class="daily-row">
        <div class="daily-date">الاثنين 12 أكتوبر</div>
        <div class="daily-track">
          <div style="width: 49.2%; background: #2563eb;"></div>
          <div style="width: 12.7%; background: #7c3aed;"></div>
        </div>
        <div class="daily-stat">39 رسالة (14 عميلاً)</div>
      </div>
      <div class="daily-row">
        <div class="daily-date">الثلاثاء 13 أكتوبر</div>
        <div class="daily-track">
          <div style="width: 66.7%; background: #2563eb;"></div>
          <div style="width: 1.6%; background: #7c3aed;"></div>
        </div>
        <div class="daily-stat">43 رسالة (10 عملاء)</div>
      </div>
      <div class="daily-row">
        <div class="daily-date">الأربعاء 14 أكتوبر</div>
        <div class="daily-track">
          <div style="width: 17.5%; background: #2563eb;"></div>
          <div style="width: 17.5%; background: #7c3aed;"></div>
        </div>
        <div class="daily-stat">22 رسالة (11 عميلاً)</div>
      </div>
      <div class="daily-row">
        <div class="daily-date">الخميس 15 أكتوبر (الذروة)</div>
        <div class="daily-track">
          <div style="width: 82.5%; background: #2563eb;"></div>
          <div style="width: 17.5%; background: #7c3aed;"></div>
        </div>
        <div class="daily-stat" style="color:#dc2626;">63 رسالة (15 عميلاً)</div>
      </div>
      <div class="daily-row">
        <div class="daily-date">الجمعة 16 أكتوبر</div>
        <div class="daily-track">
          <div style="width: 47.6%; background: #2563eb;"></div>
          <div style="width: 20.6%; background: #7c3aed;"></div>
        </div>
        <div class="daily-stat">43 رسالة (14 عميلاً)</div>
      </div>
      <div class="daily-row">
        <div class="daily-date">السبت 17 أكتوبر</div>
        <div class="daily-track">
          <div style="width: 31.7%; background: #2563eb;"></div>
          <div style="width: 20.6%; background: #7c3aed;"></div>
        </div>
        <div class="daily-stat">33 رسالة (10 عملاء)</div>
      </div>
    </div>

    <!-- Volume & Monthly Projections Table -->
    <div class="capacity-card" style="padding: 10px 14px;">
      <table class="clean-table">
        <thead>
          <tr>
            <th>المسار / القناة</th>
            <th>إجمالي 7 أيام (رسائل)</th>
            <th>إجمالي 7 أيام (عملاء)</th>
            <th>المعدل اليومي للرسائل</th>
            <th>المعدل اليومي للعملاء</th>
            <th>الحجم الشهري المتوقع (30 يوماً)</th>
            <th>العملاء المتوقعون شهرياً</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>مكتبة نهضة مصر (384)</strong></td>
            <td>188 رسالة</td>
            <td>38 عميلاً</td>
            <td>26.86 رسالة/يوم</td>
            <td>5.43 عميل/يوم</td>
            <td><strong>806 رسائل / شهر</strong></td>
            <td><strong>163 عميلاً / شهر</strong></td>
          </tr>
          <tr>
            <td><strong>دار نهضة مصر للنشر (385)</strong></td>
            <td>67 رسالة</td>
            <td>24 عميلاً</td>
            <td>9.57 رسالة/يوم</td>
            <td>3.43 عميل/يوم</td>
            <td><strong>287 رسالة / شهر</strong></td>
            <td><strong>103 عملاء / شهر</strong></td>
          </tr>
          <tr style="background:#eff6ff; font-weight:800;">
            <td><strong>الإجمالي الموحد للقناتين</strong></td>
            <td><strong>255 رسالة</strong></td>
            <td><strong>62 عميلاً</strong></td>
            <td><strong>36.43 رسالة/يوم</strong></td>
            <td><strong>8.86 عميل/يوم</strong></td>
            <td><strong style="color:#1e3a8a;">1,093 رسالة / شهر</strong></td>
            <td><strong style="color:#1e3a8a;">266 عميلاً / شهر</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Single Unified Cost Estimation Card -->
    <div class="unified-cost-card">
      <div class="panel-header" style="color:#065f46; border-bottom-color:#a7f3d0; margin-bottom: 6px;">
        <span>التكلفة التشغيلية المتوقعة (بناءً على متوسط 1 جنيه مصري للرسالة — بنطاق من 0.5 إلى 1.5 جنيه)</span>
        <span class="pill pill-auto">تقدير مبدئي مرن</span>
      </div>

      <div class="cost-tiers-grid">
        <div class="cost-tier-box">
          <div class="tier-badge">الحد الأدنى التقديري (0.5 ج / رسالة)</div>
          <div class="tier-price">546 جنيه / شهرياً</div>
          <div class="tier-sub">بمعدل 18.21 جنيه يومياً</div>
        </div>
        <div class="cost-tier-box featured">
          <div class="tier-badge">المتوسط التقديري المعتمد (1.0 ج / رسالة)</div>
          <div class="tier-price">1,093 جنيه / شهرياً</div>
          <div class="tier-sub">36.43 ج/يوم (806 ج مكتبة • 287 ج نشر)</div>
        </div>
        <div class="cost-tier-box">
          <div class="tier-badge">الحد الأعلى التقديري (1.5 ج / رسالة)</div>
          <div class="tier-price">1,639 جنيه / شهرياً</div>
          <div class="tier-sub">بمعدل 54.64 جنيه يومياً</div>
        </div>
      </div>

      <ul class="bullet-list" style="font-size: 8.2pt; gap: 4px;">
        <li><strong>كيف تتحدد التكلفة الفعلية النهائية؟</strong> تتراوح تكلفة الرسالة بين <strong>0.5 جنيه إلى 1.5 جنيه مصري</strong> (بمتوسط 1 جنيه) كـ <strong>تقدير مبدئي</strong>، وتتحدد القيمة الدقيقة النهائية بناءً على <strong>حالات الاستخدام النهائية (Final Use Cases)</strong> التي سيتم بناؤها ومستوى <strong>الربط البرمجي (Integrations)</strong> مع المتجر الإلكتروني أو أنظمة الشحن والـ Backend.</li>
        <li><strong>مرونة كاملة في اختيار نموذج الذكاء الاصطناعي (Any LLM):</strong> يمكن للوكيل الذكي استخدام أي نموذج LLM للإجابة على الأسئلة وتنفيذ المهام وفق ما يحقق أفضل توازن بين الدقة والتكلفة.</li>
      </ul>
    </div>
  </div>

  <div class="page-footer">
    <span>تقرير تحليل قنوات المراسلة — مجموعة نهضة مصر</span>
    <span class="page-num">صفحة 9 من 10</span>
  </div>
</div>

<!-- ==================== PAGE 10: AGENT SCOPE MATRIX & STRATEGIC TAKEAWAYS ==================== -->
<div class="page">
  <div class="page-top-bar">
    <span>خطة العمل ومصفوفة مهام الذكاء الاصطناعي</span>
    <span class="nav-section">المهام التشغيلية للوكيل الذكي والتوصيات</span>
  </div>

  <div class="page-body">
    <div class="case-banner banner-green" style="padding: 13px 20px;">
      <div>
        <span class="case-num-tag">خطة التفعيل والتشغيل</span>
        <div class="case-main-title">ما الذي سيقوم به وكيل الذكاء الاصطناعي؟ (Agent Use Cases)</div>
        <div class="case-main-sub">توزيع الأدوار التشغيلية بين الأتمتة الكاملة عبر الوكيل الذكي والتصعيد البشري المنظم</div>
      </div>
    </div>

    <div class="capacity-card" style="padding: 11px 14px;">
      <div class="capacity-title" style="margin-bottom: 6px;">مصفوفة حالات الاستخدام لوكيل الذكاء الاصطناعي (GenuDo AI Agent Scope):</div>
      <table class="clean-table">
        <thead>
          <tr>
            <th>حالة الاستخدام (Use Case)</th>
            <th>نسبة الحجم</th>
            <th>درجة الأتمتة</th>
            <th>الدور التنفيذي لوكيل الذكاء الاصطناعي</th>
            <th>متى يتدخل الفريق البشري؟</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1. استعلامات الكتب والأسعار</strong></td>
            <td>22.6%</td>
            <td><span class="pill pill-auto">100% آلي</span></td>
            <td>البحث في الكتالوج أو المتجر، عرض السعر والطبعة، وإرسال رابط الشراء الفوري.</td>
            <td>لا يتطلب تدخلاً بشرياً.</td>
          </tr>
          <tr>
            <td><strong>2. تتبع الشحنات المتأخرة</strong></td>
            <td>21.0%</td>
            <td><span class="pill pill-auto">90% آلي</span></td>
            <td>التحقق من حالة الطلب برقم الأوردر/الهاتف وطمأنة العميل بموعد التوصيل.</td>
            <td>فقط في حالات فقدان الشحنة أو تلف الكتاب.</td>
          </tr>
          <tr>
            <td><strong>3. استقبال طلبات النشر والترجمة</strong></td>
            <td>14.5%</td>
            <td><span class="pill pill-auto">100% آلي</span></td>
            <td>شرح شروط ومواعيد التقديم، جمع ملخص العمل والسيرة الذاتية في نموذج منظم.</td>
            <td>لجنة القراءة تراجع الأعمال المؤهلة دورياً.</td>
          </tr>
          <tr>
            <td><strong>4. إرشاد الفروع ومواعيد العمل</strong></td>
            <td>14.5%</td>
            <td><span class="pill pill-auto">100% آلي</span></td>
            <td>إرسال العنوان، رابط خرائط جوجل، وتوضيح سريان الخصومات في الفروع.</td>
            <td>لا يتطلب تدخلاً بشرياً.</td>
          </tr>
          <tr>
            <td><strong>5. ترشيح باقات الأطفال والخصومات</strong></td>
            <td>8.1%</td>
            <td><span class="pill pill-auto">100% آلي</span></td>
            <td>ترشيح المستويات القرائية حسب سن الطفل وحساب خصم المجموعات.</td>
            <td>لا يتطلب تدخلاً بشرياً.</td>
          </tr>
          <tr>
            <td><strong>6. إنقاذ الطلبات المتعثرة بالموقع</strong></td>
            <td>4.8%</td>
            <td><span class="pill pill-med">مشترك (Hybrid)</span></td>
            <td>أخذ بيانات العميل والكتب المطلوبة داخل الشات وتسجيل الطلب كـ Opportunity.</td>
            <td>فريق العمليات يؤكد خروج الشحنة من المخزن.</td>
          </tr>
          <tr>
            <td><strong>7. قراءة صور الأغلفة والتوجيه العام</strong></td>
            <td>14.5%</td>
            <td><span class="pill pill-auto">100% آلي</span></td>
            <td>تحليل صور الكتب عبر الرؤية البصرية، وتوجيه طلبات الـ HR لبوابة التوظيف.</td>
            <td>الموارد البشرية تفرز المتقدمين.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 4 Strategic Takeaways Grid -->
    <div class="two-col-grid">
      <div class="info-panel" style="padding: 10px 14px;">
        <div class="panel-header" style="margin-bottom: 5px;">
          <span>1. توحيد القاعدة المعرفية بين المسارين</span>
          <span class="pill pill-med">أولوية قصوى</span>
        </div>
        <div style="font-size: 8.3pt; color: #334155; line-height: 1.48;">
          نظراً لأن العملاء يرسلون طلبات النشر للمكتبة وأسئلة الكتب لدار النشر، يجب ربط الوكيلين بقاعدة معرفة مشتركة ليجيب كل وكيل على استفسار العميل فوراً دون إحالته لصفحة أخرى.
        </div>
      </div>

      <div class="info-panel" style="padding: 10px 14px;">
        <div class="panel-header" style="margin-bottom: 5px;">
          <span>2. التكامل مع المتجر وإنقاذ المبيعات</span>
          <span class="pill pill-high">حماية الإيرادات</span>
        </div>
        <div style="font-size: 8.3pt; color: #334155; line-height: 1.48;">
          ربط الوكيل الذكي بالمتجر الإلكتروني لتمكينه من البحث الفوري وتسجيل الطلبات مباشرة داخل ماسنجر عند تعطل الدفع بالموقع، لمنع ضياع المبيعات الجاهزة.
        </div>
      </div>

      <div class="info-panel" style="padding: 10px 14px;">
        <div class="panel-header" style="margin-bottom: 5px;">
          <span>3. الربط البرمجي لتتبع الشحنات (Order Lookup)</span>
          <span class="pill pill-auto">تخفيف 31% من العبء</span>
        </div>
        <div style="font-size: 8.3pt; color: #334155; line-height: 1.48;">
          تزويد الوكيل بأداة استعلام عن حالة الطلب يختصر 31.6% من محادثات المكتبة، ويمنع تكدس عشرات الرسائل المتكررة من العملاء القلقين على شحناتهم.
        </div>
      </div>

      <div class="info-panel" style="padding: 10px 14px;">
        <div class="panel-header" style="margin-bottom: 5px;">
          <span>4. مرونة استخدام أي نموذج ذكاء اصطناعي (LLM)</span>
          <span class="pill pill-auto">تغطية نصوص وصور</span>
        </div>
        <div style="font-size: 8.3pt; color: #334155; line-height: 1.48;">
          يتمتع النظام بمرونة تشغيل أي نموذج LLM للإجابة على الأسئلة النصية وتحليل الصور المرسلة (11.8% من الرسائل)، ويتم ضبط النموذج النهائي حسب حالات الاستخدام المعتمدة.
        </div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>تقرير تحليل قنوات المراسلة — مجموعة نهضة مصر</span>
    <span class="page-num">صفحة 10 من 10</span>
  </div>
</div>

</body>
</html>
"""

import argparse

parser = argparse.ArgumentParser(description="Render Arabic Channel Audit Report to HTML and PDF")
parser.add_argument("--input", default=None, help="Input JSON data file")
parser.add_argument("--output-html", default="reports/channel_audit_report_ar.html", help="Output HTML file path")
parser.add_argument("--output-pdf", default="reports/channel_audit_report_ar.pdf", help="Output PDF file path")
args, _ = parser.parse_known_args()

out_html = Path(args.output_html).resolve()
pdf_path = Path(args.output_pdf).resolve()
out_html.parent.mkdir(parents=True, exist_ok=True)
pdf_path.parent.mkdir(parents=True, exist_ok=True)

with open(out_html, "w", encoding="utf-8") as f:
    f.write(html_content)

async def render_and_verify():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1240, "height": 1754})
        await page.goto(f"file://{out_html}", wait_until="networkidle")
        await page.wait_for_timeout(1500)
        
        pages_els = await page.query_selector_all(".page")
        for idx, el in enumerate(pages_els):
            dims = await el.evaluate("el => ({sh: el.scrollHeight, ch: el.clientHeight})")
            overflow = dims['sh'] - dims['ch']
            print(f"Page {idx+1}: scrollHeight={dims['sh']}, clientHeight={dims['ch']}, overflow={overflow}")
            
        await page.pdf(
            path=str(pdf_path),
            format="A4",
            print_background=True,
            margin={"top": "0mm", "bottom": "0mm", "left": "0mm", "right": "0mm"}
        )
        print(f"Successfully generated PDF: {pdf_path}")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(render_and_verify())

