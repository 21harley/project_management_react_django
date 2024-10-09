import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { getCurrentUser, logout } from '../services/authService'; 
const Dashboard: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false); // Estado para manejar el colapso
  const navigate = useNavigate();
  const user = getCurrentUser(); // Obtiene el usuario actual
  console.log(user);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed); // Cambia el estado de colapso
  };

  return (
    <div className={`dashboard-container ${isCollapsed ? 'collapsed' : ''}`}>
      <aside className="sidebar">
        <button className="toggle-button" onClick={toggleSidebar}>
          {isCollapsed ? '☰' : '✖'} {/* Cambia el ícono según el estado */}
        </button>
        {!isCollapsed && (
          <>
            <h2>Panel de Administración</h2>
            <ul>
    
              <li onClick={() => handleNavigation('/users')}>Usuarios</li>
              <li onClick={() => handleNavigation('/projects')}>Proyectos</li>
              <li onClick={() => handleNavigation('/tasks')}>Tareas</li>
              <li onClick={() => handleNavigation('/settings')}>Configuraciones</li>
              <li onClick={handleLogout}>Cerrar sesión</li>
            </ul>
          </>
        )}
      </aside>
      <main className="main-content">
        <h1>Hola :v</h1>
        {/* Aquí puedes incluir más contenido o componentes relacionados con el panel de administración */}
      </main>
    </div>
  );
};

export default Dashboard;
