import type { Request, Response } from "express";
import User from "../models/User.js";
import argon2 from "argon2";
import crypto from "node:crypto";
import resend from "../config/resend.js";

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

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body ?? {};

        // 1. Validate input types and required fields
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        // 2. Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // 3. Find user and explicitly retrieve password hash
        const user = await User.findOne({
            email: normalizedEmail,
        }).select("+passwordHash");

        // 4. Check whether user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // 5. Verify password
        const isPasswordValid = await argon2.verify(
            user.passwordHash,
            password
        );

        // 6. Reject invalid password
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // 7. Return successful login response
        return res.status(200).json({
            success: true,
            message: "Login successful.",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};


export const forgotPassword = async (req: Request, res: Response) => {
    try {
        // 1. Extract email
        const { email } = req.body ?? {};

        // 2. Validate email type and value
        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
        }

        // 3. Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // 4. Find user
        const user = await User.findOne({
            email: normalizedEmail,
        });

        // 5. Prevent user enumeration
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, you will receive a password reset link.",
            });
        }

        // 6. Generate secure random token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // 7. Hash reset token
        const hashedResetToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // 8. Set token expiry (15 minutes)
        const resetTokenExpiry = new Date(
            Date.now() + 15 * 60 * 1000
        );

        // 9. Save hashed token and expiry
        user.passwordResetToken = hashedResetToken;
        user.passwordResetTokenExpiry = resetTokenExpiry;

        await user.save();

        // 10. Generate reset URL
        const resetURL = `http://localhost:3000/auth/reset-password?token=${encodeURIComponent(resetToken)}`;

        // 11. Send password reset email
        const { error } = await resend.emails.send({
            from: "Aure <onboarding@resend.dev>",
            to: user.email,
            subject: "Reset your Aure password",

            html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <title>Reset Your Password - Aure</title>
                    </head>

                    <body style="margin:0; padding:0; background-color:#ffffff; font-family:Arial, Helvetica, sans-serif; color:#000000;">

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;">
                            <tr>
                                <td align="center" style="padding:60px 20px;">

                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">

                                        <tr>
                                            <td align="center" style="padding-bottom:55px;">
                                                <h2 style="margin:0; font-size:22px; font-weight:800; letter-spacing:5px;">
                                                    AURE
                                                </h2>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td align="center">
                                                <h1 style="margin:0; font-size:52px; line-height:1.05; font-weight:800; letter-spacing:-2px; color:#000000;">
                                                    Reset<br />Password
                                                </h1>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td align="center" style="padding:24px 15px 35px;">
                                                <p style="margin:0; max-width:420px; font-size:19px; line-height:1.55; color:#263445;">
                                                    Create a new password for your Aure account.
                                                    Make sure it is secure and easy for you to remember.
                                                </p>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td align="center" style="padding:10px 0 25px;">
                                                <a href="${resetURL}"
                                                   style="display:inline-block; width:100%; max-width:420px; box-sizing:border-box; padding:17px 25px; background-color:#000000; color:#ffffff; text-decoration:none; text-align:center; font-size:17px; font-weight:600; border-radius:40px;">
                                                    Reset Password
                                                </a>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td align="center" style="padding:12px 15px;">
                                                <p style="margin:0; font-size:14px; line-height:1.7; color:#64748b;">
                                                    This password reset link expires in 15 minutes.
                                                </p>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td align="center" style="padding:15px 20px;">
                                                <p style="margin:0 0 8px; font-size:13px; color:#64748b;">
                                                    If the button doesn't work, copy this link:
                                                </p>
                                                <a href="${resetURL}" style="font-size:12px; color:#000000; word-break:break-all;">
                                                    ${resetURL}
                                                </a>
                                            </td>
                                       </tr>

                                        <tr>
                                            <td align="center" style="padding:30px 20px 10px;">
                                                <p style="margin:0; font-size:13px; line-height:1.7; color:#64748b;">
                                                    Didn't request a password reset? You can safely ignore this email.
                                                    Your account password will remain unchanged.
                                                </p>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td align="center" style="padding-top:45px;">
                                                <p style="margin:0; font-size:12px; color:#9ca3af;">
                                                    © ${new Date().getFullYear()} Aure. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>

                                    </table>

                                    </td>
                            </tr>
                        </table>

                    </body> 
                    </html>
                    `,
        });

        // 12. Handle email sending failure
        if (error) {
            console.error("Password reset email error:", error);

            // Clear unused reset token
            user.passwordResetToken = undefined;
            user.passwordResetTokenExpiry = undefined;

            await user.save();

            return res.status(500).json({
                success: false,
                message: "Unable to send password reset email. Please try again later.",
            });
        }

        // 13. Send success response
        return res.status(200).json({
            success: true,
            message: "If an account exists with this email, you will receive a password reset link.",
        });

    } catch (error) {
        console.error("Forgot password error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};
