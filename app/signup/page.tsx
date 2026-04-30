
'use client';

import { useActionState } from 'react';
import { signup } from '@/actions/auth';
import Link from 'next/link';
import { Smartphone, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignupPage() {
    const [state, action, isPending] = useActionState(signup, null);

    return (
        <div className="flex min-h-screen items-center justify-center bg-accent/20 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-card border rounded-2xl shadow-xl p-8"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary/10 p-3 rounded-xl mb-4">
                        <Smartphone className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Create Account</h1>
                    <p className="text-muted-foreground">Start selling your gadgets today</p>
                </div>

                <form action={action} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input
                            name="name"
                            type="text"
                            required
                            className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <div className="flex w-full border rounded-lg bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
                            <span className="flex items-center pl-4 pr-3 border-r border-border bg-muted/20 text-muted-foreground font-medium text-sm">+91</span>
                            <input
                                name="phone"
                                type="tel"
                                required
                                pattern="[0-9]{10}"
                                maxLength={10}
                                onChange={(e) => {
                                    e.target.value = e.target.value.replace(/\D/g, '');
                                }}
                                className="w-full h-12 px-4 outline-none bg-transparent"
                                placeholder="9876543210"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {state?.error && (
                        <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg text-center">
                            {state.error}
                        </div>
                    )}

                    <button
                        disabled={isPending}
                        className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                        {isPending ? <Loader2 className="animate-spin" /> : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm">
                    Already have an account? {' '}
                    <Link href="/login" className="text-primary font-bold hover:underline">
                        Log In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
