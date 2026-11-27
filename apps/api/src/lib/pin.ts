import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const SALT_BYTES = 16
const KEY_LENGTH = 64

export function hashLocalPin(pin: string): string {
  const salt = randomBytes(SALT_BYTES).toString('hex')
  const derivedKey = scryptSync(pin, salt, KEY_LENGTH).toString('hex')
  return 'scrypt$' + salt + '$' + derivedKey
}

export function verifyLocalPin(pin: string, encodedHash: string): boolean {
  const parts = encodedHash.split('$')
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false

  const salt = parts[1]
  const expectedHex = parts[2]
  if (!/^[a-f0-9]{32}$/i.test(salt) || !/^[a-f0-9]{128}$/i.test(expectedHex)) return false

  try {
    const expected = Buffer.from(expectedHex, 'hex')
    const actual = scryptSync(pin, salt, KEY_LENGTH)
    return expected.length === actual.length && timingSafeEqual(expected, actual)
  } catch {
    return false
  }
}
