export type Perfil = 'admin' | 'gerente' | 'cajero';

export interface User {
    usuarioId: number;
    nombre: string;
    username: string;
    perfil: Perfil;
    passwordHash: string;
    activo: boolean;
    fechaRegistro: Date;
}

export interface NewUser {
    nombre: string;
    username: string;
    perfil: Perfil;
    password: string;
}

export interface CreateUserParams {
    nombre: string;
    username: string;
    perfil: Perfil;
    passwordHash: string;
}

export interface UpdateUser {
    nombre?: string;
    username?: string;
    perfil?: Perfil;
    password?: string;
    activo?: boolean;
}

export interface UpdateUserParams {
    nombre?: string;
    username?: string;
    perfil?: Perfil;
    passwordHash?: string;
    activo?: boolean;
}
