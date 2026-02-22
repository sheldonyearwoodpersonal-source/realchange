# Contributing to Real Change

First off, thank you for considering contributing to Real Change! It's people like you that make Real Change a great tool for civic engagement.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to fostering an open and welcoming environment. We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g. macOS, Windows, Linux]
 - Browser: [e.g. Chrome, Safari, Firefox]
 - Version: [e.g. 22]

**Additional context**
Any other context about the problem.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

**Feature Request Template:**

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Any alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots.
```

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - Good for newcomers
- `help wanted` - Need community help
- `documentation` - Documentation improvements

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git
- Supabase account
- Required API keys (Gemini, Groq, Pexels)

### Setup Development Environment

1. **Fork the repository**
   - Click "Fork" on GitHub
   - Clone your fork locally

```bash
git clone https://github.com/YOUR_USERNAME/real-change.git
cd real-change
```

2. **Add upstream remote**

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/real-change.git
```

3. **Install dependencies**

```bash
npm install
```

4. **Set up environment variables**

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

5. **Run the development server**

```bash
npm run dev
```

## Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Development branch (if applicable)
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Urgent production fixes

### Creating a Feature Branch

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in your feature branch
2. Test your changes thoroughly
3. Ensure code follows our coding standards
4. Update documentation if needed

### Keeping Your Branch Updated

```bash
git checkout main
git pull upstream main
git checkout feature/your-feature-name
git rebase main
```

## Coding Standards

### TypeScript Guidelines

- Use TypeScript for all new files
- Avoid `any` types - use proper typing
- Use interfaces for object shapes
- Export types that might be reused

**Good:**
```typescript
interface User {
  id: string;
  email: string;
  full_name: string;
}

function getUser(id: string): Promise<User> {
  // implementation
}
```

**Bad:**
```typescript
function getUser(id: any): any {
  // implementation
}
```

### React Component Guidelines

- Use functional components with hooks
- Add `'use client'` directive when using client-side hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks

**Good:**
```typescript
'use client';

import { useState } from 'react';

interface PetitionCardProps {
  title: string;
  signatures: number;
}

export function PetitionCard({ title, signatures }: PetitionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    // component JSX
  );
}
```

### File Organization

- One component per file
- Group related files in directories
- Use index files for clean imports
- Keep files under 300 lines when possible

```
components/
├── petition/
│   ├── PetitionCard.tsx
│   ├── PetitionList.tsx
│   ├── PetitionForm.tsx
│   └── index.ts
```

### Naming Conventions

- **Components**: PascalCase (`PetitionCard.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_SIGNATURES`)
- **CSS classes**: kebab-case or Tailwind classes

### Styling Guidelines

- Use Tailwind CSS classes
- Use shadcn/ui components when available
- Follow existing color scheme (blue/white)
- Ensure responsive design (mobile-first)
- Maintain accessibility standards

### Database Guidelines

- Always use migrations for schema changes
- Never skip RLS policies
- Test policies thoroughly
- Use meaningful table and column names
- Add indexes for frequently queried columns

**Migration Template:**
```sql
/*
  # Migration Title

  1. Changes
    - Description of changes

  2. Security
    - RLS policies added
*/

-- Your migration SQL here
```

### API Route Guidelines

- Handle errors gracefully
- Validate input data
- Return appropriate HTTP status codes
- Use TypeScript for type safety
- Document expected request/response formats

**Example:**
```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.issue || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process request
    const result = await processRequest(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Commit Guidelines

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(petition): add goal tracking to petitions

Add the ability to set and track signature goals for petitions.
Users can now set a target number of signatures.

Closes #123
```

```bash
fix(auth): resolve Google OAuth redirect issue

Fixed redirect URL configuration that was causing OAuth
failures in production environment.

Fixes #456
```

```bash
docs(readme): update deployment instructions

Updated Netlify deployment steps to reflect new
environment variable requirements.
```

## Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Self-review of code completed
- [ ] Comments added to complex code
- [ ] Documentation updated
- [ ] Changes tested locally
- [ ] No console errors or warnings
- [ ] Build completes successfully

### Submitting a Pull Request

1. **Update your branch**
```bash
git checkout main
git pull upstream main
git checkout feature/your-feature
git rebase main
```

2. **Push to your fork**
```bash
git push origin feature/your-feature
```

3. **Create Pull Request**
- Go to your fork on GitHub
- Click "Pull Request"
- Select your feature branch
- Fill out the PR template

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added to complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
```

### Review Process

- Maintainers will review your PR
- Address feedback and requested changes
- Keep discussion professional and constructive
- Once approved, a maintainer will merge your PR

## Testing

### Manual Testing

Test your changes across:

- Different browsers (Chrome, Firefox, Safari)
- Different screen sizes (mobile, tablet, desktop)
- Different user states (logged in, logged out)
- Edge cases and error scenarios

### Testing Checklist

- [ ] Authentication flows work
- [ ] Forms validate properly
- [ ] Error messages display correctly
- [ ] Loading states appear
- [ ] Responsive design works
- [ ] Navigation functions properly
- [ ] Database operations succeed
- [ ] API calls handle errors

## Documentation

### Code Comments

- Comment complex logic
- Explain "why" not "what"
- Keep comments up to date
- Use JSDoc for functions

```typescript
/**
 * Matches user issues with relevant organizations using AI
 * @param issue - Description of the civic issue
 * @param location - Geographic location of the issue
 * @returns Array of matched organizations with relevance scores
 */
async function matchOrganizations(issue: string, location: string) {
  // implementation
}
```

### Documentation Files

Update relevant documentation:

- `README.md` - Project overview and setup
- `DEPLOYMENT.md` - Deployment instructions
- `API.md` - API documentation
- `ARCHITECTURE.md` - System architecture

## Questions?

- Open an issue with the `question` label
- Reach out to maintainers
- Check existing documentation

## Recognition

Contributors will be:

- Listed in the README
- Credited in release notes
- Appreciated in the community

Thank you for contributing to Real Change and helping create tools for civic engagement!
