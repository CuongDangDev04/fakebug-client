import GoogleCallback from "@/components/auth/GoogleCallback";
import { Suspense } from "react";
export const metadata = {
    title: 'Google callback',
};
export default function GoogleCallbackPage() {
    return (
        <>
            <Suspense fallback={null}>

                <GoogleCallback />
            </Suspense>
        </>
    )
}