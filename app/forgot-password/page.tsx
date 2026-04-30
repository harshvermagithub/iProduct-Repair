'use client';

import { useActionState, useState } from 'react';
import { requestPasswordReset, verifyAndResetPassword } from '@/actions/auth';
import Link from 'next/link';
import { KeyRound, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
    const [requestState, requestAction, isRequestPending] = useActionState(requestPasswordReset, null);
    const [verifyState, verifyAction, isVerifyPending] = useActionState(verifyAndResetPassword, null);

    const [email, setEmail] = useState('');

    const step = requestState?.step === 'verify' ? 'verify' : 'request';

    return (
        <div className="flex min-h-screen items-center justify-center bg-accent/20 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-card border rounded-2xl shadow-xl p-8"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary/10 p-3 rounded-xl mb-4">
                        {step === 'request' ? <KeyRound className="w-8 h-8 text-primary" /> : <ShieldCheck className="w-8 h-8 text-primary" />}
                    </div>
                    <h1 className="text-2xl font-bold">Verify & Reset Password</h1>
                    <p className="text-muted-foreground text-center mt-2">
                        {step === 'request'
                            ? "Enter your registered email address to recover your account."
                            : "Enter the 6-digit OTP sent to your email and your new password."}
                    </p>
                </div>

                {verifyState?.success ? (
                    <div className="text-center space-y-6">
                        <div className="p-4 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-xl font-medium">
                            {verifyState.success}
                        </div>
                        <Link href="/login" className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                            Go to Login
                        </Link>
                    </div>
                ) : step === 'request' ? (
                    <form action={requestAction} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Registered Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="john@example.com"
                            />
                        </div>


                        {requestState?.error && (
                            <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg text-center">
                                {requestState.error}
                            </div>
                        )}

                        <button
                            disabled={isRequestPending}
                            className="w-full h-12 mt-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                        >
                            {isRequestPending ? <Loader2 className="animate-spin" /> : 'Send OTP'}
                        </button>

                        <div className="pt-6 text-center">
                            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 font-medium transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back to Login
                            </Link>
                        </div>
                    </form>
                ) : (
                    <form action={verifyAction} className="space-y-4">
                        <input type="hidden" name="email" value={email} />

                        <div className="p-3 bg-primary/10 text-primary text-xs rounded-lg text-center font-medium">
                            {requestState?.success}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Enter 6-digit OTP</label>
                            <input
                                name="otp"
                                type="text"
                                required
                                maxLength={6}
                                className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-center font-mono text-xl tracking-[0.5em] transition-all"
                                placeholder="------"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">New Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {verifyState?.error && (
                            <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg text-center">
                                {verifyState.error}
                            </div>
                        )}

                        <button
                            disabled={isVerifyPending}
                            className="w-full h-12 mt-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                        >
                            {isVerifyPending ? <Loader2 className="animate-spin" /> : 'Verify & Reset Password'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
