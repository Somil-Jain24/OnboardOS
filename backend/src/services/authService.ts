import jwt from 'jsonwebtoken';
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
    return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return store.users.find((u) => u.id === id);
  }

  public getUserByRole(role: UserRole): User | undefined {
    return store.users.find((u) => u.role === role);
  }

  public loginAsRole(role: UserRole): { user: User; token: string } {
    let user = this.getUserByRole(role);
    if (!user) {
      user = {
        id: `usr-${role.toLowerCase()}`,
        name: `${role} Demo User`,
        email: `${role.toLowerCase()}@onboardos.internal`,
        role,
        createdAt: new Date().toISOString(),
      };
      store.users.push(user);
    }
    const token = this.generateToken(user);
    return { user, token };
  }
}

export const authService = new AuthService();
