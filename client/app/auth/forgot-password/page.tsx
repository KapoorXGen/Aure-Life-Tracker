"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

import EmailInput from "@/components/ui/EmailInput";
import ImageTrail from "@/components/ImageTrail/ImageTrail";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

import styles from "./ForgotPassword.module.css";

gsap.registerPlugin(useGSAP, SplitText);

const forgotPasswordDescription =
    "Don't worry! Enter your registered email address and we'll help you reset your password.";

const ForgotPassword = () => {
    const forgotPasswordDescriptionRef = useRef<HTMLParagraphElement>(null);

    // Description Text Reveal Animation
    useGSAP(() => {
        if (!forgotPasswordDescriptionRef.current) return;

        const split = SplitText.create(
            forgotPasswordDescriptionRef.current,
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
        scope: forgotPasswordDescriptionRef,
    });

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
            <ImageTrail />

            {/* Forgot Password Introduction */}
            <section className={styles.forgotPasswordIntro}>
                <div className={styles.forgotPasswordIntroContent}>
                    <h1 className={styles.forgotPasswordTitle}>
                        Forgot Password?
                    </h1>

                    <p
                        className={styles.forgotPasswordDescription}
                        ref={forgotPasswordDescriptionRef}
                    >
                        {forgotPasswordDescription}
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