"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

import styles from "./Login.module.css";
import EmailInput from "@/components/ui/EmailInput";

const Login = () => {
    // Email State
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    // Form Submission Handler
    const handleLogin = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Check Empty Email
        if (!email.trim()) {
            setEmailError("Email is required");
            return;
        }

        // Validate Email Format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setEmailError("Please enter a valid email address");
            return;
        }

        // Clear Email Error
        setEmailError("");
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);

        if (emailError) {
            setEmailError("");
        }
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

            {/* Login Form */}
            <section className={styles.loginFormSection}>
                <form
                    className={styles.loginForm}
                    onSubmit={handleLogin}
                    noValidate
                >
                    <EmailInput
                        id="login-email"
                        label="Email"
                        placeholder="Enter your email"
                        icon={Mail}
                        value={email}
                        onChange={handleEmailChange}
                        error={emailError}
                    />

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
