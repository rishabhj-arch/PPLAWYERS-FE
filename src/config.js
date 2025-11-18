// Centralized config for client-side constants
const raw = process.env.REACT_APP_API_URL || "http://localhost:3000/";
// ensure single trailing slash
export const API_URL = raw.endsWith("/") ? raw : raw + "/";

// helper to build api endpoints without double-slashes
export function apiPath(path) {
	if (!path) return API_URL;
	if (path.startsWith("/")) path = path.slice(1);
	return `${API_URL}${path}`;
}
