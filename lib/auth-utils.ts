
export interface SessionUser {
    id: string;
    email: string;
    name: string;
    role: string;
    cityId?: string | null;
}

export interface SessionPayload {
    user: SessionUser;
    expires: Date | string;
    iat?: number;
    exp?: number;
}

export const ADMIN_EMAILS = ['admin@fonzkart.com', 'mobilesouls.in@gmail.com'];

export function isAdmin(user: SessionUser) {
    if (!user) return false;
    return ADMIN_EMAILS.includes(user.email) || ['ADMIN', 'SUPER_ADMIN', 'ZONAL_HEAD', 'RELATIONSHIP_MANAGER', 'PARTNER', 'FIELD_EXECUTIVE'].includes(user.role);
}
