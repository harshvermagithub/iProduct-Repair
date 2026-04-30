
'use client';

import { useState } from 'react';
import { quickLogin, quickRegister } from '@/actions/inlineAuth';
import { Loader2, ArrowRight } from 'lucide-react';

interface StepLoginProps {
    onSuccess: (user: any) => void;
}

export default function StepLogin({ onSuccess }: StepLoginProps) {
    const [mode, setMode] = useState<'register' | 'login'>('register');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError('');

        try {
            const action = mode === 'register' ? quickRegister : quickLogin;
            const res = await action(formData);

            if (res.error) {
                setError(res.error);
            } else if (res.success && res.user) {
                onSuccess(res.user);
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto bg-card border rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-2">
                {mode === 'register' ? 'Your Details' : 'Welcome Back'}
            </h2>
            <p className="text-muted-foreground mb-6">
                {mode === 'register'
                    ? 'Please provide your details to view the final price and save your quote.'
                    : 'Sign in to view your offer.'}
            </p>

            <form action={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <input
                                name="name"
                                required
                                className="w-full p-2 border rounded-lg bg-background"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone Number</label>
                            <div className="flex items-center w-full border rounded-lg bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                                <span className="pl-3 pr-2 py-2 border-r border-border/50 text-muted-foreground font-medium text-sm bg-muted/20">+91</span>
                                <input
                                    name="phone"
                                    required
                                    type="tel"
                                    maxLength={10}
                                    onChange={(e) => {
                                        e.target.value = e.target.value.replace(/\D/g, '');
                                    }}
                                    className="w-full p-2 text-sm outline-none bg-transparent"
                                    placeholder="9876543210"
                                />
                            </div>
                        </div>
                    </>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full p-2 border rounded-lg bg-background"
                        placeholder="john@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <input
                        name="password"
                        type="password"
                        required
                        className="w-full p-2 border rounded-lg bg-background"
                        placeholder="••••••••"
                    />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                    disabled={isLoading}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-all flex justify-center items-center gap-2"
                >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                        <>
                            {mode === 'register' ? 'View Price' : 'Sign In'} <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-sm">
                {mode === 'register' ? (
                    <p className="text-muted-foreground">
                        Already have an account?{' '}
                        <button onClick={() => setMode('login')} className="text-primary font-bold hover:underline">
                            Sign in
                        </button>
                    </p>
                ) : (
                    <p className="text-muted-foreground">
                        New user?{' '}
                        <button onClick={() => setMode('register')} className="text-primary font-bold hover:underline">
                            Create account
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}
