# Security Specification — Al-Ghafari Soft Pro (Multi-Tenant ERP)

## 1. Master Source of Truth & Data Invariants
1. **Strict Tenant Isolation**: Every user's accounting workspace resides at `/workspaces/{workspaceId}` where `workspaceId == ownerId == request.auth.uid`. All 14 operational subcollections (`accounts`, `products`, `contacts`, `invoices`, `quotations`, `returnInvoices`, `vouchers`, `journalEntries`, `stockMovements`, `stockAdjustments`, `stockTransfers`, `stockReceiptNotes`, `reconciliations`, `auditLogs`, and `auditSnapshot`) live strictly under `/workspaces/{workspaceId}`.
2. **Verified Identity Gate**: No unauthenticated or unverified (`email_verified == false`) user may read or write any business or profile document.
3. **Owner-Controlled Audit Authorization**: Even the platform Super Admin (`moohamedalsroore@gmail.com`) is strictly denied read access to any tenant's accounting data (`/workspaces/{workspaceId}`, subcollections, or `/workspaces/{workspaceId}/auditSnapshot/summary`) unless the workspace owner explicitly sets `adminAuditAuthorized == true` on `/workspaces/{workspaceId}` (mirrored in `users/{userId}.accountingAccessGranted`).
4. **PII Isolation**: `/users/{userId}` contains PII (`email`, `displayName`, `photoURL`) and can ONLY be read via `get` by `isOwner(userId)` or `isAdmin()`, and `list` ONLY by `isAdmin()`.
5. **Privilege Escalation Prevention**: Users creating `/users/{userId}` MUST set `role == 'USER'`, `status == 'ACTIVE'`, `accountingAccessGranted == false`. Users cannot self-promote to `ADMIN` or unblock a `SUSPENDED` account; only a verified Admin matching `/admins/{uid}` or verified admin email can change `status` or `role`.
6. **Temporal Integrity & Immutability**: On every `create`, `createdAt == request.time && updatedAt == request.time` and `ownerId == request.auth.uid`. On every `update`, `createdAt == existing().createdAt`, `ownerId == existing().ownerId`, and `updatedAt == request.time`.
7. **Master Gate Parent Check**: Every subcollection `get`, `create`, `update`, and `delete` verifies via `get(/databases/$(database)/documents/workspaces/$(workspaceId))` that the parent workspace exists, has `ownerId == request.auth.uid`, and `status == 'ACTIVE'`. Every subcollection `list` enforces `resource.data.ownerId == request.auth.uid` without `get()`/`exists()` inside `allow list`.
8. **ID Poisoning & String/Array Size Guards**: All path IDs pass `isValidId(id)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars). Every string validates `.size()` and bounded arrays check `.size() <= MAX`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Cross-Tenant Read**: User B (`uid_b`) attempts `get` on `/workspaces/uid_a/contacts/cont-1` -> **PERMISSION_DENIED**.
2. **Cross-Tenant Create (Owner Spoofing)**: User B creates `/workspaces/uid_b/invoices/inv-1` with `ownerId: "uid_a"` -> **PERMISSION_DENIED**.
3. **Privilege Escalation on Profile Create**: User A registers `/users/uid_a` with `role: "ADMIN"` -> **PERMISSION_DENIED**.
4. **Privilege Escalation on Profile Update**: User A updates `/users/uid_a` changing `role` to `"ADMIN"` or `status` to `"ACTIVE"` while suspended -> **PERMISSION_DENIED**.
5. **Shadow / Ghost Field Injection**: User A updates `/workspaces/uid_a` adding an extra unlisted field `isVIP: true` -> **PERMISSION_DENIED**.
6. **Unauthorized Admin Audit Read**: Admin reads `/workspaces/uid_a/auditSnapshot/summary` while `adminAuditAuthorized == false` -> **PERMISSION_DENIED**.
7. **Unverified Email Spoof**: Caller sets custom/unverified token `email: "moohamedalsroore@gmail.com"` with `email_verified: false` to read `/users` -> **PERMISSION_DENIED**.
8. **Client-Forged Timestamp**: User A creates an invoice with client-supplied `createdAt: "2020-01-01"` instead of `request.time` -> **PERMISSION_DENIED**.
9. **Immutable Field Mutation**: User A updates a product trying to change `ownerId` or `createdAt` -> **PERMISSION_DENIED**.
10. **Path ID Poisoning (Denial of Wallet)**: User A attempts `create` at `/workspaces/uid_a/products/../../bad$id` or a 1,500-char ID -> **PERMISSION_DENIED**.
11. **Oversized Array / String Payload**: User A creates an invoice with a 1MB `notes` string or >250 line items -> **PERMISSION_DENIED**.
12. **Blanket User List Scraping**: Non-admin authenticated User B runs `getDocs(collection(db, "users"))` -> **PERMISSION_DENIED**.
