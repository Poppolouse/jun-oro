/**
 * Encryption library testleri
 */
const { encrypt, decrypt, generateKey } = require('../src/lib/encryption.js');

describe('Encryption Library', () => {
  let testKey;

  beforeAll(() => {
    testKey = generateKey();
  });

  describe('encrypt', () => {
    it('should encrypt text successfully', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encrypt(plaintext, testKey);
      
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);
      expect(typeof encrypted).toBe('string');
    });

    it('should handle empty string', () => {
      const encrypted = encrypt('', testKey);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
    });

    it('should throw error for missing key', () => {
      expect(() => {
        encrypt('test', null);
      }).toThrow();
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted text successfully', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encrypt(plaintext, testKey);
      const decrypted = decrypt(encrypted, testKey);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle empty encrypted string', () => {
      const decrypted = decrypt('', testKey);
      
      expect(decrypted).toBe('');
    });

    it('should throw error for missing key', () => {
      expect(() => {
        decrypt('test', null);
      }).toThrow();
    });

    it('should throw error for invalid encrypted data', () => {
      expect(() => {
        decrypt('invalid-encrypted-data', testKey);
      }).toThrow();
    });
  });

  describe('generateKey', () => {
    it('should generate a valid key', () => {
      const key = generateKey();
      
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('should generate different keys each time', () => {
      const key1 = generateKey();
      const key2 = generateKey();
      
      expect(key1).not.toBe(key2);
    });
  });

  describe('roundtrip encryption', () => {
    it('should maintain data integrity through encrypt/decrypt cycle', () => {
      const testData = [
        'Simple text',
        'Text with numbers 123',
        'Special characters !@#$%^&*()',
        'Unicode characters: 你好, العربية, ño',
        'Very long text that might cause issues with some encryption algorithms'.repeat(10)
      ];

      testData.forEach(text => {
        const encrypted = encrypt(text, testKey);
        const decrypted = decrypt(encrypted, testKey);
        
        expect(decrypted).toBe(text);
      });
    });
  });
});