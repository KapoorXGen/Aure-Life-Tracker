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
        const safeResetURL = resetURL
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const currentYear = new Date().getFullYear();

        const { error } = await resend.emails.send({
            from: "Aure <onboarding@resend.dev>",
            to: user.email,
            subject: "Reset your password | AURE",

            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta name="color-scheme" content="light">
                    <meta name="supported-color-schemes" content="light">
                    <title>Reset your password | AURE</title>
                </head>

                <body style="
                    margin:0;
                    padding:0;
                    background-color:#ffffff;
                    font-family:Arial, Helvetica, sans-serif;
                    color:#000000;
                    -webkit-font-smoothing:antialiased;
                ">

                <!-- Preheader -->
                <div style="
                    display:none;
                    max-height:0;
                    overflow:hidden;
                    opacity:0;
                    color:transparent;
                ">
                    Reset your AURE account password securely.
                </div>

                <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                    style="background-color:#ffffff;"
                >
                <tr>
                <td align="center" style="padding:45px 20px;">

                    <table
                        role="presentation"
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                        style="max-width:560px;"
                    >

                        <!-- Brand -->
                        <tr>
                            <td align="center" style="padding:20px 0 65px;">

                                <h2 style="
                                    margin:0;
                                    font-size:32px;
                                    line-height:1;
                                    font-weight:800;
                                    letter-spacing:5px;
                                    color:#000000;
                                ">
                                    AURE.
                                </h2>

                            </td>
                        </tr>

                        <!-- Main Heading -->
                        <tr>
                            <td align="center">

                                <h1 style="
                                    margin:0;
                                    font-size:52px;
                                    line-height:1.04;
                                    font-weight:700;
                                    letter-spacing:-2.5px;
                                    color:#000000;
                                ">
                                    Reset your<br>
                                    password.
                                </h1>

                            </td>
                        </tr>

                        <!-- Description -->
                        <tr>
                            <td align="center" style="padding:28px 15px 35px;">

                                <p style="
                                    margin:0 0 15px;
                                    font-size:18px;
                                    line-height:1.5;
                                    font-weight:500;
                                    color:#343944;
                                ">
                                    A fresh start is just one step away.
                                </p>

                                <p style="
                                    margin:0 auto;
                                    max-width:420px;
                                    font-size:15px;
                                    line-height:1.8;
                                    color:#666666;
                                ">
                                    We received a request to reset the password
                                    associated with your AURE account.
                                    Click below to create a new one.
                                </p>

                            </td>
                        </tr>
                    
                        <!-- CTA -->
                        <tr>
                            <td align="center" style="padding:10px 0 25px;">

                                <table
                                    role="presentation"
                                    width="100%"
                                    cellspacing="0"
                                    cellpadding="0"
                                    border="0"
                                    style="max-width:420px;"
                                >
                                    <tr>
                                        <td
                                            align="center"
                                            bgcolor="#000000"
                                            style="
                                                background-color:#000000;
                                                border-radius:50px;
                                            "
                                        >
                                            <a
                                                href="${safeResetURL}"
                                                target="_blank"
                                                style="
                                                    display:block;
                                                    padding:19px 25px;
                                                    font-size:16px;
                                                    line-height:20px;
                                                    font-weight:600;
                                                    letter-spacing:0.4px;
                                                    color:#ffffff;
                                                    text-decoration:none;
                                                    text-align:center;
                                                    border-radius:50px;
                                                "
                                                >
                                                RESET PASSWORD
                                            </a>
                                        </td>
                                    </tr>
                                </table>

                            </td>
                        </tr>

                        <!-- Expiry -->
                        <tr>
                            <td align="center" style="padding:5px 15px 45px;">

                                <p style="
                                    margin:0;
                                    font-size:13px;
                                    line-height:1.7;
                                    color:#888888;
                                ">
                                    This password reset link expires in 15 minutes.
                                </p>

                            </td>
                        </tr>               

                        <!-- Divider -->
                        <tr>
                            <td style="
                                border-top:1px solid #eeeeee;
                                font-size:0;
                                line-height:0;
                            ">
                                &nbsp;
                            </td>
                        </tr>

                        <!-- Fallback Link -->
                        <tr>
                            <td align="left" style="padding:30px 5px 20px;">

                                <p style="
                                    margin:0 0 12px;
                                    font-size:13px;
                                    line-height:1.6;
                                    color:#777777;
                                ">
                                    Having trouble with the button?
                                    Copy and paste this link into your browser.
                                </p>

                                <a
                                    href="${safeResetURL}"
                                    target="_blank"
                                    style="
                                        font-size:12px;
                                        line-height:1.7;
                                        color:#000000;
                                        word-break:break-all;
                                        text-decoration:underline;
                                    "
                                >
                                    ${safeResetURL}
                                </a>

                            </td>
                        </tr>   

                        <!-- Security Notice -->
                        <tr>
                            <td align="center" style="padding:30px 15px 45px;">

                                <p style="
                                    margin:0;
                                    max-width:430px;
                                    font-size:13px;
                                    line-height:1.8;
                                    color:#888888;
                                ">
                                    Didn't request a password reset?
                                    You can safely ignore this email.
                                    Your account password will remain unchanged.
                                </p>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="
                                border-top:1px solid #eeeeee;
                                padding:30px 10px 10px;
                            ">

                                <p style="
                                    margin:0;
                                    font-size:12px;
                                    line-height:1.6;
                                    letter-spacing:0.5px;
                                    color:#aaaaaa;
                                ">
                                    © ${currentYear} AURE. ALL RIGHTS RESERVED.
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

export const resetPassword = async (req: Request, res: Response) => {
    try {
        // 1. Extract request data
        const { token, newPassword, confirmPassword } = req.body ?? {};

        // 2. Validate input types and required fields
        if (
            typeof token !== "string" ||
            typeof newPassword !== "string" ||
            typeof confirmPassword !== "string" ||
            !token.trim() ||
            !newPassword ||
            !confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message: "Token, new password, and confirm password are required.",
            });
        }

        // 3. Validate password length
        if (newPassword.length < 8 || newPassword.length > 128) {
            return res.status(400).json({
                success: false,
                message: "Password must be between 8 and 128 characters.",
            });
        }

        // 4. Confirm passwords
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match.",
            });
        }

        // 5. Hash incoming raw token
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // 6. Find user with a valid, unexpired reset token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetTokenExpiry: { $gt: new Date() },
        }).select("+passwordResetToken +passwordResetTokenExpiry");

        // 7. Reject invalid or expired tokens
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired password reset token.",
            });
        }

        // 8. Hash the new password
        const newPasswordHash = await argon2.hash(newPassword, {
            type: argon2.argon2id,
        });

        // 9. Update password and clear reset token
        user.passwordHash = newPasswordHash;
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiry = undefined;

        await user.save();

        // 10. Send success response
        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully. Please log in with your new password.",
        });

    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};