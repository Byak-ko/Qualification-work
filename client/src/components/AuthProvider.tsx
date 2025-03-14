import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { User } from "../types/User";
import { api } from "../services/api/api";
import { AxiosError } from "axios";

type AuthContext = {
  currentUser?: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: boolean; message: string }>;
  logout: () => Promise<{ error: boolean; message: string }>;
};

type AuthProviderProps = PropsWithChildren;

const AuthContext = createContext<AuthContext | undefined>(undefined);

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    const fetchUser = async () => {
      try {
        const response = await api.get("/users/current");
        setCurrentUser(response.data);
      } catch {
        setCurrentUser(null);
      } finally {
        setIsLoading(false); 
      }
    };

    fetchUser();
  }, []);

  useLayoutEffect(() => {
    const refreshInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
  
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
  
          try {
            const response = await api.post("/auth/refresh", {
              refreshToken: localStorage.getItem("refreshToken"),
            });
  
            const newAccessToken = response.data.access_token;
            localStorage.setItem("token", newAccessToken);
            api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
  
            return api(originalRequest);
          } catch {
            setCurrentUser(null);
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
          }
        }
  
        return Promise.reject(error);
      }
    );
  
    return () => {
      api.interceptors.response.eject(refreshInterceptor);
    };
  }, []);
  

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token, refresh_token } = response.data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("refreshToken", refresh_token);
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      const userResponse = await api.get("/users/current");
      setCurrentUser(userResponse.data);

      return { error: false, message: "Login successful" }; 
    } catch (err) {
      setCurrentUser(null);
      const message =
        ((err as AxiosError).response?.data as { message: string })?.message ||
        "Unable to login due to some internal reasons, please try again later";
      return { error: true, message };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setCurrentUser(null);
      localStorage.removeItem("token");

      return { error: false, message: "Logout successful" };
    } catch (err) {
      return {
        error: true,
        message:
          (err as Error).message ?? "Unable to logout due some internal reasons, please try again later",
      };
    }
  };

  const authProviderValues = {
    currentUser,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={authProviderValues}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext should be used inside of AuthProvider");
  }
  return context;
};

export default AuthProvider;
