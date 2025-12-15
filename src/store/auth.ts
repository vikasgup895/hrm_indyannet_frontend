// import { create } from "zustand";
// import Cookies from "js-cookie";
// import { api } from "@/lib/api"; // axios instance with interceptors

// interface AuthState {
//   token: string | null;
//   role: string | null;
//   isAuthenticated: boolean;
//   set: (token: string, role: string) => void;
//   load: () => void;
//   logout: () => void;
//   validate: () => Promise<boolean>;
// }

// export const useAuth = create<AuthState>((set, get) => ({
//   token: null,
//   role: null,
//   isAuthenticated: false,

//   /**
//    * ✅ Save token + role to both localStorage and cookies.
//    * Ensures persistence across reloads & SSR.
//    */
//   set: (token, role) => {
//     localStorage.setItem("authToken", token);
//     localStorage.setItem("role", role);
//     Cookies.set("authToken", token, { expires: 1 }); // expires in 1 day

//     // Attach to axios globally
//     api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

//     set({ token, role, isAuthenticated: true });
//   },

//   /**
//    * ✅ Restore session from localStorage or cookies.
//    */
//   load: () => {
//     const token =
//       localStorage.getItem("authToken") || Cookies.get("authToken") || null;
//     const role = localStorage.getItem("role");

//     if (token && role) {
//       api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//       set({ token, role, isAuthenticated: true });
//     } else {
//       set({ token: null, role: null, isAuthenticated: false });
//     }
//   },

//   /**
//    * ✅ Clear auth data completely.
//    */
//   logout: () => {
//     localStorage.removeItem("authToken");
//     localStorage.removeItem("role");
//     Cookies.remove("authToken");

//     delete api.defaults.headers.common["Authorization"];

//     set({ token: null, role: null, isAuthenticated: false });
//   },

//   /**
//    * ✅ Validate current token against backend `/auth/validate`.
//    * If invalid → auto-logout.
//    */
//   validate: async () => {
//     const { token } = get();
//     if (!token) return false;

//     try {
//       const { data } = await api.get("/auth/validate");
//       if (data?.valid) return true;

//       console.warn("Token invalid — auto-logging out");
//       get().logout();
//       return false;
//     } catch (error) {
//       console.warn("Session expired or unauthorized");
//       get().logout();
//       return false;
//     }
//   },
// }));
import { create } from "zustand";
import Cookies from "js-cookie";
import { api } from "@/lib/api";

interface AuthState {
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  set: (token: string, role: string) => void;
  load: () => void;
  logout: () => void;
  validate: () => Promise<boolean>;
}

export const useAuth = create<AuthState>((set, get) => ({
  token: null,
  role: null,
  isAuthenticated: false,

  // ✅ Save token + role to localStorage + cookies + axios
  set: (token, role) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", token);
        localStorage.setItem("role", role);
        Cookies.set("authToken", token, { expires: 1 });
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      set({ token, role, isAuthenticated: true });
    } catch (err) {
      console.error("❌ Error saving token:", err);
    }
  },

  // ✅ Restore from localStorage on reload
  load: () => {
    try {
      if (typeof window === "undefined") return;

      const token =
        localStorage.getItem("authToken") || Cookies.get("authToken") || null;
      const role = localStorage.getItem("role");

      if (token && role) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        set({ token, role, isAuthenticated: true });
      } else {
        set({ token: null, role: null, isAuthenticated: false });
      }
    } catch (err) {
      console.error("❌ Error restoring session:", err);
    }
  },

  // ✅ Logout
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    Cookies.remove("authToken");
    delete api.defaults.headers.common["Authorization"];
    set({ token: null, role: null, isAuthenticated: false });
  },

  // ✅ Validate current token against backend
  validate: async () => {
    const { token } = get();
    if (!token) return false;

    try {
      const { data } = await api.get("/auth/validate");
      if (data?.valid) {
        return true;
      } else {
        console.warn("⚠️ Invalid token, logging out");
        get().logout();
        return false;
      }
    } catch (err) {
      console.warn("❌ Token validation failed, logging out");
      get().logout();
      return false;
    }
  },
}));
