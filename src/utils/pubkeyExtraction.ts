import { Signature, ECDSA, Address, Hash, BufferWriter } from 'libnexa-ts'

export const createMagicHash = (messageHex: string): Buffer => {
  const msg = Buffer.from(messageHex, 'hex').toString('utf8')
  const MAGIC_BYTES = Buffer.from('Bitcoin Signed Message:\n')
  const prefix1 = BufferWriter.varintBufNum(MAGIC_BYTES.length)
  const messageBuffer = Buffer.from(msg)
  const prefix2 = BufferWriter.varintBufNum(messageBuffer.length)
  const buf = Buffer.concat([prefix1, MAGIC_BYTES, prefix2, messageBuffer])
  return Hash.sha256sha256(buf)
}

export const extractPublicKeyFromSignature = (
  signatureString: string,
  messageHex: string,
  address: string
): string | null => {
  try {
    const signatureObj = Signature.fromCompact(Buffer.from(signatureString, 'base64'))
    const magicHash = createMagicHash(messageHex)

    const ecdsa = new ECDSA()
    ecdsa.hashbuf = magicHash
    ecdsa.sig = signatureObj

    const publicKey = ecdsa.toPublicKey()
    ecdsa.pubkey = publicKey

    const isValid = ecdsa.verify()

    if (isValid) {
      const nexaAddress = Address.fromString(address)
      const signatureAddress = Address.fromPublicKey(publicKey, nexaAddress.network, nexaAddress.type)

      if (signatureAddress.toString() === address) {
        return publicKey.toString()
      }
    }

    return null
  } catch (err) {
    console.error('Failed to extract public key:', err)
    return null
  }
}
