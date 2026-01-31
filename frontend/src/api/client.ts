import { toast } from "react-hot-toast";

const CONFIG = {
    apiBaseUrl: import.meta.env.PUBLIC_API_URL || "",
    authTokenKey: "auth_token",
} as const;

interface ApiOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    data?: unknown;
    token?: string | null;
    headers?: Record<string, string>;
    suppressToastOn?: number[];
}

export const getStoredToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(CONFIG.authTokenKey);
};

export async function apiFetch<T>(
    endpoint: string,
    options: ApiOptions = {},
): Promise<T> {
    const {
        method = "POST",
        data,
        token = getStoredToken(),
        headers = {},
        suppressToastOn = [409],
    } = options;

    const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...headers,
    };

    if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${CONFIG.apiBaseUrl}/api${endpoint}`, {
            method,
            headers: requestHeaders,
            body: data ? JSON.stringify(data) : undefined,
        });
        if (!response.ok) {
            const status = response.status;
            const errorData = await response.json().catch(() => ({}));
            const message = errorData.message ||
                errorData.error ||
                `Request failed with status ${status}`;

            if (!suppressToastOn.includes(status)) {
                toast.error(message);
            }

            const error = new Error(message);
            (error as any).status = status;
            (error as any).existing = errorData.existing;
            throw error;
        }

        const text = await response.text();
        return text ? JSON.parse(text) : ({} as T);
    } catch (error) {
        if (error instanceof TypeError) {
            toast.error("Network error. Please check your connection.");
        }
        throw error;
    }
}
