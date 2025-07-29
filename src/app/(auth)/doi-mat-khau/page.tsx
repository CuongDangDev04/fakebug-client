import ResetPasswordCard from "@/components/auth/ResetPasswordCard";
import { Suspense } from "react";

export default function ResetPasswordPage() {
    return (
        <>
            <Suspense fallback={null}>
                <ResetPasswordCard />
            </Suspense>
        </>
    )

}