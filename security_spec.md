# Security Specification - Therapy With Edward

## 1. Data Invariants
- A `PortfolioItem` must belong to a category and have a valid order.
- A `Service` must have a title, description, and order.
- An `Inquiry` must have a property address and realtor name.
- `SiteSettings` should only be updated by verified admins.
- `CustomPage` slugs must be unique (enforced by application logic and secure rules).
- `Chat` documents must only be accessible by the owner.
- Identity roles (owner/admin) are restricted to verified emails tracked in the `admins` collection.

## 2. The "Dirty Dozen" Payloads (Red Team Tests)

### Payload 1: Shadow Field Injection (PortfolioItem)
**Target:** `portfolio_items`
**Action:** Create
**Attack:** Inject a `isVerified: true` field.
**Result:** `PERMISSION_DENIED` (Strict key check)

### Payload 2: Unauthorized Identity Spoofing (Chat)
**Target:** `users/victim-id/chats`
**Action:** Create
**Attack:** Create a chat for another user.
**Result:** `PERMISSION_DENIED` (Identity check `request.auth.uid == userId`)

### Payload 3: ID Poisoning Attack
**Target:** `portfolio_items/LARGE_JUNK_ID`
**Action:** Create
**Attack:** Use a 2KB string as document ID.
**Result:** `PERMISSION_DENIED` (`isValidId` check)

### Payload 4: PII Leak Attempt (Inquiries)
**Target:** `inquiries`
**Action:** Read
**Attack:** Attempt to list inquiries as a non-admin.
**Result:** `PERMISSION_DENIED` (`isAdmin` check)

### Payload 5: Immutable Field Violation (Service)
**Target:** `services`
**Action:** Update
**Attack:** Change `createdAt` timestamp.
**Result:** `PERMISSION_DENIED` (`incoming().createdAt == existing().createdAt`)

### Payload 6: Resource Exhaustion (Portfolio Item Description)
**Target:** `portfolio_items`
**Action:** Create
**Attack:** Send a 2MB description string.
**Result:** `PERMISSION_DENIED` (Size check `.size() <= 10000`)

### Payload 7: State Jumping (Admin Role)
**Target:** `admins`
**Action:** Create
**Attack:** User attempts to add themselves as an admin.
**Result:** `PERMISSION_DENIED` (`isAdmin` guard)

### Payload 8: Orphaned Record (Portfolio Item Category)
**Target:** `portfolio_items`
**Action:** Create
**Attack:** Set `category` to a non-existent value (abstractly, though categories aren't a separate collection here, this represents invalid data).
**Result:** `PERMISSION_DENIED` (Validation helper checks)

### Payload 9: Action Hijacking (Chat)
**Target:** `users/my-id/chats/my-chat`
**Action:** Update
**Attack:** Attempt to update `prompt` (should be immutable).
**Result:** `PERMISSION_DENIED` (`affectedKeys().hasOnly(['response'])`)

### Payload 10: Denial of Wallet (Recursive List Size)
**Target:** `portfolio_items`
**Action:** Create
**Attack:** Pass a `gallery` list with 10,000 items.
**Result:** `PERMISSION_DENIED` (List size check - *to be added in next rule iteration*)

### Payload 11: Unverified Email Access
**Target:** `settings/main`
**Action:** Update
**Attack:** Admin with unverified email attempts to update settings.
**Result:** `PERMISSION_DENIED` (Verified email check in `isAdmin`)

### Payload 12: Terminal State Lockout (Optional)
**Target:** `portfolio_items`
**Action:** Update
**Attack:** Changing a completed status (if implemented).
**Result:** `PERMISSION_DENIED`

## 3. The Test Runner Plan
Use `firestore.rules.test.ts` with `@firebase/rules-unit-testing` to verify these payloads.
