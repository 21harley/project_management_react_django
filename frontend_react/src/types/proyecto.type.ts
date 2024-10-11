export interface Proyecto {
    id: number;
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_finalizacion: string;
    usuario: number; // ID del usuario propietario
}

export interface CrearProyecto {
    nombre: string;
    descripcion: string;
    usuario: number; // ID del usuario que crea el proyecto
    fecha_inicio: string; // Formato: YYYY-MM-DD
    fecha_finalizacion: string; // Formato: YYYY-MM-DD
}

export interface ActualizarProyecto {
    nombre?: string;
    descripcion?: string;
    fecha_inicio?: string; // Formato: YYYY-MM-DD
    fecha_finalizacion?: string; // Formato: YYYY-MM-DD
    usuario?: number; // ID del usuario que crea el proyecto
}