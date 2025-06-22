'use client'
import MainWrapper from "@/components/common/users/MainWrapper";
import { usePathname } from "next/navigation";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const showSidebar = !pathname.startsWith("/ban-be");

    return (
        <>
            <MainWrapper showSidebar={showSidebar}>
                {children}
            </MainWrapper>
        </>

    );
}
