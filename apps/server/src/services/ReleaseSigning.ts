import { createHash, createPrivateKey, createPublicKey, sign, verify } from 'node:crypto'
import { readFileSync } from 'node:fs'
import canonicalize from 'canonicalize'

export const MANIFEST_DOMAIN = 'RARE.release-manifest.v1\n'
type KeyConfig = { id: string; publicKeyPem: string; privateKeyPem?: string; revokedAt?: string }
// Inject through a secret manager/environment or a mounted secret file. Never mint
// fallback keys on startup. Keep retired public keys for verification after rotation.
function keyring(): { activeKeyId: string; keys: KeyConfig[] } {
  try {
    const raw = process.env.RARE_SIGNING_KEY_FILE ? readFileSync(process.env.RARE_SIGNING_KEY_FILE, 'utf8') : process.env.RARE_SIGNING_KEYS_JSON
    if (!raw) throw new Error('Missing keys')
    const config = JSON.parse(raw)
    if (typeof config.activeKeyId !== 'string' || !Array.isArray(config.keys)) throw new Error('Invalid ring')
    const ids = new Set<string>()
    for (const key of config.keys) {
      if (typeof key.id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(key.id) || ids.has(key.id)) throw new Error('Invalid key ID')
      ids.add(key.id)
      if (createPublicKey(key.publicKeyPem).asymmetricKeyType !== 'ed25519') throw new Error('Ed25519 required')
      if (key.revokedAt !== undefined && (typeof key.revokedAt !== 'string' || !Number.isFinite(Date.parse(key.revokedAt)))) throw new Error('Invalid revocation timestamp')
    }
    return config
  } catch { throw { statusCode: 503, message: 'Release signing keys are not configured correctly' } }
}

// RFC 8785 additionally rejects lone UTF-16 surrogates. JSON.parse can accept
// them, so reject before passing JSON values to the established JCS serializer.
function requireUnicode(value: unknown): void {
  if (typeof value === 'string') {
    for (let i = 0; i < value.length; i++) {
      const c = value.charCodeAt(i)
      if (c >= 0xd800 && c <= 0xdbff) {
        const next = value.charCodeAt(++i)
        if (!(next >= 0xdc00 && next <= 0xdfff)) throw { statusCode: 400, message: 'Manifest contains invalid Unicode' }
      } else if (c >= 0xdc00 && c <= 0xdfff) throw { statusCode: 400, message: 'Manifest contains invalid Unicode' }
    }
  } else if (Array.isArray(value)) value.forEach(requireUnicode)
  else if (value && typeof value === 'object') for (const [key, entry] of Object.entries(value)) { requireUnicode(key); requireUnicode(entry) }
}
export function canonicalManifest(value: unknown): string {
  requireUnicode(value)
  const result = canonicalize(value)
  if (!result) throw { statusCode: 400, message: 'Invalid release manifest' }
  return result
}
export function manifestDigest(value: unknown) { return createHash('sha256').update(canonicalManifest(value)).digest('hex') }

export function signManifest(manifest: Record<string, unknown>) {
  const ring = keyring()
  const key = ring.keys.find(k => k.id === ring.activeKeyId)
  if (!key?.privateKeyPem || key.revokedAt) throw { statusCode: 503, message: 'No active release signing key' }
  try {
    const privateKey = createPrivateKey(key.privateKeyPem)
    if (privateKey.asymmetricKeyType !== 'ed25519' || createPublicKey(key.privateKeyPem).export({ type: 'spki', format: 'pem' }) !== createPublicKey(key.publicKeyPem).export({ type: 'spki', format: 'pem' })) throw new Error('Mismatched keys')
    const manifestJson = { ...manifest, attestation: { signer: 'RARE_PLATFORM', algorithm: 'Ed25519', keyId: key.id, canonicalization: 'RFC8785', domain: MANIFEST_DOMAIN } }
    const canonical = canonicalManifest(manifestJson)
    return { manifestJson, manifestHash: createHash('sha256').update(canonical).digest('hex'), manifestSignature: sign(null, Buffer.from(MANIFEST_DOMAIN + canonical, 'utf8'), privateKey).toString('base64'), signingKeyId: key.id }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw { statusCode: 503, message: 'Release signing failed' }
  }
}

export function inspectSignature(record: { attestationVersion?: number | null; manifestJson: unknown; manifestHash: string | null; manifestSignature: string | null; signingKeyId: string | null }) {
  if (!record.manifestJson && !record.manifestHash && !record.manifestSignature && !record.signingKeyId) return record.attestationVersion ? 'MISSING_EVIDENCE' as const : 'UNSIGNED' as const
  if (!record.manifestJson || !record.manifestHash || !record.manifestSignature || !record.signingKeyId) return 'MISSING_EVIDENCE' as const
  let ring: ReturnType<typeof keyring>
  try { ring = keyring() } catch { return 'KEY_UNAVAILABLE' as const }
  const key = ring.keys.find(k => k.id === record.signingKeyId)
  if (!key) return 'KEY_UNAVAILABLE' as const
  try {
    const manifest = record.manifestJson as any
    if (manifest.attestation?.keyId !== key.id || manifest.attestation?.algorithm !== 'Ed25519' || manifest.attestation?.signer !== 'RARE_PLATFORM' || manifest.attestation?.canonicalization !== 'RFC8785' || manifest.attestation?.domain !== MANIFEST_DOMAIN || manifest.schemaVersion !== 1) return 'INVALID' as const
    const canonical = canonicalManifest(manifest)
    const signature = Buffer.from(record.manifestSignature, 'base64')
    if (signature.length !== 64 || signature.toString('base64') !== record.manifestSignature || manifestDigest(manifest) !== record.manifestHash || !verify(null, Buffer.from(MANIFEST_DOMAIN + canonical), createPublicKey(key.publicKeyPem), signature)) return 'INVALID' as const
    return key.revokedAt ? 'KEY_REVOKED' as const : 'VALID' as const
  } catch { return 'INVALID' as const }
}
export function publicSigningKeys() {
  return keyring().keys.map(key => ({ id: key.id, algorithm: 'Ed25519' as const, publicKeyPem: key.publicKeyPem, revokedAt: key.revokedAt ?? null }))
}
