"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { UserRound, Mail, Lock } from "lucide-react";

import EmailInput from "@/components/ui/EmailInput";
import PasswordInput from "@/components/ui/PasswordInput";

import styles from "./Register.module.css";

const Register = () => {
    // Form States
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Common Form Error State
    const [formError, setFormError] = useState("");

    // Full Name Change Handler
    const handleFullNameChange = (value: string) => {
        setFullName(value);

        if (formError) {
            setFormError("");
        }
    };

    // Email Change Handler
    const handleEmailChange = (value: string) => {
        setEmail(value);

        if (formError) {
            setFormError("");
        }
    };

    // Password Change Handler
    const handlePasswordChange = (value: string) => {
        setPassword(value);

        if (formError) {
            setFormError("");
        }
    };

    // Confirm Password Change Handler
    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);

        if (formError) {
            setFormError("");
        }
    };

    // Form Submission Handler
    const handleRegister = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Validate Full Name
        if (!fullName.trim()) {
            setFormError("Full name is required");
            return;
        }

        // Validate Email
        if (!email.trim()) {
            setFormError("Email is required");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setFormError("Please enter a valid email address");
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

        // Clear Form Error
        setFormError("");

        // Registration Logic Will Be Implemented Later
    };

    return (
        <main className={styles.main}>
            {/* Register Introduction */}
            <section className={styles.registerIntro}>
                <div className={styles.registerIntroContent}>
                    <h1 className={styles.registerTitle}>
                        Create Account
                    </h1>

                    <p className={styles.registerDescription}>
                        Create your account to get started and enjoy our services.
                    </p>
                </div>
            </section>

            {/* Register Form Section */}
            <section className={styles.registerFormSection}>
                <form
                    className={styles.registerForm}
                    onSubmit={handleRegister}
                    noValidate
                >
                    {/* Full Name Input */}
                    <div className={styles.fullNameInput}>
                        <label htmlFor="register-name">
                            Full Name
                        </label>

                        <div>
                            <UserRound aria-hidden="true" />

                            <input
                                type="text"
                                id="register-name"
                                name="fullName"
                                placeholder="Enter your full name"
                                value={fullName}
                                onChange={(event) =>
                                    handleFullNameChange(event.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <EmailInput
                        id="register-email"
                        label="Email"
                        placeholder="Enter your email"
                        icon={Mail}
                        value={email}
                        onChange={handleEmailChange}
                    />

                    {/* Password Input */}
                    <PasswordInput
                        id="register-password"
                        label="Password"
                        placeholder="Enter your password"
                        icon={Lock}
                        value={password}
                        onChange={handlePasswordChange}
                    />

                    {/* Confirm Password Input */}
                    <PasswordInput
                        id="confirm-password"
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        icon={Lock}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                    />

                    {/* Common Form Error */}
                    {formError && (
                        <p role="alert">
                            {formError}
                        </p>
                    )}

                    {/* Register Button */}
                    <button type="submit">
                        Create Account
                    </button>
                </form>

                {/* Login Navigation */}
                <p>
                    Already have an account?{" "}
                    <Link href="/auth/login">
                        Log in
                    </Link>
                </p>
            </section>
        </main>
    );
};

export default Register;