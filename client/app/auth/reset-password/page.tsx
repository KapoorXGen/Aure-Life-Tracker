"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useSearchParams } from "next/navigation";

import PasswordInput from "@/components/ui/PasswordInput";
import ImageTrail from "@/components/ImageTrail/ImageTrail";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

import API_BASE_URL from "@/lib/api";

import styles from "./ResetPassword.module.css";

gsap.registerPlugin(useGSAP, SplitText);

const resetPasswordDescription =
    "Create a new password for your account. Make sure it is secure and easy for you to remember.";

const ResetPassword = () => {
    const resetPasswordDescriptionRef = useRef<HTMLParagraphElement>(null);
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    // Form States
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Form Feedback States
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Description Text Reveal Animation
    useGSAP(() => {
        if (!resetPasswordDescriptionRef.current) return;

        const split = SplitText.create(
            resetPasswordDescriptionRef.current,
            {
                type: "lines",
                mask: "lines",
                linesClass: "line",
            }
        );

        gsap.set(split.lines, {
            yPercent: 100,
        });

        gsap.to(split.lines, {
            yPercent: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            delay: 1.5,
        });
    }, {
        scope: resetPasswordDescriptionRef,
    });

    // Password Change Handler
    const handlePasswordChange = (value: string) => {
        setPassword(value);

        if (formError) {
            setFormError("");
        }

        if (successMessage) {
            setSuccessMessage("");
        }
    };

    // Confirm Password Change Handler
    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);

        if (formError) {
            setFormError("");
        }

        if (successMessage) {
            setSuccessMessage("");
        }
    };

    // Form Submission Handler
    const handleResetPassword = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        // Validate Reset Token
        if (!token) {
            setFormError("Invalid or missing reset link.");
            return;
        }

        // Validate Password
        if (!password.trim()) {
            setFormError("Password is required");
            return;
        }

        // Validate Confirm Password
        if (!confirmPassword.trim()) {
            setFormError("Please confirm your password");
            return;
        }

        // Check Password Match
        if (password !== confirmPassword) {
            setFormError("Passwords do not match");
            return;
        }

        // Clear Previous Feedback
        setFormError("");
        setSuccessMessage("");

        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    newPassword: password,
                    confirmPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setFormError(data.message || "Password reset failed.");
                return;
            }

            setSuccessMessage(
                data.message || "Your password has been reset successfully."
            );

        } catch (error) {
            console.error("Reset password error:", error);
            setFormError("Unable to connect to the server. Please try again.");
        }
    };

    return (
        <main className={styles.main}>
            <ImageTrail />

            {/* Reset Password Introduction */}
            <section className={styles.resetPasswordIntro}>
                <div className={styles.resetPasswordIntroContent}>
                    <h1 className={styles.resetPasswordTitle}>
                        Reset Password
                    </h1>

                    <p
                        className={styles.resetPasswordDescription}
                        ref={resetPasswordDescriptionRef}
                    >
                        {resetPasswordDescription}
                    </p>
                </div>
            </section>

            {/* Reset Password Form Section */}
            <section className={styles.resetPasswordFormSection}>
                <form
                    className={styles.resetPasswordForm}
                    onSubmit={handleResetPassword}
                    noValidate
                >
                    {/* New Password Input */}
                    <PasswordInput
                        id="reset-password"
                        label="New Password"
                        placeholder="Enter your new password"
                        icon={Lock}
                        value={password}
                        onChange={handlePasswordChange}
                    />

                    {/* Confirm Password Input */}
                    <PasswordInput
                        id="confirm-reset-password"
                        label="Confirm Password"
                        placeholder="Confirm your new password"
                        icon={Lock}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
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
                        className={styles.resetPasswordButton}
                    >
                        Reset Password
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

export default ResetPassword;