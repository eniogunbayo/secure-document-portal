# Upgrade your existing site to Pouch

Your existing Supabase project, accounts, files, Cloudflare Pages project, and URL can stay in place. Pouch changes the product name and design. A GitHub repository rename is optional and not required.

## 1. Add database capabilities FIRST

Open `supabase/pouch-upgrade.sql`, copy the full SQL into Supabase SQL Editor, and run it. This is the **upgrade**, not the original setup. It keeps existing files and adds owner-only rename/delete permissions, more supported file types, and sharing records. It can be run again safely. Existing INSERT/SELECT policies from the original setup are required. Do not make the documents bucket public.

## 2. Configure the sharing server

Pouch uses a Cloudflare Pages Function at `/api/shared`. It checks an unguessable link's fingerprint, expiry, and revocation before streaming a private file. It does not issue a reusable Supabase signed URL.

In the existing Cloudflare **Pages** project, under Settings → Variables and Secrets (wording can vary), select Production and add:

| Variable | Value | Where it is used |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Your existing Supabase Project URL | Public browser build; keep existing value |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your existing publishable key | Public browser build; keep existing value |
| `SUPABASE_URL` | The same Supabase Project URL | Server runtime |
| `SUPABASE_SERVICE_ROLE_KEY` | Your project's legacy **service_role** API key | **Encrypted secret, server runtime only** |

Find the legacy service_role key in Supabase Project Settings → API Keys → Legacy anon/service_role API keys. Do not use a publishable key here. This implementation expects a legacy JWT service_role key. Never paste this secret into chat, GitHub, a screenshot, a `VITE_` variable, or browser code. Add it directly as an encrypted Cloudflare secret. It has broad backend privileges; the Function is deliberately narrow and never accepts a caller-supplied bucket or file path.

For preview environments, leave the production secret unset unless intentionally testing sharing. Local Vite preview has no Pages Function; full local sharing requires a Pages Functions runtime (for example Wrangler Pages dev) and local server variables kept out of Git.

## 3. Upload the update to GitHub

Download and unzip the provided Pouch update. Open GitHub repository → Add file → Upload files. Drag the **contents** of the extracted directory, preserving the folders. Confirm the upload includes:

- `src/main.js`, `src/style.css`, `src/security.js`
- `functions/api/shared.js` (**must be at the repository root functions folder**, next to src, not inside dist)
- `public/pouch.svg`, `public/_headers`, `public/_routes.json`
- `supabase/pouch-upgrade.sql`
- `index.html`, `package.json`, `package-lock.json`, README and docs

Commit the upload. Git-connected Cloudflare Pages builds the frontend and detects the Functions folder. Keep build command `npm run build`, output `dist`, root blank. Redeploy after adding server variables if the prior build has already completed.

The earlier upload left duplicate files at the root (`main.js`, `style.css`, `security.js`, `security.test.js`, `setup.sql`, `_headers`, `SECURITY_TEST_PLAN.md`). They are not used by Pouch. You may delete these old duplicates after the upgrade; keep the correctly nested versions.

## 4. Auth settings

Keep Supabase Authentication Site URL set to your existing Pages URL. Require email confirmation and a minimum password length of 12 in Supabase settings. Pouch now keeps sessions in browser storage so users can return after refresh; sign out on shared computers. No tokens or passwords are logged by the application. Password recovery and MFA are not included in this release.

## 5. Verify before announcing

Use dummy files and two accounts. Follow `docs/SECURITY_TEST_PLAN.md`. Particularly test: create link, open in signed-out browser, revoke, try downloading again; expired links; forbidden cross-user rename/delete/sharing; uploads above 5 MB via API; and account sessions after refresh.

**Revoke affects future requests.** A download already in progress or a file already saved by a recipient cannot be recalled. Old Supabase dashboard signed URLs are separate; Pouch cannot revoke those links from its sharing screen.

## Cost and limits

Continue using Free plans. Files are capped at 5 MB and count toward Supabase's shared project storage/transfer quotas. Links served through Pages Functions count toward Cloudflare's Functions limits. Pouch does not add a paid subscription. Free-service quotas and inactivity policies still apply; monitor dashboards. There is no malware scanner, per-user storage quota, custom rate limiter, or production audit pipeline in this release.
