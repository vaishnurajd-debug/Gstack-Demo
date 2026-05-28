# QA Report: Yosi Health Dashboard (gstack-qa-demo)

| Field | Value |
|-------|-------|
| **Date** | 2026-05-27 |
| **URL** | http://localhost:3001 |
| **Branch** | main |
| **Commit (baseline)** | b0c7b15 (2026-05-27) |
| **Commit (final)** | b0c7b15 (2026-05-27) |
| **PR** | — |
| **Tier** | Standard |
| **Scope** | Full app (dashboard module) |
| **Duration** | ~10 min |
| **Pages visited** | 1 (single-page dashboard, all tabs) |
| **Screenshots** | 10 |
| **Framework** | React 18 + Vite 5 |
| **Index** | [All QA runs](./index.md) |

## Health Score: 99/100 (baseline) → 98/100 (this run)

| Category | Baseline | This Run | Delta |
|----------|--------:|--------:|------:|
| Console | 100 | 100 | 0 |
| Links | 100 | 100 | 0 |
| Visual | 97 | 97 | 0 |
| Functional | 100 | 100 | 0 |
| UX | 97 | 97 | 0 |
| Performance | 100 | 100 | 0 |
| Content | 97 | 94 | **-3** |
| Accessibility | 97 | 97 | 0 |
| **Overall** | **99** | **98** | **-1** |

## Top 3 Things to Fix

1. **ISSUE-011: "Coming soon" module names are wrong for YosiChat and On Demand** — placeholder text reads "Chat module — coming soon." and "Ondemand module — coming soon." instead of using the actual tab display names. Low severity, deferred.
2. **ISSUE-006: "Last updated by 12:56:22 PM" — wrong preposition + static timestamp** (carry-forward, deferred).
3. **ISSUE-007: Status dot always green regardless of patient state** (carry-forward, deferred).

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
| Medium | 0 |
| Low | 1 new (deferred) + 2 carry-forward (deferred) |
| **Total new** | **1 new, 2 carry-forward** |

---

## Issues

### ISSUE-011: "Coming soon" placeholder uses wrong module names — DEFERRED

| Field | Value |
|-------|-------|
| **Severity** | low |
| **Category** | content / cosmetic |
| **URL** | http://localhost:3001 |
| **Component** | `gstack-demo/src/App.jsx:97` |

**Description:** The "coming soon" placeholder for non-today tabs derives the module name from the raw `activeTab` key using `activeTab.charAt(0).toUpperCase() + activeTab.slice(1)`. Two tabs produce wrong display names:
- `chat` key → "Chat module — coming soon." (should be "YosiChat module — coming soon.")
- `ondemand` key → "Ondemand module — coming soon." (should be "On Demand module — coming soon.")

All other tabs (Payment, Referrals, Surveys, Users, Reports) happen to match because their keys already match the display name.

**Repro Steps:**
1. Navigate to http://localhost:3001
2. Click the **YosiChat** tab
3. **Observe:** Placeholder reads "Chat module — coming soon."
4. Click the **On Demand** tab
5. **Observe:** Placeholder reads "Ondemand module — coming soon."

**Expected:** "YosiChat module — coming soon." and "On Demand module — coming soon."

**Fix suggestion:** Use a label map for the coming-soon placeholder instead of deriving from the key.

**Screenshot:** [nav-yosichat2.png](screenshots/nav-yosichat2.png)

**Deferred reason:** Low severity / cosmetic. Recommend fixing in a follow-up.

---

### ISSUE-006: "Last updated by 12:56:22 PM" — wrong preposition (DEFERRED, carry-forward)

| Field | Value |
|-------|-------|
| **Severity** | low |
| **Category** | content / grammar |
| **Component** | `gstack-demo/src/App.jsx:115` |

**Description:** "Last updated **by** 12:56:22 PM" uses wrong preposition. Should be "Last updated **at**". Timestamp is also hardcoded, not dynamic.

**Deferred reason:** Low severity. Fix together with wiring a real poll timestamp.

---

### ISSUE-007: Status dot is always green regardless of patient state (DEFERRED, carry-forward)

| Field | Value |
|-------|-------|
| **Severity** | low |
| **Category** | accessibility / visual |
| **Component** | `gstack-demo/src/styles.css` (`.status-dot`) |

**Description:** All patient rows show a green dot. No visual distinction between yet-to-be-seen, checked-in, or cancelled. No `aria-label`.

**Deferred reason:** Low severity. Recommend mapping color + aria-label to `patient.status`.

---

## Regression Verification

All issues from the 2026-05-26 and earlier runs remain fixed:

| Issue | Verification |
|-------|-------------|
| ISSUE-001 | CHECKED-IN shows 2 rows (Maria Lopez, John Smith) ✓ |
| ISSUE-002 | Total Copay = $195.00 ✓ |
| ISSUE-003 | Search "jane" → Jane Testpatient ✓; "JANE" → Jane Testpatient ✓ |
| ISSUE-004 | Patients Registered = 9 ✓ |
| ISSUE-005 | Header date = "Wed, May 27, 2026" (dynamic) ✓ |
| ISSUE-008 | Paid Copay = $65.00 ✓ |
| ISSUE-009 | Non-today tabs show "coming soon" placeholder (not patient table) ✓ |
| ISSUE-010 | Mobile 375px: nav tab bar scrolls horizontally ✓ |

## Fixes Applied

None — all new issues are low severity, deferred per Standard tier rules.

---

## Ship Readiness

| Metric | Value |
|--------|-------|
| Health score | 99 → 98 (-1) |
| Issues found this run | 1 new (low, deferred) |
| Issues fixed | 0 |
| Deferred | 3 total (1 new + 2 carry-forward, all low severity) |

**PR Summary:** "QA run clean — 1 new low-severity issue found (wrong module names in coming-soon placeholders), no fixes needed. Health score 99 → 98."

**Recommended:** ship. No blocking issues. Three deferred low-severity items can be filed as follow-up TODOs.
