import { RequestHandler } from "express";
import { signUp, signIn, createAdminUser } from "../lib/auth";

export const handleSignUp: RequestHandler = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await signUp(email, password, name);

    res.status(201).json({
      user,
      message: "User created successfully",
    });
  } catch (error: any) {
    console.error("Sign up error:", error);
    res.status(400).json({ error: error.message || "Failed to sign up" });
  }
};

export const handleSignIn: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { user, token } = await signIn(email, password);

    res.json({
      user,
      token,
      message: "Signed in successfully",
    });
  } catch (error: any) {
    console.error("Sign in error:", error);
    res.status(401).json({ error: error.message || "Failed to sign in" });
  }
};

export const handleCreateAdminUser: RequestHandler = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await createAdminUser(email, password, name);

    res.status(201).json({
      user,
      message: "Admin user created successfully",
    });
  } catch (error: any) {
    console.error("Create admin user error:", error);
    res.status(400).json({ error: error.message || "Failed to create user" });
  }
};
