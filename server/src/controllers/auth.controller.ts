
import type { Request, Response } from "express";
import User from "../models/User.js";
import argon2 from "argon2";

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { fullName, email, password, confirmPassword } = req.body ?? {};

        // 1. Validate input types
        if (
            typeof fullName !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            typeof confirmPassword !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields must be valid strings.",
            });
        }

        // 2. Normalize input
        const normalizedName = fullName.trim();
        const normalizedEmail = email.trim().toLowerCase();

        // 3. Check required fields
        if (!normalizedName || !normalizedEmail || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        // 4. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
        }

        // 5. Validate password length
        if (password.length < 8 || password.length > 128) {
            return res.status(400).json({
                success: false,
                message: "Password must be between 8 and 128 characters.",
            });
        }

        // 6. Confirm password
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match.",
            });
        }

        // 7. Check existing user
        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered.",
            });
        }

        // 8. Hash password
        const passwordHash = await argon2.hash(password, {
            type: argon2.argon2id,
        });

        // 9. Create user
        const newUser = await User.create({
            fullName: normalizedName,
            email: normalizedEmail,
            passwordHash,
        });

        // 10. Send success response
        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
            },
        });

    } catch (error) {
        // Handle duplicate email race condition
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000
        ) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered.",
            });
        }

        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};
