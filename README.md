# GStack QA Demo — Yosi Health Dashboard

A complete end-to-end demo showing how **GStack** ([github.com/garrytan/gstack](https://github.com/garrytan/gstack)) — Garry Tan's Claude Code skill collection — autonomously tests, finds bugs, and fixes a React dashboard via the `/qa` slash command in Claude Code.

**Repo:** https://github.com/vaishnurajd-debug/Gstack-Demo

---

## Table of Contents

1. [What this project demonstrates](#1-what-this-project-demonstrates)
2. [Prerequisites](#2-prerequisites)
3. [Step-by-step setup (fresh machine)](#3-step-by-step-setup-fresh-machine)
4. [Running the dashboard](#4-running-the-dashboard)
5. [Running GStack `/qa`](#5-running-gstack-qa)
6. [GitHub workflow](#6-github-workflow)
7. [Troubleshooting (Windows gotchas)](#7-troubleshooting-windows-gotchas)
8. [File structure](#8-file-structure)
9. [Demo script](#9-demo-script)

---

## 1. What this project demonstrates

A small **Yosi Health-style patient dashboard** built with React + Vite. It has the same layout as the real product (tabs, patient table, stats sidebar) and runs at `http://localhost:3001`.

We use it to show what GStack does:

- You build a feature.
- You start the dashboard.
- In Claude Code, you type `/qa http://localhost:3001`.
- GStack launches a headless browser, explores the UI like a real user, finds bugs, fixes them in source code with **one atomic git commit per fix**, re-verifies, and writes a structured Markdown report under `.gstack/qa-reports/`.

Outcome: a documented audit trail of bugs found and bugs fixed, with health-score before/after.

---

## 2. Prerequisites

This demo was tested on **Windows 11**. It will also work on macOS and Linux with smaller adjustments.

### Required

| Tool | Version | Why | Install |
|---|---|---|---|
| **Node.js** | 18+ (tested with 21.6.2) | Runs the React + Vite dashboard | https://nodejs.org/ |
| **npm** | 9+ (ships with Node) | Installs dashboard deps and `bun` | bundled with Node |
| **Git** | 2.40+ (tested with 2.53) | Version control + GStack install | https://git-scm.com/download/win |
| **Claude Code** | Latest | The IDE/CLI that runs GStack skills | VS Code extension, or download from claude.ai/code |
| **Bun** | 1.3+ (tested with 1.3.14) | GStack's runtime | Installed in step 3.5 below |
| **A browser** | Chrome/Edge/Firefox | View the dashboard | already installed |
| **GitHub account** | — | Push the demo repo | https://github.com/signup |

### Optional but useful

| Tool | Why |
|---|---|
| **Windows Terminal** | Better PowerShell experience than the default console |
| **GitHub CLI (`gh`)** | Lets Claude Code create repos & PRs from the terminal |
| **VS Code** | Has the Claude Code extension built-in |

### Not strictly required

- WSL is **not** required. GStack works in native Windows under MSYS2/MinGW64 (which ships with Git for Windows).

---

## 3. Step-by-step setup (fresh machine)

This is the exact order I followed on a clean Windows install.

### 3.1 — Install Node.js

Download from https://nodejs.org and run the installer. Accept defaults. After install, open a **new** PowerShell window and verify:

```powershell
node --version   # should print v21.x.x
npm --version    # should print 10.x.x
```

### 3.2 — Install Git for Windows

Download from https://git-scm.com/download/win and run the installer. Accept defaults. Critical: the installer includes **Git Bash (MinGW64)** — GStack uses it under the hood.

Verify:
```powershell
git --version    # should print git version 2.x.x
```

Configure your identity once:
```powershell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

### 3.3 — Clone this demo repo

```powershell
cd C:\
git clone https://github.com/vaishnurajd-debug/Gstack-Demo.git gstack-qa-demo
cd gstack-qa-demo
```

You now have the dashboard source (`gstack-demo/`), the QA report template files (`Gstack/`), and the screenshot reference (`img/`).

### 3.4 — Install dashboard dependencies

```powershell
cd gstack-demo
npm install
cd ..
```

This pulls React, Vite, and dev deps. Takes ~15–30 seconds.

### 3.5 — Install Bun (GStack's runtime)

The easiest cross-platform path is npm:

```powershell
npm install -g bun
bun --version    # should print 1.3.x
```

> **Why not the official Bun PowerShell installer?** `irm bun.sh/install.ps1 | iex` failed during testing on Windows. The npm route worked first try.

### 3.6 — Relocate Bun's cache outside OneDrive

**Critical step on Windows.** Bun stores its package cache in `~/.bun/install/cache/` by default. If your user profile is OneDrive-synced (very common on Windows 11), OneDrive will lock files mid-install and bun will fail with:

```
error: moving "@babel/runtime" to cache dir failed
EPERM: Operation not permitted (NtSetInformationFile())
```

**Fix:** move the cache to a path OneDrive does not touch.

```powershell
mkdir C:\bun-cache
# Add this to your PowerShell profile so it's permanent:
notepad $PROFILE
```

Paste this line into the profile and save:
```powershell
$env:BUN_INSTALL_CACHE_DIR = "C:\bun-cache"
```

Open a fresh PowerShell so the variable loads.

### 3.7 — Install GStack

GStack lives at `~/.claude/skills/gstack/`, which on Windows resolves to `C:\Users\YourName\.claude\skills\gstack\`.

Open **Git Bash** (right-click in any folder → "Open Git Bash here", or run `bash` from PowerShell if it's on PATH):

```bash
mkdir -p ~/.claude/skills
cd ~/.claude/skills
git clone https://github.com/garrytan/gstack.git
cd gstack
./setup
```

The `./setup` script:
- Verifies `bun` is on PATH
- Detects Windows (MSYS/MinGW) and switches from symlinks to file copies
- Runs `bun install` for the embedded `browse` headless-Chrome package
- Compiles `browse.exe` (~98 MB binary)
- Links 53 skills (`/qa`, `/qa-only`, `/review`, `/ship`, `/investigate`, etc.)

When you see `gstack ready (claude).` — install succeeded.

Verify:
```bash
~/.claude/skills/gstack/browse/dist/browse.exe status
# Status: healthy
# Mode: launched

cat ~/.claude/skills/gstack/VERSION
# 1.45.0.0
```

### 3.8 — Restart Claude Code

Close any open Claude Code conversations and reopen. The new session will scan `~/.claude/skills/` at startup and register the 53 GStack skills. Until you do this, `/qa` will not be recognized in chat.

---

## 4. Running the dashboard

```powershell
cd C:\gstack-qa-demo\gstack-demo
npm run dev
```

You'll see:
```
  VITE v5.x.x  ready in 300 ms

  ➜  Local:   http://localhost:3001/
```

Vite auto-opens your default browser to http://localhost:3001 (the `--open` flag is in `package.json`).

> **Why port 3001 and not 3000?** On many Windows machines, Docker Desktop or another service holds port 3000. We use 3001 to sidestep this. If 3001 is also busy on your machine, edit `gstack-demo/vite.config.js` and pick another port.

**Stop the server:** `Ctrl+C` in the terminal where it's running.

---

## 5. Running GStack `/qa`

In Claude Code (a **fresh conversation** that loaded the gstack skills at startup):

```
/qa http://localhost:3001
```

### What `/qa` does, phase by phase

| Phase | What you'll see |
|---|---|
| **Setup** | Preamble output: BRANCH, REPO_MODE, ARTIFACTS_SYNC, learnings count, telemetry state. Asks once per project about telemetry and skill-routing rules. |
| **Clean-tree check** | If you have uncommitted changes, `/qa` asks: Commit / Stash / Abort. Pick A (Commit) most of the time. |
| **Test-framework bootstrap** | If your project has no test framework, `/qa` offers to install one (vitest + @testing-library/react for a Vite app). Decline with `.gstack/no-test-bootstrap` if you don't want this yet. |
| **Phase 1–6: Baseline QA** | `browse.exe` launches headless Chrome → visits `http://localhost:3001` → takes annotated screenshots → reads the accessibility tree → clicks every tab → fills every form field → checks the console for errors. Saves to `.gstack/qa-reports/screenshots/`. |
| **Phase 7: Triage** | Sorts issues by severity. **Standard tier** (the default) fixes critical + high + medium. **Quick tier** (`--quick`) fixes critical + high only. **Exhaustive** fixes everything including cosmetic. |
| **Phase 8: Fix loop** | For each fixable issue: greps for source, makes the minimal edit, commits with `fix(qa): ISSUE-NNN — short description`, reloads the page, re-screenshots, verifies. |
| **Phase 9: Re-test** | Re-runs QA on affected pages. Computes final health score. |
| **Phase 10: Report** | Writes `.gstack/qa-reports/qa-report-{domain}-{YYYY-MM-DD}.md`. Includes severity breakdown, per-issue before/after screenshots, commit SHAs, health-score delta. |

### What `/qa` does **not** do automatically

- It does **not** push to GitHub. Pushing is a separate action — see [Section 6](#6-github-workflow).
- It does **not** modify CI configuration.
- It does **not** bundle multiple fixes into one commit.
- It stops itself if "WTF-likelihood" exceeds 20% (more than 3 reverts, fixes touching >3 files, etc.) and asks you whether to keep going. This is the "ask permission before making a mess" gate.

### Report-only mode

If you want to find bugs but **not** auto-fix:

```
/qa-only http://localhost:3001
```

Produces the same report but never edits source files or commits.

---

## 6. GitHub workflow

### 6.1 — Initial setup (one-time)

If this is a brand-new local checkout and you want your own GitHub repo:

```powershell
cd C:\gstack-qa-demo
git init -b main
git add .
git commit -m "initial commit"
```

Create an empty repo on GitHub.com (no README, no .gitignore — keep it empty). Then:

```powershell
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

The first push opens **Git Credential Manager** in your browser — sign in with the GitHub account that owns the repo.

### 6.2 — After `/qa` finishes

`/qa` left atomic fix commits in your local repo. To send them to GitHub:

```powershell
git log --oneline    # see what /qa committed
git push             # send to GitHub
```

That's it. No special GStack push command needed.

### 6.3 — Using GStack `/ship` for a polished PR flow

Instead of `git push`, you can run:

```
/ship
```

in Claude Code. `/ship` will:

1. Detect your base branch (`main`/`master`)
2. Run your project's tests (if a test framework is installed)
3. Show you the diff and **ask permission** before pushing
4. Push to your branch
5. Open a Pull Request via `gh` CLI (if installed) with an auto-generated summary

This is the gate where GStack waits for your "yes" before publishing changes.

### 6.4 — If push fails with "Permission denied"

Git's credential cache may be holding an old token for a different GitHub account. Fix:

```powershell
cmdkey /list | findstr github
cmdkey /delete:"LegacyGeneric:target=git:https://github.com"
git push    # this re-prompts in the browser
```

---

## 7. Troubleshooting (Windows gotchas)

### 7.1 — `bun install` fails with `EPERM NtSetInformationFile`

**Cause:** OneDrive or Windows Defender locks files in the bun cache directory.

**Fix 1 (recommended):** Move the cache outside OneDrive (see step 3.6 above).

**Fix 2:** Add Windows Defender exclusion for `C:\Users\YourName\.bun` and `C:\Users\YourName\.claude\skills\gstack`. Requires admin (UAC prompt).

```powershell
# Run an elevated PowerShell window first
Add-MpPreference -ExclusionPath "C:\Users\YourName\.bun","C:\Users\YourName\.claude\skills\gstack"
```

### 7.2 — `python` / `pip` not found

You don't need them. This project is pure Node/React.

### 7.3 — Port 3000 is busy

Docker Desktop on Windows often binds port 3000. Either stop Docker temporarily or use 3001 (already configured in `gstack-demo/vite.config.js`).

```powershell
# See who owns the port:
netstat -ano | findstr ":3000 "
```

### 7.4 — `/qa` does not exist in Claude Code chat

You need to **restart Claude Code** after running `./setup`. Skills are loaded at session start, not on the fly.

### 7.5 — `gh` CLI not installed (only relevant for `/ship`)

Install via:
```powershell
winget install GitHub.cli
gh auth login
```

If `winget` is also missing, download from https://cli.github.com/.

### 7.6 — Bash not available

Git Bash ships with Git for Windows. If running `bash` from PowerShell errors out, you may need to add `C:\Program Files\Git\bin` to your PATH, or use the "Git Bash" Start menu shortcut directly.

### 7.7 — Vite shows "Port 3001 is already in use"

Something is running on 3001. Either:
- Stop the existing process: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001 -State Listen).OwningProcess -Force`
- Or change the port in `gstack-demo/vite.config.js`

---

## 8. File structure

```
gstack-qa-demo/
├── README.md                              # this file
├── .gitignore
├── .gstack/
│   └── qa-reports/                        # generated by /qa runs
│       ├── qa-report-localhost-2026-05-26.md
│       └── screenshots/
├── Gstack/                                # gstack QA reference docs (snapshot)
│   ├── SKILL.md                           # the /qa skill instructions
│   ├── SKILL.md.tmpl
│   ├── issue-taxonomy.md                  # severity + category definitions
│   ├── qa-report-template.md
│   └── llms.txt
├── gstack-demo/                           # the React dashboard module
│   ├── package.json
│   ├── vite.config.js                     # port 3001
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx                        # all dashboard logic
│   │   ├── data.js                        # mocked patient data
│   │   └── styles.css
│   └── node_modules/                      # not committed
├── img/
│   └── Screenshot 2026-05-26 150934.png   # original Yosi Health screenshot
└── .git/

# Installed elsewhere on the machine (NOT in this repo):
C:\Users\YourName\.claude\skills\gstack\   # GStack itself (53 skills + browse.exe)
C:\bun-cache\                              # bun package cache (relocated)
```

---

## 9. Demo script

A 5-minute walkthrough you can give to your team.

### Slide 1 — "Here's the dashboard"
Open http://localhost:3001 in Chrome. Walk through tabs and the stats sidebar. Mention it's a React + Vite module, 4 files in `src/`.

### Slide 2 — "Here's the bug we're going to find"
Plant one bug live in front of the audience. Example: in `gstack-demo/src/App.jsx`, change `p.payment === 'paid'` to `p.payment === 'PAID'`. Save. The Paid Copay stat flips to `$0.00` in the browser via Vite HMR.

Commit it with an innocent message:
```powershell
git add gstack-demo/src/App.jsx
git commit -m "refactor: tighten paid copay matcher"
```

### Slide 3 — "Now we run GStack"
Open Claude Code in a fresh conversation. Type:
```
/qa http://localhost:3001
```

Audience watches GStack:
- Launch `browse.exe` (headless Chrome)
- Navigate to localhost:3001
- Take a screenshot
- Click each sub-tab
- Spot that Paid Copay shows `$0.00` against the data
- File ISSUE-001 with severity `high`
- Grep `paidCopay`, open App.jsx, change `'PAID'` back to `'paid'`
- Atomic commit `fix(qa): ISSUE-001 — paid copay filter matches lowercase 'paid'`
- Reload the page, re-screenshot, verify Paid Copay is now `$65.00`
- Write the report

### Slide 4 — "Here's the audit trail"
```powershell
git log --oneline
```
Show the fix commit sitting on top of the planted bug commit.

```powershell
cat .gstack/qa-reports/qa-report-localhost-2026-05-26.md
```
Show the structured report with before/after, severity, health score delta.

### Slide 5 — "Push to GitHub"
```powershell
git push
```
Show the commit appearing on GitHub.

### Slide 6 — "Re-run /qa to confirm zero bugs"
```
/qa http://localhost:3001
```
Output: `0 issues found, health score 100/100. DONE.`

---

## Credits

- **GStack** — https://github.com/garrytan/gstack
- **Claude Code** — https://claude.ai/code
- **Yosi Health** — the real product whose dashboard this demo mimics

---

## License

This demo is for internal / educational use. GStack itself is licensed by its author at the link above.
