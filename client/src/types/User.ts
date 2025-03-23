export enum Role {
    ADMIN = "admin",
    TEACHER = "teacher",
    GUEST = "guest" // need or not?
}

export type User = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    degree: string;
    position: string;
    department: {
        id: number;
        name: string;
    }
};