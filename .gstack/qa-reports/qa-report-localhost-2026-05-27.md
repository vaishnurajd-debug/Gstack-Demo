# QA Report: Yosi Health Dashboard (gstack-qa-demo)

| Field | Value |
|-------|-------|
| **Date** | 2026-05-27 |
| **URL** | http://localhost:3001 |
| **Branch** | main |
| **Commit (baseline)** | 686a8bd (2026-05-27) |
| **Commit (final)** | c1e644d (2026-05-27) |
| **PR** | — |
| **Tier** | Standard |
| **Scope** | Full app (dashboard module) |
| **Duration** | ~15 min |
| **Pages visited** | 1 (single-page dashboard, all tabs) |
| **Screenshots** | 9 |
| **Framework** | React 18 + Vite 5 |
| **Index** | [All QA runs](./index.md) |

## Health Score: 96/100 (baseline) → 99/100 (final)

| Category | Before | After | Delta |
|----------|-------:|------:|------:|
| Console | 100 | 100 | 0 |
| Links | 100 | 100 | 0 |
| Visual | 97 | 97 | 0 |
| Functional | 92 | 100 | **+8** |
| UX | 89 | 97 | **+8** |
| Performance | 100 | 100 | 0 |
| Content | 97 | 97 | 0 |
| Accessibility | 97 | 97 | 0 |
| **Overall** | **96** | **99** | **+3** |

## Top 3 Things to Fix

1. **ISSUE-009: Nav tabs show Today Patients regardless of which tab is active** — clicking Payment, Referrals, etc. showed the same patient table. Fixed: non-today tabs now show a "coming soon" placeholder. Commit: d8ab1d0.
2. **ISSUE-010: Mobile nav tab bar overflows with no scroll** — at 375px viewport, "On Demand" and "YosiChat" tabs were cut off with no way to reach them. Fixed: `overflow-x: auto` on `.tabs`. Commit: c1e644d.
3. **ISSUE-006: "Last updated by" wrong preposition** (deferred) — should be "Last updated **at**". Low severity.

## Console Health

No JavaScript exceptions, no failed network requests, no deprecation warnings across all pages and interactions.

| Error | Count | First seen |
|-------|-------|------------|
| — | 0 | — |

## Summary

| Severity | Count |
|----------|------:|
| Critical | 0 |
| High | 0 |
| Medium | 2 (both fixed) |
| Low | 2 (both deferred) |
| **Total new** | **2 new, 2 deferred** |

---

## Issues

### ISSUE-009: Nav tabs show Today Patients content regardless of active tab — FIXED ✅

| Field | Value |
|-------|-------|
| **Severity** | medium |
| **Category** | functional / UX |
| **URL** | http://localhost:3001 |
| **Component** | `gstack-demo/src/App.jsx:94-166` |
| **Fix commit** | d8ab1d0 |

**Description:** Clicking Payment, Referrals, Surveys, Users, Reports, On Demand, or YosiChat in the top nav highlights the button (CSS active state) but the patient table below never changes — it always renders the Today Patients view. Users have no indication that these modules are not yet implemented.

**Repro Steps:**
1. Navigate to http://localhost:3001
2. Click the **Payment** tab in the top navigation
3. **Observe:** The CHECKED-IN / CANCELLED sub-tabs and patient table remain visible — no change from Today Patients view

**Expected:** Either navigate to a Payment module, OR clearly indicate the module is not yet available.

**Fix:** Wrapped the patient panel in `{activeTab === 'today' && ...}` conditional, added a "coming soon" placeholder section for all other tab values.

**Before screenshot:** [payment-tab.png](screenshots/payment-tab.png)
**After screenshot:** [issue-009-after.png](screenshots/issue-009-after.png)

---

### ISSUE-010: Mobile nav tabs overflow with no horizontal scroll — FIXED ✅

| Field | Value |
|-------|-------|
| **Severity** | medium |
| **Category** | UX / responsive |
| **URL** | http://localhost:3001 |
| **Component** | `gstack-demo/src/styles.css:27` (`.tabs`) |
| **Fix commit** | c1e644d |

**Description:** At 375×812 (iPhone-sized viewport), the top navigation bar renders all tabs in a single row with no overflow handling. Tabs beyond "Surveys" (Reports, On Demand, YosiChat) are clipped and unreachable — no scrollbar, no wrap.

**Repro Steps:**
1. Open http://localhost:3001 in a browser at 375px width (DevTools responsive mode)
2. **Observe:** Navigation bar shows Today Patients, Payment, Referrals, Surveys — remainder is clipped

**Expected:** User can scroll the nav bar horizontally to reach all module tabs.

**Fix:** Added `overflow-x: auto; -webkit-overflow-scrolling: touch;` to `.tabs`.

**Before screenshot:** [mobile-view.png](screenshots/mobile-view.png)
**After screenshot:** [mobile-after.png](screenshots/mobile-after.png)

---

### ISSUE-006: "Last updated by 12:56:22 PM" — wrong preposition (DEFERRED)

| Field | Value |
|-------|-------|
| **Severity** | low |
| **Category** | content / grammar |
| **Component** | `gstack-demo/src/App.jsx:110` |

**Description:** "Last updated **by** 12:56:22 PM" uses wrong preposition. Should be "Last updated **at**". Also the timestamp is static (hardcoded string), not dynamic.

**Deferred reason:** Low severity. Recommend fixing in a follow-up along with wiring to a real last-poll timestamp.

---

### ISSUE-007: Status dot is always green regardless of patient state (DEFERRED)

| Field | Value |
|-------|-------|
| **Severity** | low |
| **Category** | accessibility / visual |
| **Component** | `gstack-demo/src/styles.css` (`.status-dot`) |

**Description:** All patient rows show a green dot. There is no visual distinction between yet-to-be-seen, checked-in, or cancelled. No `aria-label` either.

**Deferred reason:** Low severity. Recommend mapping color + aria-label to `patient.status` in a follow-up.

---

## Regression Verification

All issues from the 2026-05-26 run remain fixed:

| Issue | Verification |
|-------|-------------|
| ISSUE-001 | CHECKED-IN shows 2 rows (Maria Lopez, John Smith) ✓ |
| ISSUE-002 | Total Copay = $195.00 ✓ |
| ISSUE-003 | Search "jane" → Jane Testpatient ✓ |
| ISSUE-004 | Patients Registered = 9 ✓ |
| ISSUE-005 | Header date = "Wed, May 27, 2026" (dynamic) ✓ |
| ISSUE-008 | Paid Copay = $65.00 ✓ |

## Fixes Applied

| Issue | Fix Status | Commit | Files Changed |
|-------|-----------|--------|---------------|
| ISSUE-009 | verified | d8ab1d0 | gstack-demo/src/App.jsx |
| ISSUE-010 | verified | c1e644d | gstack-demo/src/styles.css |
| ISSUE-006 | deferred | — | — |
| ISSUE-007 | deferred | — | — |

### Before / After Evidence

#### ISSUE-009
**Before:** clicking Payment → patient table still visible (6 yet-to-be-seen rows, sub-tabs visible).
**After:** clicking Payment → "Payment module — coming soon." message in content area.

#### ISSUE-010
**Before:** 375px viewport → nav bar clips at "Surveys", On Demand and YosiChat unreachable.
**After:** nav bar scrolls horizontally to expose all tabs.

---

## Ship Readiness

| Metric | Value |
|--------|-------|
| Health score | 96 → 99 (+3) |
| Issues found this run | 2 new (both medium) |
| Issues fixed | 2 (verified) |
| Deferred | 2 (both low severity, pre-existing) |

**PR Summary:** "QA found 2 new medium issues (nav stubs, mobile overflow), fixed both, health score 96 → 99."

**Recommended:** ship. Two deferred low-severity issues (wrong preposition, green-only status dots) can be filed as follow-up TODOs.
