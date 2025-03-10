export enum Role {
    ADMIN = "admin",
    TEACHER = "teacher",
    GUEST = "guest"
}

export type User = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roles: Role[];
};