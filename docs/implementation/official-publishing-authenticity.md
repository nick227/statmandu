# Official publishing and platform authenticity

## Scope and trust boundary

Official and community releases use the same `CardRelease`, publication transaction,
number allocator, collections and downloads. No delegation, new issue ledger,
commerce, blockchain or personal-key signing was introduced.

Three separate meanings must remain separate in the UI:

- A decorative autograph is visual artwork.
- A reviewed self-claim is an administrator's approval of account control for
  publishing. The platform does not implement automated identity proofing or KYC.
- An Ed25519 signature is **RARE's platform attestation of a release manifest**.
  It is not the depicted person's cryptographic signature, proof of authorship,
  or independent verification of every fact on a card.

## Claim authority and revocation

New person creation and legacy `claimedByUserId` grant no official authority.
The account must control the subject and have an APPROVED claim with explicit
`publishingApprovedAt` and `publishingApprovedByUserId`, without revocation.
The publisher and release creator must be that account. Administrator moderation
access is not a substitute for official authority. Subject control gives no access
to another creator's private releases or images.

`PATCH /claims/{claimId}` remains administrator-only. Approval records a publishing
grant and an audit event. An administrator cannot approve their own claim. Legacy
APPROVED claims have no publishing grant after migration: an administrator may
explicitly revalidate one through this endpoint, preserving its original review
fields and recording new publishing-approval metadata. PENDING claims remain
ineligible; REJECTED and REVOKED claims cannot be reapproved. After revocation,
submit a new claim and obtain a new review. There is at most one active reviewed
publishing grant per person through these services.

`POST /claims/{claimId}/revoke` accepts `{ "reason": "..." }` (1–1000 characters).
The claimant or an active administrator may revoke an APPROVED claim. Retries
return the existing revocation without replacing its actor, timestamp or reason.
Revocation retains original approval fields and all release evidence. It clears
matching profile control if no other approved claim retains that control; it
never clears a different subsequent controller. Reasons and verification notes
are private to claim-management responses, not public authenticity responses.

Publication, approval and revocation lock the same physical `AthleteProfile` row.
Publication also locks the release and checks the current active account and claim
inside the transaction. These transactions use **READ COMMITTED**: taking a row
lock alone does not refresh an earlier MySQL REPEATABLE READ snapshot.

- Publication wins the lock: its signature and authorization evidence commit;
  subsequent revocation blocks future official releases but preserves this one.
- Revocation wins: publication rereads revoked authority and fails with 403.

Revocation does not withdraw releases or alter edition limits, hashes, copies or
ownership. Withdrawal remains the existing release archive operation and is
reported separately from historical authorization.

## Canonical signed manifest

New publication of either classification requires signing keys. Missing keys,
missing artwork or signing failures roll back publication; there is no unsigned
fallback. Previously published records remain unchanged and explicitly unsigned.

Manifest v1 includes release/subject IDs, creator/publisher IDs, classification,
frozen content, artwork references, edition mode/size, renderer version, server
publication timestamp, initial visibility, legacy origin hash, authorization
claim reference and safe approval metadata, plus asset SHA-256 digests.

Digests are computed from server-stored front artwork and selected composition
image bytes, never supplied by the client. Unpublished source portraits are not
included or exposed. Assets are ordered by ID. The publication transaction refuses
missing/deleted assets, size mismatches, unreadable storage, or assets over 25 MiB.
It has a 30-second transaction limit. The offline artwork provider now writes real
PNG bytes rather than a non-existent image URL. Historical placeholder artwork
must be regenerated on a draft before it can be newly published.

Canonicalization uses the `canonicalize` package implementing
[RFC 8785](https://www.rfc-editor.org/rfc/rfc8785.html), with invalid UTF-16 rejected.
Signatures use [Node's Ed25519 implementation](https://nodejs.org/api/crypto.html#cryptosignalgorithm-data-key-callback).

Independent verification:

1. Obtain the manifest and key ID from the authenticity endpoint.
2. Obtain the trusted public key through `/signing-keys` over the authenticated
   platform origin (or a separately pinned platform public-key distribution).
3. Canonicalize the manifest using RFC 8785 to UTF-8 bytes.
4. SHA-256 of those canonical bytes must match `manifestHash`.
5. Verify the Base64-decoded Ed25519 signature over the UTF-8 domain prefix
   `RARE.release-manifest.v1\n` followed by the canonical bytes. The final `\n`
   denotes one newline byte, not a literal backslash and letter n.
6. Check classification, authority evidence, current withdrawal/revocation and
   key status separately. Compare downloaded asset bytes with their signed digests
   if you need current byte integrity.

The public inspector does not fetch/re-hash every asset on each request; its
`assetVerification` value explicitly says digests were recorded at publication
and have not been rechecked. URLs are references, not externally verified content.

Historical `originHash` and `issueHash` serialization is unchanged. Issue inspection
uses the shared legacy hash helper, not the manifest canonicalizer. The signature
covers the release, not each individual issue or its current ownership; issue
membership is a separate platform-ledger check.

## Managed signing-key configuration

Production has no generated default key. Inject `RARE_SIGNING_KEY_FILE` pointing
to a read-only secret-manager-mounted JSON file, or `RARE_SIGNING_KEYS_JSON` through
your deployment secret manager. The file takes precedence. Neither private keys
nor secret configuration belong in the repository, database, logs or API responses.
Private signing material is loaded by the backend from that managed secret; this
MVP does not implement a remote KMS/HSM signing adapter.

Configuration shape (placeholders only):

```json
{
  "activeKeyId": "rare-2026-01",
  "keys": [
    {
      "id": "rare-2026-01",
      "publicKeyPem": "<Ed25519 SPKI public PEM>",
      "privateKeyPem": "<Ed25519 PKCS8 private PEM>"
    }
  ]
}
```

The private/public pair must match. To rotate, append a new pair with a new ID,
set `activeKeyId`, and keep older public entries while removing retired private
material. Never reuse an ID with another key. To revoke a compromised key, retain
its public entry and set `revokedAt` to an ISO timestamp; any set value disables
signing with it and makes verification report `KEY_REVOKED`, including historical
signatures. Do not delete old public keys: deletion makes verification return
`KEY_UNAVAILABLE`, not INVALID or VALID. The key ring is loaded on each operation,
so all server instances must receive the same managed configuration. Deployment
operators own key provisioning, secure storage, backup, rotation and revocation.

Test keys exist only in the server test setup and are generated per test worker.
No production key has been provisioned and no deployment has been performed.

## Antigravity contracts

OpenAPI sources and generated SDK types are committed; frontend implementation is
not part of this change. Existing card/release publication endpoints accept
`publicationType: COMMUNITY | OFFICIAL` and share the same service.

| Endpoint | Access and response |
| --- | --- |
| `GET /people/{personId}/publishing-authority` | Authenticated account's eligibility, claim ID and approval time; not a permission token or signing-service health check |
| `PATCH /claims/{claimId}` | Admin review/revalidation; APPROVED or REJECTED only |
| `POST /claims/{claimId}/revoke` | Claimant or admin; reason required |
| `POST /releases/{releaseId}/publish` | Same publication flow, checks OFFICIAL authority at commit time |
| `GET /releases/{releaseId}/authenticity` | Public inspection of public published releases and previously-public signed withdrawals |
| `GET /card-issues/{issueId}/authenticity` | Public issue-ledger check plus release inspection |
| `GET /signing-keys` | Public Ed25519 keys and key-revocation timestamps; never private material |

Do not infer verification from the release DTO's `attestation` summary or a claim
badge; inspect authenticity for the authoritative verification result.

| Field | Meaning |
| --- | --- |
| `platformAttestation` | VALID, INVALID, UNSIGNED, MISSING_EVIDENCE, KEY_UNAVAILABLE or KEY_REVOKED |
| `officialAtPublication` | VERIFIED only with a valid attestation, matching immutable content and matching approval evidence; NOT_APPLICABLE for community; otherwise MISSING_OR_INVALID_EVIDENCE |
| `currentAuthority` | ACTIVE, INACTIVE, REVOKED, UNKNOWN or NOT_APPLICABLE |
| `withdrawalStatus` | PUBLISHED or WITHDRAWN, independent of signature/authority |
| Issue `bindingStatus` | LEDGER_MATCH, INVALID or UNVERIFIABLE_LEGACY; never a claim that an issue was individually signed |

Private releases, drafts, and private withdrawals return 404 through public
inspection, even to a subject controller. Legacy archived records lacking initial
public-visibility evidence also return 404 rather than expose potentially private
content. Public unsigned legacy releases remain inspectable as UNSIGNED. The
manifest response is null when its signature cannot be validated; evidence/status
fields explain why. Unknown or revoked keys must not produce a green verified
badge. A community release can have a valid platform signature without official
authority. An official withdrawn release can retain its original valid signature.

## Migration and verification

Apply `20261118030000_official_attestations` after the existing additive migrations,
generate Prisma and deploy matching contracts/backend with signing keys configured.
No historical release, issue or approval is upgraded or rehashed by the migration.
Do not roll back to an app that ignores REVOKED claims or the new authority checks.

Tests cover canonicalization, real artwork digests, independent Ed25519 verification,
legacy claims, pending/rejected/revoked authority, creator privacy, unauthorized
revocation, missing signing material, key rotation/revocation, record tampering,
unsigned history, private inspection, withdrawal, unchanged issuance and both
lock orderings of concurrent publication/revocation. Migration verification checks
that existing approved claims have no publishing grant and historical releases
have no attestation fields after the additive migration.

Final verification: **26 server test files / 220 tests passed**, including ten
focused official-publishing/authenticity tests. Populated migration verification,
workspace typechecking, OpenAPI lint and SDK drift checks passed. Both race orders
were tested using a held database row lock; the revocation-first test exposed and
then verified the fix for stale REPEATABLE READ authority snapshots.
