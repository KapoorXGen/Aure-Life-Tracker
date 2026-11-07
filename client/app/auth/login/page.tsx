"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";

import EmailInput from "@/components/ui/EmailInput";
import PasswordInput from "@/components/ui/PasswordInput";

import styles from "./Login.module.css";

const Login = () => {
    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Common Form Error State
    const [formError, setFormError] = useState("");

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

    // Form Submission Handler
    const handleLogin = (event: FormEvent<HTMLFormElement>) => {
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

        // Validate Password
        if (!password.trim()) {
            setFormError("Password is required");
            return;
        }

        // Clear Form Error
        setFormError("");

        // Login Logic Will Be Implemented Later
    };

    return (
        <main className={styles.main}>
            {/* Login Introduction */}
            <section className={styles.loginIntro}>
                <div className={styles.loginIntroContent}>
                    <h1 className={styles.loginTitle}>
                        Welcome Back!
                    </h1>

                    <p className={styles.loginDescription}>
                        Log in to your account to continue and access your services.
                    </p>
                </div>
            </section>

            {/* Login Form Section */}
            <section className={styles.loginFormSection}>
                <form
                    className={styles.loginForm}
                    onSubmit={handleLogin}
                    noValidate
                >
                    {/* Email Input */}
                    <EmailInput
                        id="login-email"
                        label="Email"
                        placeholder="Enter your email"
                        icon={Mail}
                        value={email}
                        onChange={handleEmailChange}
                    />

                    {/* Password Input */}
                    <PasswordInput
                        id="login-password"
                        label="Password"
                        placeholder="Enter your password"
                        icon={Lock}
                        value={password}
                        onChange={handlePasswordChange}
                    />

                    {/* Forgot Password Navigation */}
                    <div className={styles.forgotPasswordWrapper}>
                        <Link
                            href="/auth/forgot-password"
                            className={styles.forgotPasswordLink}
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Common Form Error */}
                    {formError && (
                        <p
                            className={styles.formError}
                            role="alert"
                        >
                            {formError}
                        </p>
                    )}

                    {/* Login Button */}
                    <button
                        type="submit"
                        className={styles.loginButton}
                    >
                        Log In
                    </button>
                </form>

                {/* Signup Navigation */}
                <p className={styles.signupText}>
                    Don’t have an account?{" "}
                    <Link
                        href="/auth/register"
                        className={styles.signupLink}
                    >
                        Sign up
                    </Link>
                </p>
            </section>
        </main>
    );
};

export default Login;
