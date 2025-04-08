export enum Role {
    ADMIN = "admin",
    TEACHER = "teacher",
    GUEST = "guest" // need or not?
}

export enum Degree {
    PhD = 'Доктор філософії',
    DOCTOR_SCIENCES = 'Доктор наук',
    NONE = 'Відсутній',
}

export enum Position {
    LECTURER = 'Викладач',
    SENIOR_LECTURER = 'Старший викладач',
    ASSOCIATE_PROFESSOR = 'Доцент',
    PROFESSOR = 'Професор',
    HEAD_OF_DEPARTMENT = 'Завідувач кафедри',
    DEAN_OR_DIRECTOR = 'Декан факультету / директор ННІ',
    VICE_RECTOR = 'Проректор',
    RECTOR = 'Ректор',
}

export type User = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    degree: Degree; 
    position: Position; 
    isAuthor: boolean;
    department: {
        id: number;
        name: string;
        unit: {
            id: number;
            name: string;
            type: string;
        };
    }
};