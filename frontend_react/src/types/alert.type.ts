export interface Alerta {
    id: number;
    usuario: number; // ID del usuario al que se envía la alerta
    mensaje: string; // Mensaje de la alerta
    fechaCreacion: string; // Fecha de creación de la alerta
    visible: boolean; // Visibilidad de la alerta
}

export interface CrearAlerta {
    usuario: number; // ID del usuario al que se envía la alerta
    mensaje: string; // Mensaje de la alerta
}

export interface ActualizarAlerta {
    mensaje: string; // Mensaje de la alerta
}