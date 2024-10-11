export interface Tarea {
    id: number;
    nombre: string;
    descripcion: string;
    estado: string;
    proyecto: Proyecto; // Proyecto asociado
    asignada_a: number; // ID del usuario asignado
}

export interface CrearTarea {
    nombre: string;
    descripcion: string;
    proyecto: number; // ID del proyecto asociado
    asignada_a: number; // ID del usuario asignado
    estado: string;
}

export interface ActualizarTarea {
    nombre?: string;
    descripcion?: string;
    asignada_a?: number; // ID del usuario asignado
    estado?: string;
}

export interface Tarea {
    id: number;
    nombre: string;
    descripcion: string;
    estado: string; // Puede ser 'pendiente', 'en desarrollo', 'completada', etc.
    asignada_a: number; // ID del usuario asignado
}

export interface Proyecto {
    id: number;
    nombre: string;
    descripcion: string;
    fecha_inicio: string; // Formato de fecha
    fecha_finalizacion: string; // Formato de fecha
    usuario: number; // ID del usuario creador
    tareas: Tarea[]; // Lista de tareas asociadas al proyecto
}