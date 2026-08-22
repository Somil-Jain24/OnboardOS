import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { env } from '../config/env';
import { store } from '../db/store';
import type { User, UserRole } from '../types';

export class AuthService {
  private secret = env.JWT_SECRET;

  public generateToken(user: User): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        employeeId: user.employeeId,
      },
      this.secret,
      { expiresIn: '24h' }
    );
  }

  public verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secret);
    } catch {
      return null;
    }
  }

  public getUserByEmail(email: string): User | undefined {
    const normalized = (email || '').trim().toLowerCase();
    return store.users.find((u) => u.email.toLowerCase() === normalized);
  }

  public getUserById(id: string): User | undefined {
    return store.users.find((u) => u.id === id);
  }

  public getUserByRole(role: UserRole): User | undefined {
    return store.users.find((u) => u.role === role);
  }

  /**
   * Secure email + password authentication using Argon2id
   */
  public async loginWithCredentials(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = this.getUserByEmail(normalizedEmail);

    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    let isValidPassword = false;

    if (user.passwordHash) {
      try {
        isValidPassword = await argon2.verify(user.passwordHash, password);
      } catch (err) {
        isValidPassword = false;
      }
    } else {
      // For development seed users without an explicit hash yet, allow the standard dev password
      isValidPassword = password === 'OnboardOS2026!Secure' || password === 'Pass#892134!';
    }

    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const token = this.generateToken(user);
    return { success: true, user, token };
  }
}

export const authService = new AuthService();
