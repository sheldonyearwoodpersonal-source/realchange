# Setting Up Your GitHub Repository

This guide will help you push your Real Change project to GitHub and set it up for collaboration.

## Step 1: Initialize Git (If Not Already Done)

```bash
cd /path/to/real-change
git init
```

## Step 2: Create GitHub Repository

### Option A: Via GitHub Website

1. Go to [github.com](https://github.com)
2. Click the "+" icon → "New repository"
3. Fill in:
   - Repository name: `real-change`
   - Description: "A platform for civic engagement through AI-powered petitions and organization matching"
   - Visibility: Public (or Private if preferred)
   - **Do NOT** initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

### Option B: Via GitHub CLI

```bash
# Install GitHub CLI if you haven't
# macOS: brew install gh
# Windows: winget install --id GitHub.cli

gh auth login
gh repo create real-change --public --description "A platform for civic engagement"
```

## Step 3: Add Remote and Push

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/real-change.git

# Stage all files
git add .

# Create initial commit
git commit -m "Initial commit: Real Change platform with AI-powered petitions and organization matching"

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Configure Repository Settings

### Add Repository Description

1. Go to your repository on GitHub
2. Click the gear icon next to "About"
3. Add:
   - **Description:** "Empower citizens to create change through AI-powered petition creation and organization matching"
   - **Website:** (your deployment URL when ready)
   - **Topics:** `nextjs`, `typescript`, `supabase`, `civic-tech`, `petition`, `ai`, `tailwindcss`

### Add Repository Details

Go to **Settings** and configure:

#### General Settings

- [ ] Enable **Issues** for bug tracking
- [ ] Enable **Discussions** for community conversations
- [ ] Enable **Projects** for project management
- [ ] Disable **Wikis** (we use markdown docs)
- [ ] Enable **Preserve this repository** (archive important work)

#### Branch Protection (Recommended)

1. Go to **Settings** → **Branches**
2. Add branch protection rule for `main`:
   - [x] Require pull request reviews before merging
   - [x] Require status checks to pass before merging
   - [x] Require conversation resolution before merging
   - [x] Include administrators

#### GitHub Actions

Secrets needed for CI/CD:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add repository secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `GROQ_API_KEY`
   - `PEXELS_API_KEY`

## Step 5: Create Essential Labels

Add labels for issue management:

```bash
# Via GitHub CLI
gh label create "bug" --color d73a4a --description "Something isn't working"
gh label create "enhancement" --color a2eeef --description "New feature or request"
gh label create "documentation" --color 0075ca --description "Improvements to documentation"
gh label create "good first issue" --color 7057ff --description "Good for newcomers"
gh label create "help wanted" --color 008672 --description "Extra attention is needed"
gh label create "question" --color d876e3 --description "Further information is requested"
gh label create "wontfix" --color ffffff --description "This will not be worked on"
```

Or create them manually via GitHub UI: **Issues** → **Labels** → **New label**

## Step 6: Set Up GitHub Pages (Optional)

If you want to host documentation:

1. Go to **Settings** → **Pages**
2. Source: Deploy from a branch
3. Branch: `main` → `/docs` (if you create a docs folder)
4. Save

## Step 7: Configure Social Preview

1. Create a repository social preview image (1280x640px)
2. Go to **Settings**
3. Scroll to "Social preview"
4. Upload your image

## Step 8: Add Community Files

The following files are already in your repository:

- ✅ `README.md` - Project overview and documentation
- ✅ `LICENSE` - MIT License
- ✅ `CONTRIBUTING.md` - Contribution guidelines
- ✅ `CHANGELOG.md` - Version history
- ✅ `.gitignore` - Files to ignore

Consider adding:

### Issue Templates

Create `.github/ISSUE_TEMPLATE/`:

**bug_report.md:**
```markdown
---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment:**
 - OS: [e.g. macOS]
 - Browser: [e.g. chrome]
 - Version: [e.g. 22]
```

**feature_request.md:**
```markdown
---
name: Feature request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Additional context**
Add any other context about the feature request here.
```

### Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] All tests pass
- [ ] No console errors

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

## Step 9: Set Up Deployment Integration

### Netlify

1. Go to [netlify.com](https://netlify.com)
2. **Add new site** → **Import an existing project**
3. Connect your GitHub repository
4. Configure build settings (already in `netlify.toml`)
5. Add environment variables
6. Deploy!

### Vercel

1. Go to [vercel.com](https://vercel.com)
2. **Import Project**
3. Select your GitHub repository
4. Configure environment variables
5. Deploy!

## Step 10: Add Badges to README

Add these badges to the top of your `README.md`:

```markdown
![Build Status](https://github.com/USERNAME/real-change/workflows/CI/badge.svg)
![License](https://img.shields.io/github/license/USERNAME/real-change)
![Issues](https://img.shields.io/github/issues/USERNAME/real-change)
![Stars](https://img.shields.io/github/stars/USERNAME/real-change)
[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-BADGE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE/deploys)
```

## Repository Best Practices

### Commit Message Conventions

Use conventional commits:

```bash
feat: add Google OAuth integration
fix: resolve petition signature duplication
docs: update deployment guide
style: format code with prettier
refactor: reorganize component structure
test: add petition creation tests
chore: update dependencies
```

### Branch Naming

```bash
feature/add-google-auth
bugfix/fix-signature-count
hotfix/critical-security-patch
docs/update-readme
```

### Regular Maintenance

- Weekly: Review and respond to issues
- Bi-weekly: Merge dependabot PRs
- Monthly: Update dependencies
- Quarterly: Review and update documentation

## Collaboration Setup

### For Team Projects

1. **Add Collaborators:**
   - Settings → Collaborators → Add people

2. **Set Up Teams:**
   - If using GitHub organization
   - Create teams with different permissions

3. **Enable Discussions:**
   - Settings → Features → Discussions
   - Create categories for Q&A, Ideas, etc.

4. **Project Boards:**
   - Projects → New project
   - Set up columns: To Do, In Progress, Done
   - Link to issues and PRs

## Security Setup

### Enable Security Features

1. **Dependabot:**
   - Settings → Security & analysis
   - Enable Dependabot alerts
   - Enable Dependabot security updates

2. **Code Scanning:**
   - Security → Code scanning alerts
   - Set up CodeQL analysis

3. **Secret Scanning:**
   - Enabled by default for public repos
   - Alerts you if secrets are committed

### Security Policy

Create `SECURITY.md`:

```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

Please report security vulnerabilities to: security@yourdomain.com

Do not open public issues for security vulnerabilities.
```

## Promoting Your Project

1. **Add Topics:**
   - civic-tech, petition, activism, nextjs, typescript, ai

2. **Share:**
   - Twitter/X
   - LinkedIn
   - Reddit (r/civictech, r/opensource)
   - Dev.to
   - Hacker News (Show HN)

3. **List on:**
   - [Awesome Next.js](https://github.com/unicodeveloper/awesome-nextjs)
   - [Awesome Supabase](https://github.com/lyqht/awesome-supabase)
   - Product Hunt
   - Indie Hackers

## Monitoring

### GitHub Insights

Check regularly:
- Traffic: Page views, unique visitors
- Commits: Activity over time
- Community: Contributors, forks, stars
- Network: Forks and dependencies

### Analytics (Optional)

Consider adding:
- Google Analytics
- Plausible Analytics
- Vercel Analytics
- Netlify Analytics

## Congratulations!

Your Real Change repository is now professionally set up on GitHub! You're ready to collaborate, deploy, and make an impact.

## Quick Reference

```bash
# Daily workflow
git checkout main
git pull origin main
git checkout -b feature/my-feature
# ... make changes ...
git add .
git commit -m "feat: add amazing feature"
git push origin feature/my-feature
# Create PR on GitHub

# Keep fork updated (for contributors)
git remote add upstream https://github.com/ORIGINAL/real-change.git
git fetch upstream
git checkout main
git merge upstream/main
```

---

Need help? Check the [Contributing Guide](./CONTRIBUTING.md) or open an issue!
