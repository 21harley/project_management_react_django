import axios from './../utils/axiosConfig';
import { Proyecto, CrearProyecto, ActualizarProyecto } from './../types/proyecto.type';

// Crear un nuevo proyecto
const crearProyecto = async (data: CrearProyecto): Promise<Proyecto> => {
    const response = await axios.post<Proyecto>('projects/', data);
    return response.data;
};

// Obtener todos los proyectos
const obtenerProyectos = async (): Promise<Array<Proyecto>> => {
    const response = await axios.get<Proyecto[]>('projects/');
    return response.data;
};

const obtenerProyecto = async (id: number): Promise<Proyecto> => {
    const response = await axios.get<Proyecto>(`projects/${id}/`);
    return response.data;
}

// Actualizar un proyecto existente
const actualizarProyecto = async (id: number, data: ActualizarProyecto): Promise<Proyecto> => {
    const response = await axios.put<Proyecto>(`projects/${id}/`, data);
    return response.data;
};

// Eliminar un proyecto
const eliminarProyecto = async (id: number): Promise<void> => {
    await axios.delete(`projects/${id}/`);
};

// Exportar las funciones
export { crearProyecto, obtenerProyectos, actualizarProyecto, eliminarProyecto, obtenerProyecto };
