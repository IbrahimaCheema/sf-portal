# Project Agent Rules

## Git Push Protocol
- **CRITICAL MANDATORY RULE**: NEVER execute `git push` or push changes to any remote Git repository (GitHub/GitLab/etc.) without explicit, unambiguous user instructions in the conversation (e.g., the user explicitly typing "push to git", "push to github", "run git push").
- You may build, format, test, and commit changes locally if requested, but **NEVER run `git push` autonomously**.
- Always wait for exclusive user instructions before running any git push operation.

## Greeting & Workspace Initialization Reminder
- Whenever a new workspace session starts, greet the user warmly and remind them they can start with:
  `Hi Antigravity! Please review CLONING_ARCHITECTURAL_BLUEPRINT.md and let's work on [Task/Page].`

## Mandatory Security Best Practices (Across the Board)
- **STRICT ZERO-HARDCODED-SECRETS POLICY**: NEVER hardcode API tokens, access keys, secret keys, passwords, private keys, database URIs, or account IDs directly in source code, scripts, configurations, or blueprints.
- **ALWAYS USE ENVIRONMENT VARIABLES**: Always consume sensitive keys via `process.env.VARIABLE_NAME` (or `import.meta.env`) and store local credentials strictly in `.env` files.
- **NEVER COMMIT CREDENTIALS**: Ensure `.env` and all `.env.*` credential files are explicitly ignored in `.gitignore` prior to adding or modifying environment settings.
- **DOCUMENTATION & TEMPLATE PLACEHOLDERS**: When creating templates, scripts, blueprints, or documentation, ALWAYS use generic placeholders (e.g., `YOUR_R2_ACCESS_KEY_ID`, `YOUR_API_SECRET`).
- **ACCIDENTAL DATA LOSS PREVENTION**: NEVER execute destructive database or storage commands (e.g., `DROP`, `TRUNCATE`, un-scoped `DELETE`, `rm -rf`, bucket purging) without explicit user confirmation.
- **SAFE LOGGING & PRIVACY**: Ensure logging output, error tracebacks, and client responses never expose credentials, authentication tokens, session data, or personal user data.
- **INPUT VALIDATION & SANITIZATION**: Always validate, sanitize, and escape external inputs to prevent injection vulnerabilities (SQL injection, XSS, Command injection, Path traversal).

## Feature Image Uncropped Display Rule
- **CRITICAL MANDATORY RULE FOR ALL POSTS**: Feature images for ALL posts must be full as-is and NEVER cropped. Always ensure image display styles use uncropped scaling (e.g. `object-fit: contain`) so full original image dimensions are preserved without clipping.
