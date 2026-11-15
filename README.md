# Secure Document Portal

A cybersecurity portfolio lab by Eni Ogunbayo. Users sign in, upload sample PDF/TXT documents, and download their own files. The purpose is to demonstrate identity, least privilege, private storage, and security validation.

**Status:** Initial implementation; not connected to a live Supabase project or deployed. Cross-user isolation is NOT yet verified. Do not describe the project as deployed or security-tested on a resume yet.

## Architecture

The browser runs a Vite/JavaScript app hosted on Cloudflare Pages. Supabase Auth issues user sessions. Supabase Storage checks the authenticated user against Postgres row-level security (RLS) policies before listing, uploading, or downloading objects. Files are stored under `<user UUID>/<random UUID>_<sanitized filename>` in a private bucket. The folder prefix is checked on the server, not just in the page.

## Step 1: Create the backend

1. Create a Free project at https://supabase.com/dashboard in a new organization on the Free plan. Keep your database password private.
2. Open SQL Editor, paste `supabase/setup.sql`, and run it **once** in this new project. It creates the private bucket and two owner-folder policies. Do not add permissive storage policies.
3. In Authentication settings, require email confirmation and a minimum password length of 12. These are backend settings; the HTML minimum alone is not a security boundary.
4. Set Site URL to your eventual HTTPS site URL. For local tests, use `http://localhost:5173`. Confirmation links return users to the page; they then sign in with their password.
5. Find the project URL and **publishable** API key in project settings. These are intended for browser use. Never put a secret/service-role key, database password, or access token in the app, repository, or chat.

## Step 2: Run locally

Install Node.js 22 or newer, then run:

```sh
npm ci
cp .env.example .env
```

Edit `.env` with the project URL and publishable key. Then:

```sh
npm run dev
```

Visit the displayed local URL. Create a test account and confirm its email. Use dummy files only. Sessions are kept in memory, so refreshing the page requires signing in again.

## Step 3: Deploy free on Cloudflare Pages

1. Create a Cloudflare account and open Workers & Pages. Choose a **Pages** project and connect this GitHub repository.
2. Build command: `npm run build`. Output directory: `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as build environment variables. Their values are compiled into the public browser bundle by design.
4. Deploy and update the Supabase Authentication Site URL to the returned HTTPS address. No custom domain is necessary.
5. Confirm response headers from `public/_headers` are present on the deployed site. These headers are specific to Cloudflare Pages; another host needs equivalent configuration.
6. Run every test in `docs/SECURITY_TEST_PLAN.md` and record results before linking the site on your resume.

Stay on Free plans and monitor usage. Free-plan limits and service inactivity policies can change. This project is a small demonstration, not a production document service.

## Local checks

```sh
npm test
npm run build
```

Unit tests cover client file validation and path handling. They do **not** prove backend authorization or malicious-file detection.

## Security scope

- Private bucket, authenticated owner-folder INSERT/SELECT policies.
- No anonymous, update, or delete access granted by this schema.
- 5 MB limit and PDF/TXT declared MIME restrictions at the storage bucket; additional client extension checks.
- Authenticated downloads through the storage API; no public or signed sharing links.
- Session tokens stay in memory; no passwords or tokens logged by app code.
- Dynamic filenames displayed with `textContent`; no HTML interpolation.
- Restrictive browser headers for Cloudflare Pages.

## Limitations and next steps

MIME types can be forged; these checks are not malware scanning. No antivirus, admin role, MFA, application rate limiter, alerting, password recovery flow, or durable application audit trail is implemented. Supabase platform auth/storage logs are separate from an application audit trail; configure and inspect those during live testing. Files are limited to the first 100 entries in this starter. Register two test users, disable new public signups after testing, and use screenshots/walkthroughs for recruiters. Review existing Supabase policies if modifying this schema. Never store personal or confidential files.

References: https://supabase.com/docs/guides/storage/security/access-control · https://supabase.com/docs/guides/storage/buckets/fundamentals · https://supabase.com/docs/reference/javascript/auth-signinwithpassword
