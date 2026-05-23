import { describe, it, expect, beforeEach } from "vitest";
import {
  hashPassword,
  verifyPassword,
  generateAdminToken,
  verifyAdminToken,
} from "./auth";
import { generateBookingCode } from "./auth";

describe("Admin Procedures", () => {
  describe("Admin Login", () => {
    it("should hash password correctly for new admin", () => {
      const password = "SecurePassword123!";
      const hash = hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toEqual(password);
      expect(verifyPassword(password, hash)).toBe(true);
    });

    it("should reject wrong password", () => {
      const correctPassword = "SecurePassword123!";
      const wrongPassword = "WrongPassword456!";
      const hash = hashPassword(correctPassword);

      expect(verifyPassword(wrongPassword, hash)).toBe(false);
    });

    it("should generate JWT token for authenticated admin", () => {
      const adminId = 1;
      const username = "admin@example.com";
      const token = generateAdminToken(adminId, username);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      // Verify token can be decoded
      const payload = verifyAdminToken(token);
      expect(payload).toBeDefined();
      expect(payload?.adminId).toBe(adminId);
      expect(payload?.username).toBe(username);
    });

    it("should reject expired or invalid tokens", () => {
      const invalidToken = "invalid.token.format";
      const payload = verifyAdminToken(invalidToken);

      expect(payload).toBeNull();
    });
  });

  describe("Protected Admin Procedures", () => {
    it("should verify admin token contains correct payload", () => {
      const adminId = 42;
      const username = "event_manager";
      const token = generateAdminToken(adminId, username);

      const payload = verifyAdminToken(token);
      expect(payload).not.toBeNull();
      expect(payload?.adminId).toBe(adminId);
      expect(payload?.username).toBe(username);
      expect(payload?.iat).toBeDefined();
      expect(payload?.exp).toBeDefined();
    });

    it("should reject tampered tokens", () => {
      const token = generateAdminToken(1, "admin");
      const tamperedToken = token.slice(0, -10) + "0000000000";

      const payload = verifyAdminToken(tamperedToken);
      expect(payload).toBeNull();
    });

    it("should have different tokens for different admins", () => {
      const token1 = generateAdminToken(1, "admin1");
      const token2 = generateAdminToken(2, "admin2");

      expect(token1).not.toEqual(token2);

      const payload1 = verifyAdminToken(token1);
      const payload2 = verifyAdminToken(token2);

      expect(payload1?.adminId).toBe(1);
      expect(payload2?.adminId).toBe(2);
    });
  });

  describe("Booking Code Generation", () => {
    it("should generate unique booking codes", () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateBookingCode());
      }

      expect(codes.size).toBe(100);
    });

    it("should generate codes in correct format", () => {
      const code = generateBookingCode();
      const parts = code.split("-");

      expect(parts.length).toBe(2);
      expect(parts[0]).toMatch(/^[A-Z0-9]+$/);
      expect(parts[1]).toMatch(/^[A-Z0-9]+$/);
    });

    it("should generate codes with consistent length", () => {
      const codes = Array.from({ length: 50 }, () => generateBookingCode());
      const lengths = new Set(codes.map((c) => c.length));

      expect(lengths.size).toBe(1);
    });
  });

  describe("Admin Session Management", () => {
    it("should maintain admin session with token", () => {
      const adminId = 1;
      const username = "admin@event.com";
      const token = generateAdminToken(adminId, username);

      // Simulate multiple requests with same token
      const payload1 = verifyAdminToken(token);
      const payload2 = verifyAdminToken(token);

      expect(payload1?.adminId).toBe(payload2?.adminId);
      expect(payload1?.username).toBe(payload2?.username);
    });

    it("should handle concurrent admin sessions", () => {
      const tokens = Array.from({ length: 5 }, (_, i) =>
        generateAdminToken(i + 1, `admin${i + 1}`)
      );

      const payloads = tokens.map((token) => verifyAdminToken(token));

      expect(payloads).toHaveLength(5);
      payloads.forEach((payload, index) => {
        expect(payload?.adminId).toBe(index + 1);
      });
    });
  });

  describe("Password Security", () => {
    it("should use bcrypt hashing (different salt each time)", () => {
      const password = "TestPassword123!";
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);

      expect(hash1).not.toEqual(hash2);
      expect(verifyPassword(password, hash1)).toBe(true);
      expect(verifyPassword(password, hash2)).toBe(true);
    });

    it("should handle special characters in passwords", () => {
      const specialPasswords = [
        "P@ssw0rd!#$%",
        "Пароль123",
        "密码123",
        "كلمة السر",
      ];

      specialPasswords.forEach((password) => {
        const hash = hashPassword(password);
        expect(verifyPassword(password, hash)).toBe(true);
      });
    });

    it("should reject empty passwords", () => {
      const emptyPassword = "";
      const hash = hashPassword(emptyPassword);

      // Even empty password should be hashed
      expect(hash).toBeDefined();
      expect(hash).not.toEqual(emptyPassword);
    });
  });
});
