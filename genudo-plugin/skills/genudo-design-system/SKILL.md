---
name: genudo-design-system
description: Canonical visual styling, color tokens, typography rules, component geometry, and dashboard hierarchy for GenuDo web dashboards, UI widgets, and mobile surfaces (based on the GenuDo Handover Specification). Use whenever designing, generating, or restyling any GenuDo dashboard, frontend component, or report.
---

# GenuDo Design System Specification

This is the authoritative design system and visual specification for all GenuDo dashboards, web apps, and UI widgets, derived directly from the official GenuDo Handover Specification (`GP-1067 Mobile App / Dashboard`).

---

## 1. Golden Design Rules

1. **NO GRADIENTS ANYWHERE:** 
   * **Solid fills only** across all cards, buttons, backgrounds, tracks, and charts. 
   * Never use linear or radial gradient backgrounds or gradient fills.
2. **MONO FOR ALL NUMERALS (Deliberate & Mandatory):**
   * **`JetBrains Mono`** must be used for **every** number, metric, percentage, currency, count, ID, phone number, and timestamp.
   * **`Inter`** is used for all Latin labels, headings, and body copy.
   * **`IBM Plex Sans Arabic`** is used for all text under Arabic (`ar`) / RTL locale.
   * *The mono-for-numerals rule is deliberate* — it keeps metric columns optically aligned and is the single most visible detail if dropped. Apply it per-span/element when a string mixes label and number.
3. **CARD ANATOMY:**
   * 16 px padding (`p-4`), 16 px corner radius (`radius/2xl` / `rounded-2xl`).
   * **Both** 1 px solid `line` border (`#E8E8F0`) **and** subtle card shadow (`0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)`) together.
   * Elevation alone is never used without the border.
4. **SEMANTIC TINT RULE:**
   * Container fill is always the `50` tint; text/icon is always the `600` tint.
   * Never put `500` text on a `50` fill.
5. **TOUCH & HIT TARGETS:**
   * 44 px minimum touch target.
   * Inputs & standard buttons: 44 px (`h-11`).
   * Primary CTAs: 48 px (`h-12`).
   * Icon buttons: 40 px with 44 px hit area.

---

## 2. Color Palette & Tokens

### Brand (Primary Ramp)

| Token | Hex | Tailwind Equivalent | Used for |
|---|---|---|---|
| `brand/50` | `#F2F1FE` | `bg-brand-50` | icon tile backgrounds, selected chip fill |
| `brand/100` | `#E6E4FD` | `bg-brand-100` | reaction/avatar tint, pressed state on brand/50 |
| `brand/200` | `#CDC9FB` | `border-brand-200` | disabled primary button, unread card border |
| `brand/300` | `#ABA4F7` | `bg-brand-300` | secondary accents |
| `brand/400` | `#8B81F3` | `border-brand-400` | focus border ring |
| `brand/500` | `#6D64F0` | `bg-brand-500` | funnel bars, chart stroke, read receipts |
| **`brand/600`** | **`#5B52E8`** | `bg-brand-600` | **primary**: buttons, active tab, hero card, sent bubbles |
| `brand/700` | `#4A41CF` | `bg-brand-700` | pressed primary, link text on light background |
| `brand/800` | `#3B34A6` | `bg-brand-800` | deep brand accents |
| `brand/900` | `#2C2778` | `bg-brand-900` | dark brand containers |

### Neutrals

| Token | Hex | Tailwind Equivalent | Used for |
|---|---|---|---|
| `ink` | `#101828` | `text-ink` / `text-[#101828]` | primary text, headings |
| `ink/soft` | `#475467` | `text-ink-soft` / `text-[#475467]` | secondary text, labels, descriptions |
| `ink/muted` | `#8A93A6` | `text-ink-muted` / `text-[#8A93A6]` | tertiary text, timestamps, placeholders, inactive tabs |
| `line` | `#E8E8F0` | `border-line` / `border-[#E8E8F0]` | all card borders, table dividers, input borders |
| `canvas` | `#F6F6FA` | `bg-canvas` / `bg-[#F6F6FA]` | app background, inset rows, chart tracks |
| `surface` | `#FFFFFF` | `bg-surface` / `bg-[#FFFFFF]` | cards, headers, sheets, modal panels |

### Semantic Roles

| Role | 50 (Fill / Container) | 500 (Core / Marker) | 600 (Text & Icons) |
|---|---|---|---|
| **success** (Won / Active) | `#EAFAF0` | `#16A34A` | `#107A3A` |
| **warn** (Pending / Scheduled) | `#FEF5E7` | `#F59E0B` | `#A96F07` |
| **danger** (Lost / Overdue / Error) | `#FDECEB` | `#EF4444` | `#C62F2F` |

*Rule:* Always pair container fill `50` with text `600`. Example: `bg-[#EAFAF0] text-[#107A3A]`.

### Channel Accents

| Channel | Icon Color | Container Fill |
|---|---|---|
| **WhatsApp Cloud / Mobile** | `#107A3A` | `#EAFAF0` |
| **Messenger** | `#4A41CF` | `#F2F1FE` |
| **Instagram** | `#C1357F` | `#FDEEF6` |
| **Web Chat** | `#475467` | `#F6F6FA` |

---

## 3. Typography Scale & Families

### Font Families
* **`Inter`**: All Latin UI text (default interface font).
* **`JetBrains Mono`**: Numbers, metrics, currency, percentages, counts, IDs, phone numbers, timestamps.
* **`IBM Plex Sans Arabic`**: All text when locale is `ar` (RTL).

### Type Styles

| Style | Size / Weight / Line-Height | Family | Where |
|---|---|---|---|
| **Display** | 30px / 700 / 1.15 | Inter | Welcome headlines |
| **Auth title** | 27px / 700 / 1.2 | Inter | Auth screens |
| **Screen title** | 22px / 700 / 1.15 | Inter | Screen headers |
| **Metric hero** | 38px / 600 | JetBrains Mono | Dashboard active leads hero |
| **Metric large** | 26–30px / 600 | JetBrains Mono | Follow-up total, plan price |
| **Metric medium** | 17–20px / 600 | JetBrains Mono | KPI tiles, pipeline metrics |
| **Section / card title** | 14.5–16px / 600 | Inter | Panel headers |
| **List primary** | 14.5px / 600 (700 when unread) | Inter | Conversation & pipeline names |
| **Body** | 13–14px / 400–500 / 1.5 | Inter | Message text, descriptions |
| **Label** | 12–12.5px / 500 | Inter | Field labels, captions |
| **Meta** | 10.5–11.5px / 400 | JetBrains Mono | Timestamps, costs, footnotes |
| **Overline** | 12px / 600 / uppercase / +0.04em | Inter | Filter-group legends only |

---

## 4. Shape, Elevation & Geometry

| Token | Value | Tailwind Class | Where |
|---|---|---|---|
| `radius/lg` | 8px | `rounded-lg` | inline chips, small tiles, selects |
| `radius/xl` | 12px | `rounded-xl` | inputs, buttons, icon buttons, inset rows |
| `radius/2xl` | 16px | `rounded-2xl` | cards, panels |
| `radius/3xl` | 24px | `rounded-3xl` | bottom sheets, modal top corners |
| `radius/full` | 9999px | `rounded-full` | avatars, pills, toggles, progress tracks |
| `shadow/card` | `0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)` | `shadow-card` | cards, panels |
| `shadow/lift` | `0 8px 24px rgba(16,24,40,.10)` | `shadow-lift` | hero card, sheets, popovers, tooltips |

*Layout Rhythm:* 4 px base unit; page horizontal padding 16 px (`px-4`); section vertical spacing 16–20 px (`gap-4` to `gap-5` or `space-y-4` to `space-y-5`).

---

## 5. Motion & Transitions

* **Duration:** Short, purposeful, capped at 300 ms max.
* **Press / Color feedback:** 150 ms `easeOut`.
* **Toggle knob & track:** 150 ms `easeOut`.
* **Progress-meter fill:** 300 ms `cubic-bezier(0.23, 1, 0.32, 1)`.
* **Dashboard refresh fade:** 150 ms `easeOut` — dims the dashboard body to 60% opacity and shows "Updating...", then stamps the new timestamp.
* **No entrance animations on scroll:** Do not add decorative scroll-triggered animations.

---

## 6. Official Dashboard Order & Anatomy (Fixed Hierarchy)

Every GenuDo dashboard follows this exact signed-off hierarchy (GP-1068 / US-57):

1. **Header Bar:**
   * Surface background (`bg-[#FFFFFF]`), border-bottom 1px solid `line` (`#E8E8F0`).
   * GenuDo brand mark in `brand/600` (`#5B52E8`), live status pill (Success: `#EAFAF0` / `#107A3A`).
   * Filter chips (Date Range: 7d / 30d / 90d / all, Pipeline selector).
   * Manual Refresh button with 150 ms fade effect.
2. **Hero Card (`brand/600` `#5B52E8`):**
   * Active pipeline leads in **38 px JetBrains Mono** (`text-4xl font-mono font-semibold tracking-tight text-white`).
   * "% of total" pill + total pipeline leads count.
   * Won/Lost split inside at 20 px with win rate percentage.
3. **Horizontal KPI Strip (4-up cards):**
   * Total Won Deals (Success `#107A3A` badge).
   * Active Pipeline Leads (Brand `#5B52E8` badge).
   * Total Conversations / Message Volume (Channel count in mono).
   * Cost Per Deal / AI Cost (`$X.XX` in mono).
4. **Pipeline Funnel:**
   * Per stage: Name, count in JetBrains Mono, proportional horizontal progress bar (solid `#6D64F0` on `#F6F6FA` track), conversion % (`success` tint), drop-off count + % (`danger` tint).
   * **CRITICAL RULE:** *The web funnel shape is intentionally replaced by bars; do not reproduce the funnel silhouette on mobile or web dashboards.*
5. **Opportunity Trends Chart:**
   * Area chart with solid `brand/600` (`#5B52E8`) stroke.
   * **Gradient-free solid fill at 18% opacity** (`rgba(91, 82, 232, 0.18)`).
   * Integer Y-axis formatted in JetBrains Mono.
   * Pinned `dir="ltr"` even under RTL locale.
6. **Cost Over Time Chart:**
   * Area chart with solid `warn/500` (`#F59E0B`) stroke.
   * **Gradient-free solid fill at 18% opacity** (`rgba(245, 158, 11, 0.18)`).
   * Currency axis (`$`) formatted in JetBrains Mono. Caption shows total cost.
7. **Follow-Up Health / Messaging Channels:**
   * Total + stacked segment bar + legend rows (Sent / Scheduled / Overdue).
   * Or Messaging Channel volume breakdown (WhatsApp `#107A3A`, Messenger `#4A41CF`, Instagram `#C1357F`, Web Chat `#475467`).
8. **Recent Opportunities Table:**
   * Contact name in Inter, phone number / ID in JetBrains Mono (`text-[11px] font-mono text-ink-muted`).
   * Stage with neutral tag, Status in semantic pill (`won` = `#EAFAF0` / `#107A3A`, `active` = `#F2F1FE` / `#4A41CF`, `lost` = `#FDECEB` / `#C62F2F`).
   * Value in JetBrains Mono right-aligned.

---

## 7. Localization & RTL (GP-1073)

* **Locales Supported:** `en` (LTR) and `ar` (RTL).
* **Font Swap:** When locale is `ar`, swap `Inter` with `IBM Plex Sans Arabic`.
* **Mirroring:** Use directional properties (`ms-*`, `me-*`, `text-start`, `text-end`).
* **DO NOT MIRROR:**
  * Chart axes (always stay LTR — pin `dir="ltr"` on trend charts).
  * Phone numbers (always stay LTR formatted in JetBrains Mono).
  * Mono numeral strings (counts, currencies, OTP digits).
