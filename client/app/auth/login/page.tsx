import styles from "./Login.module.css";

const Login = () => {
    return (
        <main className={styles.main}>
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
            <section className={styles.loginFormSection}>

            </section>
        </main>
    );
}

export default Login;
