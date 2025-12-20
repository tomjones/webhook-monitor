# Project Instructions for Claude

## Git Commit Conventions

Always use **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, missing semi-colons, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks, dependency updates

**Examples:**
```
feat(webhook): add multi-client support with client prefix URL pattern
fix(auth): resolve session timeout issue
docs(readme): update deployment instructions
chore(deps): upgrade express to 4.21.2
```

**Scope** should reference the area of change:
- `webhook` - Webhook handling
- `auth` - Authentication
- `api` - API routes
- `ui` - Dashboard/frontend
- `db` - Database changes
- `deps` - Dependencies

## Code Style

- Use single quotes for strings in JavaScript
- 2-space indentation
- Semicolons required
- Async/await preferred over promises
- Meaningful variable names (no single letters except loop counters)

## Architecture Patterns

- Keep routes thin, business logic in separate modules
- Database functions in `server/db.js`
- Utility functions in `server/utils/`
- Middleware in `server/middleware/`

## Testing

- Test all webhook endpoints with curl examples
- Test both success and failure cases
- Verify database queries work with PostgreSQL (not just SQLite)

## Documentation

- Update README.md when adding new environment variables
- Add inline comments for complex logic only (prefer self-documenting code)

## Deployment

- Always consider Heroku limitations (30s timeout, ephemeral filesystem)
- Test that changes work with DATABASE_URL from environment
- Document required config vars in README
