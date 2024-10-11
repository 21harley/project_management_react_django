import axios from './../utils/axiosConfig';
import { Alerta, CrearAlerta, ActualizarAlerta } from './../types/alert.type';

// Crear una nueva alerta
const crearAlerta = async (data: CrearAlerta): Promise<Alerta> => {
    const response = await axios.post<Alerta>('alertas/', data);
    return response.data;
};

// Obtener todas las alertas
const obtenerAlertas = async (): Promise<Array<Alerta>> => {
    const response = await axios.get<Alerta[]>('alertas/');
    return response.data;
};

// Obtener una alerta específica
const obtenerAlerta = async (id: number): Promise<Alerta> => {
    const response = await axios.get<Alerta>(`alertas/${id}/`);
    return response.data;
};

// Actualizar una alerta existente
const actualizarAlerta = async (id: number, data: ActualizarAlerta): Promise<Alerta> => {
    const response = await axios.put<Alerta>(`alertas/${id}/`, data);
    return response.data;
};

// Eliminar una alerta
const eliminarAlerta = async (id: number): Promise<void> => {
    await axios.delete(`alertas/${id}/`);
};

// Actualizar la visibilidad de alertas
export const actualizarVisibilidad = async (ids: number[]): Promise<void> => {
    try {
      const response = await axios.patch(`alertas/update-visibility/`, { ids });
      return response.data;
    } catch (error) {
      console.error('Error actualizando la visibilidad de las alertas:', error);
      throw error;
    }
  };

// Exportar las funciones
export { crearAlerta, obtenerAlertas, obtenerAlerta, actualizarAlerta, eliminarAlerta };
