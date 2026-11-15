# Security test plan

Status: **Live backend tests not run.** Fill in observed responses and dates after configuring Supabase. Expected behavior is not evidence of a pass.

Use a new dedicated project and dummy files. Create User A and User B. Record A's full object path through project storage tools. Never record their passwords or session tokens.

| Test | Action | Expected result | Result |
|---|---|---|---|
| Authentication | Sign in with wrong password | Rejected without showing documents | Not run |
| Email confirmation | Attempt sign-in before confirming email | Rejected if configured correctly | Not run |
| Own upload | A uploads a small TXT/PDF | Successful; object under A UUID | Not run |
| Own download | A downloads the file | Correct contents | Not run |
| Anonymous read | Request the object's public URL without credentials | No document returned | Not run |
| Cross-user list | With B session call storage list using A UUID | A's files absent | Not run |
| Cross-user download | With B session call storage download with A's full path | Denied/no file bytes; denial may be masked as 404 | Not run |
| Cross-user upload | With B session call storage upload into A UUID | Denied | Not run |
| Oversized direct upload | Bypass UI; authenticated API upload over 5 MB | Rejected by bucket | Not run |
| Unsupported direct upload | Bypass UI; upload with text/html MIME | Rejected by bucket | Not run |
| Anonymous upload | Call API with publishable key and no session | Denied | Not run |
| Unpermitted overwrite/delete | Try API update/delete on owned object | No change | Not run |
| Filename display | Upload TXT named with HTML-like characters | Name is text; no script executes | Not run |
| Sign out | Sign out, try another authenticated download without a session | Denied | Not run |
| Deployed headers | Inspect site response headers | CSP, nosniff, frame restrictions present | Not run |
| Logs | Inspect platform auth/storage logs after tests | Document actual events and retention available | Not run |

For bypass tests, use a local script with `@supabase/supabase-js`, `createClient(projectUrl, publishableKey)`, and `auth.signInWithPassword` for the relevant test user. Then call `storage.from('documents').list(A_UUID)`, `.download(A_FULL_PATH)`, or `.upload(A_UUID + '/probe.txt', blob, {contentType:'text/plain'})`. Supply test credentials via local environment variables; never commit them. UI hiding is not an authorization test.

An already downloaded file cannot be recalled after sign-out. Existing tokens obtained before sign-out may have provider-specific expiry/revocation behavior; do not claim immediate universal token revocation.

After testing, add a dated results report containing actual status codes/results, fixes, and retest evidence. Redact tokens, emails, and private project details from screenshots.
