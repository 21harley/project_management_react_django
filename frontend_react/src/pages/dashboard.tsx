// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { logout } from '../services/auth.service'; 
import { User } from '../types/auth.types'; 
import { getMe } from '../services/user.service';
import UsersTable from './../components/userTable/userTable'; // Importa el componente de la tabla de usuarios
import TasksTable from './../components/tareasTable/tareasTable'; // Importa el componente de la tabla de tareas
import ProjectsTable from './../components/proyectotTable/proyectoTable'; // Importa el componente de la tabla de proyectos

const Dashboard: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTable, setActiveTable] = useState<'users' | 'projects' | 'tasks' | 'settings' | null>(null); // Estado para manejar la tabla activa
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getMe();
        setUser(currentUser);
        setIsAdmin(currentUser.rol === 'admin');
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = ( table: 'users' | 'projects' | 'tasks' | 'settings' | null = null) => {
    setActiveTable(table); // Actualiza la tabla activa
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`dashboard-container ${isCollapsed ? 'collapsed' : ''}`}>
      <aside className="sidebar">
        <button className="toggle-button" onClick={toggleSidebar}>
          {isCollapsed ? '☰' : '✖'}
        </button>
        {!isCollapsed && (
          <>
            <h2>Panel de Administración</h2>
            <p>{user?.username}</p>
            <ul>
              {user && user.rol === 'admin' && (
                <li onClick={() => handleNavigation( 'users')}>Usuarios</li>
              )}
              <li onClick={() => handleNavigation( 'projects')}>Proyectos</li>
              <li onClick={() => handleNavigation('tasks')}>Tareas</li>
              <li onClick={() => handleNavigation('settings')}>Configuraciones</li>
              <li onClick={handleLogout}>Cerrar sesión</li>
            </ul>
          </>
        )}
      </aside>
      <main className="main-content">
        <h1>Hola :v</h1>
        {/* Renderiza la tabla activa */}
        {activeTable === 'users' && user?.rol === 'admin' && <UsersTable isAdmin={isAdmin} />}
        {activeTable === 'projects' && <ProjectsTable isAdmin={isAdmin} />}
        {activeTable === 'tasks' && <TasksTable isAdmin={isAdmin} />}
      </main>
    </div>
  );
};

export default Dashboard;
