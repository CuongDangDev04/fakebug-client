'use client';
import HeaderUser from "@/components/common/users/HeaderUser";
import { useState } from "react";
import AppInit from "./AppInit";
import { usePathname } from "next/navigation";
import MobileBottomNav from "@/components/common/users/MobileBottomNav"; // ✅ Import

export default function MainWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isHome = pathname === "/";

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#18191A]">
            {/* Header */}
            <HeaderUser   />

            {/* Main layout */}
            <div className="pt-[65px] flex relative">
                

                <main
                    className='  w-full  '>
                    <AppInit />
                    {children}
                </main>
            </div>

            {/* ✅ Mobile Bottom Navigation */}
            <div className="md:hidden">
                <MobileBottomNav />
            </div>
        </div>
    );
}
