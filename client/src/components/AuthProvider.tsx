import {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
import { User } from "../types/User";
import { api } from "../services/api/api";
import { AxiosError } from "axios";

type AuthContextType = {
  currentUser?: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: boolean; message: string }>;
  logout: () => Promise<{ error: boolean; message: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const response = await api.post("/auth/refresh", null, {
          withCredentials: true,
        });
        const accessToken = response.data.access_token;
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        const userRes = await api.get("/users/current", {
          withCredentials: true,
        });
        setCurrentUser(userRes.data);
      } catch {
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    tryRefresh();
  }, []);
  
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (res) => res,
      async (error) => {
        const originalRequest = error.config;
  
      
        if (error.response?.status === 401 && originalRequest.url.includes("/auth/login")) {
          return Promise.reject(error);
        }
  
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshRes = await api.post("/auth/refresh", null, {
              withCredentials: true,
            });
  
            const newAccessToken = refreshRes.data.access_token;
            api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
  
            return api(originalRequest);
          } catch (refreshErr) {
            setCurrentUser(null);
          }
        }
  
        return Promise.reject(error);
      }
    );
  
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );

      const token = res.data.access_token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const userRes = await api.get("/users/current", {
        withCredentials: true,
      });
      setCurrentUser(userRes.data);

      return { error: false, message: "Успішний вхід" };
    } catch (err) {
      const message =
        ((err as AxiosError).response?.data as { message: string })?.message ||
        "Помилка при вході";
      return { error: true, message };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", null, { withCredentials: true });
      setCurrentUser(null);
      delete api.defaults.headers.common["Authorization"];
      return { error: false, message: "Успішний вихід" };
    } catch (err) {
      return {
        error: true,
        message:
          (err as AxiosError).message ??
          "Не вдалося вийти з акаунту, спробуйте ще раз",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};


export default AuthProvider;
