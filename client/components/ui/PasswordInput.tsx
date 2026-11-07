"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import styles from "./PasswordInput.module.css";

// Props Interface
interface PasswordInputProps {
    id: string;
    label: string;
    placeholder: string;
    icon: LucideIcon;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
}

// Password Input Component
const PasswordInput = ({
    id,
    label,
    placeholder,
    icon: Icon,
    value,
    onChange,
    required
}: PasswordInputProps) => {

    // Password Visibility State
    const [showPassword, setShowPassword] = useState(false);

    // Toggle Password Visibility
    const togglePasswordVisibility = () => {
        setShowPassword((previousState) => !previousState);
    };

    return (
        <div className={styles.container}>
            {/* Input Label */}
            <label
                htmlFor={id}
                className={styles.label}
            >
                {label}
            </label>

            {/* Password Input Wrapper */}
            <div className={styles.inputWrapper}>
                <Icon className={styles.icon} />

                <input
                    className={styles.input}
                    type={showPassword ? "text" : "password"}
                    id={id}
                    name="password"
                    placeholder={placeholder}
                    value={value}
                    required={required}
                    onChange={(event) => onChange(event.target.value)}
                />

                {/* Password Visibility Toggle */}
                <button
                    type="button"
                    className={styles.toggleButton}
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                >
                    {showPassword ? <EyeOff /> : <Eye />}
                </button>
            </div>
        </div>
    );
};

export default PasswordInput;