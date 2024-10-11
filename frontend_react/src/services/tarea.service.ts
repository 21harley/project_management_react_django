// src/api/task.api.ts
import axios from './../utils/axiosConfig';
import { Tarea, CrearTarea, ActualizarTarea, Proyecto } from './../types/tareas.type';

// Crear una nueva tarea
const crearTarea = async (data: CrearTarea): Promise<Tarea> => {
    const response = await axios.post<Tarea>('tasks/', data);
    return response.data;
};

// Obtener todas las tareas
const obtenerTareas = async (): Promise<Proyecto[]> => {
    const response = await axios.get<Proyecto[]>('tasks/');
    return response.data;
};

const obtenerTarea = async (id: number): Promise<Tarea> => {
    const response = await axios.get<Tarea>(`tasks/${id}/`);
    return response.data;
}

// Actualizar una tarea existente
const actualizarTarea = async (id: number, data: ActualizarTarea): Promise<Tarea> => {
    const response = await axios.put<Tarea>(`tasks/${id}/`, data);
    return response.data;
};

// Eliminar una tarea
const eliminarTarea = async (id: number): Promise<void> => {
    await axios.delete(`tasks/${id}/`);
};

// Exportar las funciones
export { crearTarea, obtenerTareas, actualizarTarea, eliminarTarea, obtenerTarea };