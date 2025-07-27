'use client';
import HeaderUser from "@/components/common/users/HeaderUser";
import AppInit from "./AppInit";
import MobileBottomNav from "@/components/common/users/MobileBottomNav"; // ✅ Import

export default function MainWrapper({
    children,
}: {
    children: React.ReactNode;
}) {

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

            <div className="md:hidden">
                <MobileBottomNav />
            </div>
        </div>
    );
}
