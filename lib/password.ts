import crypto from 'crypto';

const ITERATIONS = 310000;
const KEY_LENGTH = 32;
const DIGEST = 'sha256';
const PREFIX = 'pbkdf2';

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString('hex');

  return `${PREFIX}$${ITERATIONS}$${salt}$${hash}`;
}

export function isHashedPassword(value: string) {
  return value.startsWith(`${PREFIX}$`);
}

export function verifyPassword(password: string, storedPassword: string) {
  if (!isHashedPassword(storedPassword)) {
    return password === storedPassword;
  }

  const [, iterationsRaw, salt, storedHash] = storedPassword.split('$');
  const iterations = Number(iterationsRaw);

  if (!iterations || !salt || !storedHash) return false;

  const hash = crypto
    .pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST)
    .toString('hex');

  const hashBuffer = Buffer.from(hash, 'hex');
  const storedHashBuffer = Buffer.from(storedHash, 'hex');

  if (hashBuffer.length !== storedHashBuffer.length) return false;

  return crypto.timingSafeEqual(hashBuffer, storedHashBuffer);
}
