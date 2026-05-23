import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  generateAdminToken,
  verifyAdminToken,
  generateBookingCode,
} from "./auth";

describe("Authentication", () => {
  describe("Password Hashing", () => {
    it("should hash a password", () => {
      const password = "testPassword123";
      const hash = hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toEqual(password);
      expect(hash).toContain("$");
    });

    it("should verify a correct password", () => {
      const password = "testPassword123";
      const hash = hashPassword(password);

      const isValid = verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword";
      const hash = hashPassword(password);

      const isValid = verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it("should produce different hashes for the same password", () => {
      const password = "testPassword123";
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);

      expect(hash1).not.toEqual(hash2);
      expect(verifyPassword(password, hash1)).toBe(true);
      expect(verifyPassword(password, hash2)).toBe(true);
    });
  });

  describe("JWT Token", () => {
    it("should generate a valid JWT token", () => {
      const adminId = 1;
      const username = "admin";
      const token = generateAdminToken(adminId, username);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);
    });

    it("should verify a valid JWT token", () => {
      const adminId = 1;
      const username = "admin";
      const token = generateAdminToken(adminId, username);

      const payload = verifyAdminToken(token);
      expect(payload).toBeDefined();
      expect(payload?.adminId).toBe(adminId);
      expect(payload?.username).toBe(username);
    });

    it("should reject an invalid JWT token", () => {
      const invalidToken = "invalid.token.here";
      const payload = verifyAdminToken(invalidToken);

      expect(payload).toBeNull();
    });

    it("should reject a tampered JWT token", () => {
      const adminId = 1;
      const username = "admin";
      const token = generateAdminToken(adminId, username);
      const tamperedToken = token.slice(0, -5) + "xxxxx";

      const payload = verifyAdminToken(tamperedToken);
      expect(payload).toBeNull();
    });
  });

  describe("Booking Code Generation", () => {
    it("should generate a unique booking code", () => {
      const code1 = generateBookingCode();
      const code2 = generateBookingCode();

      expect(code1).toBeDefined();
      expect(code2).toBeDefined();
      expect(code1).not.toEqual(code2);
    });

    it("should generate a booking code with correct format", () => {
      const code = generateBookingCode();

      expect(code).toMatch(/^[A-Z0-9]+-[A-Z0-9]+$/);
      expect(code.split("-").length).toBe(2);
    });

    it("should generate codes with consistent length", () => {
      const codes = Array.from({ length: 10 }, () => generateBookingCode());
      const lengths = codes.map((code) => code.length);

      expect(new Set(lengths).size).toBe(1);
    });
  });
});
