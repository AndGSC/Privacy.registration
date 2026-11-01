// Lo que envía el cliente al registrarse

export interface RegisterUserInput{
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    consent: boolean;
}

// Usuario descifrado, solo para uso interno del backend
export interface UserInternal{
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    createdAt: Date;
    isActive: boolean;
}

// Lo único que sale por la API
export interface UserPublic{
    id: string;
    fullNameMasked: string;
    emailMasked: string;
    phoneMasked: string | null;
    createdAt: string;
}