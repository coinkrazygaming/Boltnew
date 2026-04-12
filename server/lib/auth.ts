import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { query } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthToken {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): AuthToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthToken;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Sign up user
 */
export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<User> {
  // Check if user already exists
  const existingUser = await query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const result = await query(
    "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name",
    [email, hashedPassword, name || email.split("@")[0]]
  );

  if (result.rows.length === 0) {
    throw new Error("Failed to create user");
  }

  return result.rows[0] as User;
}

/**
 * Sign in user
 */
export async function signIn(email: string, password: string): Promise<{ user: User; token: string }> {
  // Find user
  const result = await query(
    "SELECT id, email, name, password_hash FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid credentials");
  }

  const user = result.rows[0] as any;

  // Verify password
  const isValidPassword = await verifyPassword(password, user.password_hash);
  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  // Generate token
  const token = generateToken(user.id, user.email);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const result = await query(
    "SELECT id, email, name FROM users WHERE id = $1",
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as User;
}

/**
 * Create admin user
 */
export async function createAdminUser(
  email: string,
  password: string,
  name?: string
): Promise<User> {
  const hashedPassword = await hashPassword(password);

  const result = await query(
    "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET password_hash = $2 RETURNING id, email, name",
    [email, hashedPassword, name || email.split("@")[0]]
  );

  if (result.rows.length === 0) {
    throw new Error("Failed to create user");
  }

  return result.rows[0] as User;
}
