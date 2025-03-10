import { createContext, PropsWithChildren, useContext, useEffect, useLayoutEffect, useState } from "react";
import { User } from "../types/User";
import { api } from "../services/api/api";
import { AxiosError } from "axios";

type AuthContext = {
    currentUser?: User | null;
    login: (email: string, password: string) => Promise<{ error: boolean, message: string }>
    logout: () => Promise<{ error: boolean, message: string }>
}
type AuthProviderProps = PropsWithChildren

const AuthContext = createContext<AuthContext | undefined>(undefined)

const AuthProvider = ({ children }: AuthProviderProps) => {

    const [currentUser, setCurrentUser] = useState<User | null>()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/user/current')
                setCurrentUser(response.data)

            } catch {
                setCurrentUser(null)
            }
        }

        fetchUser()
    }, [])

    useLayoutEffect(() => {
        const refreshInterceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequestConfig = error.config;

                if (error.response.status === 401 && !originalRequestConfig._retry) {
                    originalRequestConfig._retry = true

                    try {
                        await api.post('/auth/refresh')
                        return api(originalRequestConfig)
                    } catch {
                        setCurrentUser(null)
                    }
                }

                return Promise.reject(error)
            })

        return () => {
            api.interceptors.response.eject(refreshInterceptor)
        }
    }, [])

    const login = async (email: string, password: string) => {

        try {
            const response = await api.post("/auth/login", { email, password })
            setCurrentUser(response.data)
            return { error: false, message: 'success' }
        } catch (err) {

            setCurrentUser(null)

            if ((err as AxiosError).response?.data) {
                return { error: true, message: (err as any).response?.data.message }
            }

            return { error: true, message: "Unable to login due some internal reasons, please try again later" }
        }
    }

    const logout = async () => {
        try {
            await api.post('/auth/logout')
            setCurrentUser(null)
            return { error: false, message: 'success' }
        } catch (err) {
            return { error: true, message: (err as Error).message ?? "Unable to logout due some internal reasons, please try again later" }
        }
    }

    const authProvierValues = {
        currentUser,
        login,
        logout
    }

    return (
        <AuthContext.Provider value={authProvierValues}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)

    if (context === undefined) {
        throw new Error("useAuthContext should be used inside of AuthProvider")
    }

    return context
}

export default AuthProvider