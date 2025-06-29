import { secureUserStorage } from "./security/userStorage";
import type { LoginRequest, ChangeCredentialsRequest } from "@shared/schema";
import crypto from "crypto";

export const authService = {
  async validateLogin(loginData: LoginRequest) {
    return await secureUserStorage.validatePassword(loginData.username, loginData.password);
  },

  async getUserById(userId: number) {
    return await secureUserStorage.getUserById(userId);
  },

  async changeCredentials(userId: number, currentPassword: string, changeData: ChangeCredentialsRequest) {
    const user = await secureUserStorage.getUserById(userId);
    if (!user) return false;
    
    const success = await secureUserStorage.changePassword(userId, currentPassword, changeData.newPassword);
    if (success && changeData.newUsername !== user.username) {
      await secureUserStorage.updateUser(userId, { username: changeData.newUsername });
    }
    return success;
  },

  generateToken(user: { id: number; username: string; role: string }) {
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (30 * 60) // 30 minutes
    };

    const secret = process.env.JWT_SECRET || "your-jwt-secret-change-in-production";
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString('base64url');
    const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64url');

    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payloadEncoded}`)
      .digest('base64url');

    return `${header}.${payloadEncoded}.${signature}`;
  },

  async verifyToken(token: string) {
    try {
      const secret = process.env.JWT_SECRET || "your-jwt-secret-change-in-production";
      const [header, payload, signature] = token.split('.');

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${header}.${payload}`)
        .digest('base64url');

      if (signature !== expectedSignature) {
        return null;
      }

      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());

      if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      // Verify user still exists
      const user = await this.getUserById(decodedPayload.userId);
      return user;
    } catch (error) {
      return null;
    }
  }
};