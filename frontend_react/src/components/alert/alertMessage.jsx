import React, { useEffect, useState } from 'react';
import { eliminarAlerta, obtenerAlertas } from '../api/alerta.api'; // Importa tus funciones de API
import { Alerta } from '../types/alerta.type';

const AlertMessage = ({ onClose }) => {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    const fetchAlertas = async () => {
      const fetchedAlertas = await obtenerAlertas();
      setAlertas(fetchedAlertas.filter(alerta => alerta.visible === 1)); // Filtrar alertas visibles
    };

    fetchAlertas();
  }, []);

  const handleAlertClick = async (id) => {
    await eliminarAlerta(id); // Eliminar alerta
    setAlertas(prev => prev.filter(alerta => alerta.id !== id)); // Actualiza el estado
  };

  const handleMarkAsSeen = async () => {
    // Aquí puedes hacer una actualización de las alertas para marcarlas como vistas (visible = 0)
    await Promise.all(alertas.map(async (alerta) => {
      // Actualizar la alerta (suponiendo que tienes un método para hacerlo)
      // await actualizarAlerta(alerta.id, { visible: 0 }); 
      alerta.visible = 0; // Marca como no visible en el estado
    }));
    setAlertas(prev => prev.map(alerta => ({ ...alerta, visible: 0 }))); // Actualiza el estado
  };

  return (
    <div className="alertas-container">
      <button onClick={handleMarkAsSeen}>Marcar todas como vistas</button>
      <ul>
        {alertas.length > 0 ? (
          alertas.map(alerta => (
            <li key={alerta.id}>
              {alerta.mensaje}
              <button onClick={() => handleAlertClick(alerta.id)}>X</button>
            </li>
          ))
        ) : (
          <li>No hay alertas visibles</li>
        )}
      </ul>
      <button onClick={onClose}>Cerrar</button>
    </div>
  );
};

export default Alertas;