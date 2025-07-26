'use client';
import HeaderUser from "@/components/common/users/HeaderUser";
import SidebarUser from "@/components/common/users/SidebarUser";
import { useState } from "react";
import AppInit from "./AppInit";
import { usePathname } from "next/navigation";
import MobileBottomNav from "@/components/common/users/MobileBottomNav"; // ✅ Import

export default function MainWrapper({
    children,
    showSidebar = false,
}: {
    children: React.ReactNode;
    showSidebar?: boolean;
}) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();
    const isHome = pathname === "/";

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#18191A]">
            {/* Header */}
            <HeaderUser onMenuClick={() => setIsMobileOpen(true)} />

            {/* Main layout */}
            <div className="pt-[65px] flex relative">
                {showSidebar && isHome && (
                    <SidebarUser
                        isMobileOpen={isMobileOpen}
                        onClose={() => setIsMobileOpen(false)}
                    />
                )}

                <main
                    className={`flex-1 max-w-full mx-auto w-full pb-[72px] md:pb-6 ${showSidebar && isHome ? "lg:pl-[336px]" : ""
                        }`}
                >
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
