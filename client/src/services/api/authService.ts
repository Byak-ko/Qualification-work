import { api } from "./api";

export const sendPasswordResetEmail = async (email: string) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
    return api.post("/auth/reset-password", { token, newPassword });
  };