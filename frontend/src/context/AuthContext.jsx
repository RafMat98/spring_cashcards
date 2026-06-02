import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

// If running in Docker (production build) → /api (nginx proxy)
// If running locally with npm run dev             → http://localhost:8080
const BASE_URL = import.meta.env.PROD ? "/api" : "http://localhost:8080";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);

  const createApi = (username, password) =>
    axios.create({
      baseURL: BASE_URL,
      auth: { username, password },
      headers: { "Content-Type": "application/json" },
    });

  const login = async (username, password) => {
    const api = createApi(username, password);

    try {
      await api.get("/admin/users");
      setAuth({ username, password, api, role: "ADMIN" });
      return "ADMIN";
    } catch (adminErr) {
      if (adminErr.response?.status === 401) throw adminErr;
    }

    await api.get("/cashcards");
    setAuth({ username, password, api, role: "USER" });
    return "USER";
  };

  const logout = () => setAuth(null);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
