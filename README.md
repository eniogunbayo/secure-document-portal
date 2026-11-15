# Pouch ♡

A home for your files. Built by Eni Ogunbayo as a functional cybersecurity portfolio project.

## What you can do

- Create an account and return to your persistent personal file workspace.
- Upload multiple files or drag and drop; search and sort your files.
- Download, rename, and permanently delete your own files.
- Generate sharing links that expire after 1 hour, 24 hours, or 7 days.
- Review sharing links and revoke future downloads.
- Open a sharing link without creating an account.

## Start here

For the existing portal, follow **[Pouch setup](docs/POUCH_SETUP.md)**. Keep existing accounts and files. Run only the upgrade SQL after the original setup. For a brand-new dedicated backend, run `supabase/setup.sql` first and `supabase/pouch-upgrade.sql` second.

```sh
npm ci
cp .env.example .env
# Fill in only your project URL and public publishable key.
npm run dev
```

Frontend build: `npm run build` → `dist`. Production host: Cloudflare Pages with Git integration. The root `functions/` directory supplies the sharing server independently of Vite. Do not move it into `src` or `dist`.

## Architecture

Browser → Supabase Auth/Storage with authenticated owner-folder RLS for file operations. Sharing creation and revocation use an owner-restricted Postgres table. A recipient opens `/#share=<random token>` and requests `/api/shared`. The Pages Function hashes the token, checks the sharing row, then retrieves and streams only the authorized object using a server-only credential. Raw tokens are not stored in the sharing table. Each new link has 256 bits of random entropy. Token-bearing download requests may still appear in infrastructure request logs; do not log them or expose logs publicly.

## Security boundaries

- Private storage; file ownership enforced by backend RLS, not interface filtering.
- Owner-only file update/delete; shared recipients receive download access only.
- Owners cannot choose another owner's path when creating a link. Only `revoked_at` is updatable in sharing records, and revoked links cannot be reactivated.
- Sharing checks every new request; no public bucket or reusable signed storage URLs.
- Link files are streamed as attachments with `no-store` and `nosniff` headers.
- Dynamic filenames rendered as text; no third-party fonts, analytics, or scripts.
- CSP and browser restrictions applied by Cloudflare Pages headers; function replies set their own headers.
- Persistent browser sessions improve usability but make XSS prevention and shared-device sign-out important.

## Limits

5 MB per file. Supported: PDF, TXT, PNG, JPG, WEBP, DOCX, XLSX, PPTX, CSV, ZIP. Type restrictions check declared MIME values and client extensions, not actual file contents or malware. Total storage follows your backend plan; the displayed usage is the user's stored bytes, not a quota gauge. Pouch sharing links are bearer credentials and can be forwarded. Revocation cannot recall downloaded or in-progress content. Rename revokes existing links rather than preserving them. File changes and share revocation are separate calls: revocation runs first, so a later failed rename/delete can leave the file intact with its links already revoked. No folders, collaborative editing, trash recovery, password reset, MFA, custom rate limiter, or full audit pipeline.

## Verification

`npm test` covers file validation, safe paths, sharing tokens, and mocked sharing server behavior (active/revoked/expired/missing/invalid links and provider errors). `npm run build` validates the frontend bundle. Complete [live security checks](docs/SECURITY_TEST_PLAN.md) before claiming these controls are verified in the hosted environment.
