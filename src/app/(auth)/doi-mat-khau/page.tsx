import ResetPasswordCard from "@/components/auth/ResetPasswordCard";
import { Suspense } from "react";
export const metadata = {
    title: 'Đổi mật khẩu',
};
export default function ResetPasswordPage() {
    return (
        <>
            <Suspense fallback={null}>
                <ResetPasswordCard />
            </Suspense>
        </>
    )

}