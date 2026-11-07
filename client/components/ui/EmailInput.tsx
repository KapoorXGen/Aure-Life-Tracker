
import type { LucideIcon } from "lucide-react";
import styles from "./EmailInput.module.css";

interface EmailInputProps {
    id: string;
    label: string;
    placeholder: string;
    icon: LucideIcon;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
}

const EmailInput = ({
    id,
    label,
    placeholder,
    icon: Icon,
    value,
    onChange,
    error,
    required
}: EmailInputProps) => {
    return (
        <div className={styles.container}>
            <label htmlFor={id} className={styles.label}>
                {label}
            </label>

            <div className={styles.inputWrapper}>
                <Icon className={styles.icon} />
                <input
                    className={styles.input}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${id}-error` : undefined}
                    type="email"
                    id={id}
                    name="email"
                    placeholder={placeholder}
                    value={value}
                    required={required}
                    onChange={(event) => onChange(event.target.value)}
                />
            </div>

            {error && (
                <p className={styles.error} id={`${id}-error`}>
                    {error}
                </p>
            )}
        </div>
    );
};

export default EmailInput;
