'use client'
import MainWrapper from "@/components/common/users/MainWrapper";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <>
            <MainWrapper  >
                {children}
            </MainWrapper>
        </>

    );
}
