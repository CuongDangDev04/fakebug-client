'use client'
import HeaderUser from "@/components/common/users/HeaderUser";
import SidebarUser from "@/components/common/users/SidebarUser";
import { useState } from "react";
import AppInit from "./AppInit";

export default function MainWrapper({ children, showSidebar = false, }: { children: React.ReactNode; showSidebar?: boolean; }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#18191A]">
            <HeaderUser onMenuClick={() => setIsMobileOpen(true)} />
            <div className="pt-[65px] flex relative">
                {showSidebar && (
                    <SidebarUser
                        isMobileOpen={isMobileOpen}
                        onClose={() => setIsMobileOpen(false)}
                    />
                )}
                <main
                    className={`flex-1  max-w-full mx-auto w-full pb-20 md:pb-6 ${showSidebar ? "lg:pl-[336px]" : ""
                        }`}
                >
                    <AppInit/>
                    {children}
                </main>
            </div>
        </div>
    );
}
