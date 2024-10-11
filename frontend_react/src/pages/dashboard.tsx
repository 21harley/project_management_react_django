import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth.service';
import { obtenerAlertas, eliminarAlerta, actualizarVisibilidad } from './../services/alert.service';
import { Alerta } from './../types/alert.type';
import { User } from '../types/auth.types';
import { getMe } from '../services/user.service';
import UsersTable from './../components/userTable/userTable';
import TasksTable from './../components/tareasTable/tareasTable';
import ProjectsTable from './../components/proyectotTable/proyectoTable';

// Material-UI Components and Icons
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import TaskIcon from '@mui/icons-material/Task';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import { Alert, Snackbar, Button } from '@mui/material';

const Dashboard: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTable, setActiveTable] = useState<'users' | 'projects' | 'tasks' | null>(null);
  const [alerts, setAlerts] = useState<Alerta[]>([]); // Estructura de alertas
  const [unseenCount, setUnseenCount] = useState(0); // Contador de alertas no vistas
  const [isAlertOpen, setIsAlertOpen] = useState(false); // Estado para la visibilidad del menú de alertas
  const [openSnackbar, setOpenSnackbar] = useState(false); // Estado para mostrar Snackbar
  const [alertMessage, setAlertMessage] = useState(''); // Mensaje para Snackbar
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getMe();
        let isAdmin = currentUser.rol === 'admin';
        setUser(currentUser);
        setIsAdmin(isAdmin);
        if (isAdmin) {
          setActiveTable('users');
        } else {
          setActiveTable('tasks');
        }
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };

    fetchUser();
    fetchAlerts(); // Fetch alerts when component mounts
  }, []);

  const fetchAlerts = () => {
    obtenerAlertas().then(alerts => {
      setAlerts(alerts);
      setUnseenCount(alerts.filter(alert => alert.visible === true).length);
    });

  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (table: 'users' | 'projects' | 'tasks' | null = null) => {
    setActiveTable(table);
  };

  const handleMouseEnter = () => {
    setIsCollapsed(false); // Expandir al poner el mouse encima
  };

  const handleMouseLeave = () => {
    setIsCollapsed(true); // Colapsar cuando el mouse se vaya
  };

  const toggleAlertMenu = () => {
    setIsAlertOpen(!isAlertOpen); // Alterna la visibilidad del menú de alertas
    if (!isAlertOpen) {
      updateAlertsVisibility(); // Si se abre el menú, actualiza las alertas
    }
  };

  const updateAlertsVisibility = () => {
    actualizarVisibilidad(alerts.map(alert => alert.id)).then(() => {
      setAlerts(prevAlerts =>
        prevAlerts.map(alert => ({ ...alert, visible: false })) // Actualiza todas las alertas a visible = false
      );
      setUnseenCount(0); // Resetea el contador de alertas no vistas
    }).catch(error => {
      console.error('Error updating alerts visibility:', error);
    });
  };

  const handleDeleteAlert = (id: number) => {
    /*
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id)); // Elimina la alerta de la lista
    setAlertMessage('Alerta eliminada');
    setOpenSnackbar(true); // Muestra el mensaje de Snackbar
    */
    eliminarAlerta(id).then(() => {
      fetchAlerts();
      setAlertMessage('Alerta eliminada');
      setOpenSnackbar(true);
    }).catch(error => {
      console.error('Error deleting alert:', error);
      setAlertMessage('Error eliminando la alerta');
      setOpenSnackbar(true);
    });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false); // Cierra el Snackbar
  };

  return (
    <div className="dashboard-container">
      {/* Header with Alerts */}
      <header className="header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <div className="alerts-container">
            <Badge badgeContent={unseenCount} color="error">
              <NotificationsIcon className="alert-icon" onClick={toggleAlertMenu} />
            </Badge>
            {isAlertOpen && (
              <div className="alert-menu" >
                {alerts.map((alert) => (
                  <Alert
                    key={alert.id}
                    severity="info"
                    action={
                      <Button color="inherit" onClick={() => handleDeleteAlert(alert.id)}>
                        X
                      </Button>
                    }
                    sx={{
                      mb: 1,
                      fontSize: '12px',
                      padding: '10px',
                      width: 'auto', // Ajusta el ancho de la alerta
                      wordWrap: 'break-word',
                    }}
                  >
                    {alert.mensaje}
                  </Alert>
                ))}
                {alerts.length === 0 && <Alert severity="info">No hay alertas</Alert>}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="content">
        <aside
          className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <ul className="menu-list">
            {user && user.rol === 'admin' && (
              <li onClick={() => handleNavigation('users')}>
                <PersonIcon style={{ transition: 'transform 0.3s ease' }} />
                {!isCollapsed && <span>Usuarios</span>}
              </li>
            )}
            <li onClick={() => handleNavigation('projects')}>
              <WorkIcon style={{ transition: 'transform 0.3s ease' }} />
              {!isCollapsed && <span>Proyectos</span>}
            </li>
            <li onClick={() => handleNavigation('tasks')}>
              <TaskIcon style={{ transition: 'transform 0.3s ease' }} />
              {!isCollapsed && <span>Tareas</span>}
            </li>
            <li onClick={handleLogout}>
              <LogoutIcon style={{ transition: 'transform 0.3s ease' }} />
              {!isCollapsed && <span>Logout</span>}
            </li>
          </ul>
        </aside>

        <main className="main-content">
          {activeTable === 'users' && user?.rol === 'admin' && <UsersTable isAdmin={isAdmin} />}
          {activeTable === 'projects' && <ProjectsTable isAdmin={isAdmin} />}
          {activeTable === 'tasks' && <TasksTable isAdmin={isAdmin} />}
        </main>
      </div>

      {/* Snackbar for alert deletion confirmation */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={alertMessage}
      />
    </div>
  );
};

export default Dashboard;
