import axios, {
	type AxiosInstance,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
} from "axios";

// Create a custom axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
	async (config: InternalAxiosRequestConfig) => {
		// Skip adding token only for login/register routes (not for change-password)
		const publicAuthRoutes = [
			"/auth/login",
			"/auth/register",
			"/auth/forgot-password",
			"/auth/reset-password",
		];
		const isPublicRoute = publicAuthRoutes.some((route) =>
			config.url?.includes(route),
		);

		if (isPublicRoute) {
			console.log("Public route detected, skipping token:", config.url);
			return config;
		}

		// Add auth token from localStorage if available
		if (typeof window !== "undefined") {
			try {
				const token = localStorage.getItem("authToken");
				if (token) {
					config.headers = config.headers || {};
					config.headers.Authorization = `Bearer ${token}`;
					console.log("Added Authorization header");
				} else {
					console.warn("No access token found");
				}
			} catch (error) {
				console.error("Error getting token:", error);
			}
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Response interceptor for error handling
/*
axiosInstance.interceptors.response.use(
	(response: AxiosResponse) => response,
	async (error) => {
		const originalRequest = error.config;

		// Handle 401 Unauthorized
		// Skip auto-logout for password change endpoint (wrong password should not log user out)
		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			!originalRequest.url?.includes("/auth/change-password")
		) {
			originalRequest._retry = true;

			// Clear session and redirect to login on client-side
			if (typeof window !== "undefined") {
				// Import signOut dynamically to avoid SSR issues
				const { signOut } = await import("next-auth/react");

				// Sign out and redirect - this prevents the loop
				await signOut({
					redirect: true,
					callbackUrl: "/login",
				});
			}
		}

		return Promise.reject(error);
	},
);
*/
export default axiosInstance;
