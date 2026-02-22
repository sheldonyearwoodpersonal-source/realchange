# Real Change - GitHub Setup Guide

This guide walks you through setting up the Real Change project from GitHub.

## Prerequisites

Before you begin, you'll need to install:

1. **Node.js** - Download from [https://nodejs.org/en/download](https://nodejs.org/en/download)
2. **Git** - Download from [https://git-scm.com/install/windows](https://git-scm.com/install/windows)

## Setup Instructions

Open PowerShell and run the following commands:

```powershell
mkdir C:\dev -Force
cd C:\dev
git clone https://github.com/sheldonyearwoodpersonal-source/realchange.git
cd realchange
npm install
Copy-Item .env.example .env.local
notepad .env.local
```

## Configure Environment Variables

When Notepad opens, insert your API keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI API Keys
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Image Service
PEXELS_API_KEY=your_pexels_api_key_here
```

Save the file and close Notepad.

## Run the Application

Start the development server:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**To stop the server**: Press `Ctrl+C` in PowerShell

## Getting API Keys

If you need to obtain API keys:

- **Supabase**: Create account at [supabase.com](https://supabase.com), create a project, and get keys from Project Settings > API
- **Gemini**: Get a free key at [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Groq**: Sign up at [Groq Console](https://console.groq.com)
- **Pexels**: Get a free key at [Pexels API](https://www.pexels.com/api/)

## What is Real Change?

Real Change is a civic engagement platform that empowers citizens to create meaningful change by:

- Matching local issues with organizations that have the authority to help
- Generating well-structured petitions using AI
- Collecting digital signatures and tracking petition progress
- Organizing community events

## Features

- AI-powered organization matching using Groq
- Smart petition generator using Google Gemini
- Digital signature collection
- Progress updates and timeline
- Community events
- Social sharing

## Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **AI**: Google Gemini & Groq APIs
- **Images**: Pexels API

## Troubleshooting

### "Error: supabaseUrl is required"

If you see this error:
1. Make sure you created `.env.local` file (not just `.env`)
2. Verify the file contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Stop the dev server (`Ctrl+C`) and restart it (`npm run dev`)

### Port Already in Use

If port 3000 is already in use:
1. Stop the server using that port
2. Or run on a different port: `npm run dev -- -p 3001`

### Build Errors

If you get build errors:
1. Delete the `.next` folder
2. Run `npm install` again
3. Restart the dev server

## Support

For issues or questions:
- Check the main [README.md](README.md) for detailed documentation
- Review the [SETUP.md](SETUP.md) for more information
- Open an issue on GitHub

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Additional Configuration

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
