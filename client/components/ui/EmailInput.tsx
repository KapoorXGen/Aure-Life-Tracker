import type { LucideIcon } from "lucide-react";

import styles from "./EmailInput.module.css";

// Props Interface
interface EmailInputProps {
    id: string;
    label: string;
    placeholder: string;
    icon: LucideIcon;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
}

// Email Input Component
const EmailInput = ({
    id,
    label,
    placeholder,
    icon: Icon,
    value,
    onChange,
    required
}: EmailInputProps) => {

    return (
        <div className={styles.container}>
            {/* Input Label */}
            <label
                htmlFor={id}
                className={styles.label}
            >
                {label}
            </label>

            {/* Email Input Wrapper */}
            <div className={styles.inputWrapper}>
                <Icon className={styles.icon} />

                <input
                    className={styles.input}
                    type="email"
                    id={id}
                    name="email"
                    placeholder={placeholder}
                    value={value}
                    required={required}
                    onChange={(event) => onChange(event.target.value)}
                />
            </div>
        </div>
    );
};

export default EmailInput;