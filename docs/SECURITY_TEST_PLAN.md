# Pouch live verification checklist

These are **pending live tests for the upgrade**, not claimed results. Prior user reports for the old portal: own upload/download matched, and Account B's file list was separate. Re-test after upgrading.

| Test | Expected behavior | Observed result |
|---|---|---|
| Account creation and confirmed sign-in | Workspace loads | Pending |
| Refresh and return | Session and files persist | Pending |
| Sign out and switch user | No previous user's files visible | Pending |
| Multi-file upload and search/sort | Accurate listing, filtered/sorted correctly | Pending |
| Authenticated own download | Contents match | Pending |
| Account B directly requests A's object path | No file bytes | Pending |
| Account B directly renames/deletes A's object | No change | Pending |
| Account B creates a share for A's path via API | Rejected | Pending |
| Own rename | Name changes; file contents retained | Pending |
| Own delete | File no longer retrievable | Pending |
| Direct API file upload above 5 MB | Rejected by bucket | Pending |
| Direct API unsupported MIME upload | Rejected by bucket | Pending |
| Share creation | Link created with chosen expiry | Pending |
| Signed-out recipient | Link downloads correct file with no account | Pending |
| Revocation followed by a fresh download request | Blocked; no cached file returned | Pending |
| Expired link | Blocked | Pending |
| Random or altered token | Blocked | Pending |
| Rename/delete shared file | Old sharing links stop working | Pending |
| Owner tries modifying another owner's share | Rejected by RLS | Pending |
| Attempt to un-revoke or extend a link via direct API | Rejected | Pending |
| Static response headers | CSP, nosniff, referrer and frame restrictions | Pending |
| Shared response headers | Attachment, no-store, nosniff; no secret leaked | Pending |
| Browser production bundle | Contains public URL/key only; no server key | Pending |

Test revoked/expired links using fresh downloads with network cache disabled, not a previously saved file. Document dates and actual responses. Redact credentials and token-bearing URLs from screenshots. Existing Supabase dashboard-generated signed URLs are outside Pouch's revocation controls. Keep sample data only during testing.
