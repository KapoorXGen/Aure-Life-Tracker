"use client";

import { ViewTransition } from "react";
import { usePathname } from "next/navigation";

export default function Template({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const isLogin = pathname.endsWith("/login");
    const isRegister = pathname.endsWith("/register");

    return (
        <ViewTransition
            enter={
                isLogin
                    ? "page-in-left"
                    : isRegister
                        ? "page-in-right"
                        : "page-enter"
            }
            exit={
                isLogin
                    ? "page-out-left"
                    : isRegister
                        ? "page-out-right"
                        : "page-exit"
            }
            default="none"
        >
            {children}
        </ViewTransition>
    );
}
