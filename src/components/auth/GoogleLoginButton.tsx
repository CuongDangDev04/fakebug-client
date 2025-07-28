'use client'
import { authService } from '@/services/authService';
import { useUserStore } from '@/stores/userStore';

export default function GoogleLoginButton() {
    const handleGoogleLogin = async () => {
        try {
            await authService.loginWithGoogle();
            const user = await authService.getInfoUser();
            if (user) {
                useUserStore.getState().setUser(user);
            }
        } catch (error) {
            console.error('Google login error:', error);
        }
    };


    return (
        <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white/50 border border-gray-200 hover:bg-white/70 py-3 px-4 rounded-xl transition-all duration-300 group"
        >
            <img
                src="/logo_google.png"
                alt="Google"
                className="w-6 h-6 group-hover:scale-110 transition-transform duration-300"
            />
            <span className="text-sm font-medium text-gray-700">Tiếp tục với Google</span>
        </button>
    );
}
