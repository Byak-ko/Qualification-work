import { api } from "./api";

export const getFilteredUsers = async (filters: {
    name?: string;
    departmentName?: string;
    unitName?: string;
}) => {
    const response = await api.get("/users/filter", { params: filters });
    return response.data;
}