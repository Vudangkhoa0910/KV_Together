import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface AuthResponse {
    status: string;
    message: string;
    user: any;
    token: string;
}

axios.defaults.withCredentials = true;

export default {
    async getCsrfCookie() {
        await axios.get('http://localhost:8000/sanctum/csrf-cookie');
    },

    async login(data: LoginData): Promise<AuthResponse> {
        await this.getCsrfCookie();
        const response = await axios.post(`${API_URL}/auth/login`, data);
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    async register(data: RegisterData): Promise<AuthResponse> {
        await this.getCsrfCookie();
        const response = await axios.post(`${API_URL}/auth/register`, data);
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    async logout(): Promise<void> {
        try {
            const token = this.getToken();
            if (token) {
                await axios.post(`${API_URL}/auth/logout`, {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    getToken(): string | null {
        const user = this.getCurrentUser();
        return user?.token || null;
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },

    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        return user?.user?.role === role;
    },

    isAdmin(): boolean {
        return this.hasRole('admin');
    },

    isStaff(): boolean {
        return this.hasRole('staff');
    },

    isUser(): boolean {
        return this.hasRole('user');
    }
}; 