"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

import EmailInput from "@/components/ui/EmailInput";

import styles from "./ForgotPassword.module.css";

const ForgotPassword = () => {
    // Form State
    const [email, setEmail] = useState("");

    // Form Feedback States
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Email Change Handler
    const handleEmailChange = (value: string) => {
        setEmail(value);

        if (formError) {
            setFormError("");
        }

        if (successMessage) {
            setSuccessMessage("");
        }
    };

    // Form Submission Handler
    const handleForgotPassword = (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        // Validate Email
        if (!email.trim()) {
            setFormError("Email is required");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setFormError("Please enter a valid email address");
            return;
        }

        // Clear Previous Feedback
        setFormError("");

        // Password Reset Email Logic Will Be Implemented Later
        setSuccessMessage(
            "If an account exists with this email, you will receive a password reset link."
        );
    };

    return (
        <main className={styles.main}>

            {/* Forgot Password Introduction */}
            <section className={styles.forgotPasswordIntro}>
                <div className={styles.forgotPasswordIntroContent}>
                    <h1 className={styles.forgotPasswordTitle}>
                        Forgot Password?
                    </h1>

                    <p className={styles.forgotPasswordDescription}>
                        Don't worry! Enter your registered email address
                        and we'll help you reset your password.
                    </p>
                </div>
            </section>

            {/* Forgot Password Form Section */}
            <section className={styles.forgotPasswordFormSection}>
                <form
                    className={styles.forgotPasswordForm}
                    onSubmit={handleForgotPassword}
                    noValidate
                >

                    {/* Email Input */}
                    <EmailInput
                        id="forgot-password-email"
                        label="Email"
                        placeholder="Enter your registered email"
                        icon={Mail}
                        value={email}
                        onChange={handleEmailChange}
                    />

                    {/* Common Form Error */}
                    {formError && (
                        <p
                            className={styles.formError}
                            role="alert"
                        >
                            {formError}
                        </p>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                        <p
                            className={styles.successMessage}
                            role="status"
                        >
                            {successMessage}
                        </p>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={styles.forgotPasswordButton}
                    >
                        Send Reset Link
                    </button>
                </form>

                {/* Login Navigation */}
                <p className={styles.loginText}>
                    Remember your password?{" "}
                    <Link
                        href="/auth/login"
                        className={styles.loginLink}
                    >
                        Log in
                    </Link>
                </p>
            </section>
        </main>
    );
};

export default ForgotPassword;
