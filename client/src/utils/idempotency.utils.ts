const generateRandomString = (length: number = 10): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

export const generateIdempotencyKey = (): string => {
  const timestamp = Date.now();
  const random = generateRandomString(10);
  
  return `idmp_${timestamp}_${random}`;
};

const usedKeys = new Set<string>();

export const generateUniqueIdempotencyKey = (): string => {
  let key = generateIdempotencyKey();
  
  while (usedKeys.has(key)) {
    key = generateIdempotencyKey();
  }
  
  usedKeys.add(key);
  
  return key;
};