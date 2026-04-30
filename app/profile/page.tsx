import { getSession } from "@/lib/session"
import { db } from "@/lib/store";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
    const session = await getSession();

    if (!session?.user) {
        redirect('/login');
    }

    const { email } = session.user;
    const dbUser = await db.findUserByEmail(email);

    if (!dbUser) {
        redirect('/login');
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
                <ProfileForm user={{ ...session.user, phone: dbUser.phone }} />
            </div>
        </div>
    )
}
