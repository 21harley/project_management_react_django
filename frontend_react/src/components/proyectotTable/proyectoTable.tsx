import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import { getUsers } from './../../services/user.service';
import { obtenerProyectos, crearProyecto, actualizarProyecto, eliminarProyecto, obtenerProyecto } from './../../services/proyecto.service';
import { Proyecto, CrearProyecto, ActualizarProyecto } from './../../types/proyecto.type';
import { User } from '../../types/auth.types';


const ProjectsTable: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const [projects, setProjects] = useState<Proyecto[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [newProject, setNewProject] = useState<CrearProyecto>({
    nombre: '',
    descripcion: '',
    usuario: 0, // Asumimos que el ID del usuario será un número
    fecha_inicio: '',
    fecha_finalizacion: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);

  //alerta
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const projectList = await obtenerProyectos();
      setProjects(projectList);
    } catch (error) {
      console.error('Error fetching projects', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const userList = await getUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setIsEditing(false);
    setNewProject({ nombre: '', descripcion: '', usuario: 0, fecha_inicio: '', fecha_finalizacion: '' });
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as HTMLInputElement;
    setNewProject({ ...newProject, [name]: value });
  };

  const handleUserChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setNewProject({ ...newProject, usuario: Number(e.target.value) }); // Convertir a número
  };

  const handleCreateProject = async () => {
    try {
      await crearProyecto(newProject).then(() => {
        setSnackbarMessage('Proyecto creado con éxito');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        handleClose();
        fetchProjects();
      }).catch((error) => {
        console.error('Error creando proyecto', error);
        setSnackbarMessage('Error:' + error.response.data.msg);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      })
    } catch (error) {
      console.error('Error creando proyecto', error);
    }
  };

  const handleEditProject = async (id: number) => {
    try {
      const project = await obtenerProyecto(id);
      if (project) {
        setCurrentProjectId(project.id);
        setNewProject({
          nombre: project.nombre,
          descripcion: project.descripcion,
          usuario: project.usuario,
          fecha_inicio: project.fecha_inicio,
          fecha_finalizacion: project.fecha_finalizacion,
        });
        setIsEditing(true);
        setOpen(true);
      }
    } catch (error) {
      console.error('Error obteniendo proyecto', error);
    }
  };

  const handleUpdateProject = async () => {
    if (currentProjectId !== null) {
      try {
        await actualizarProyecto(currentProjectId, { ...newProject }).then(() => {
          setSnackbarMessage('Proyecto actualizado con éxito');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          handleClose();
          fetchProjects();
        }).catch((error) => {
          console.error('Error actualizando proyecto', error);
          setSnackbarMessage('Error:' + error.response.data.msg);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        });;
      } catch (error) {
        console.error('Error actualizando proyecto', error);
      }
    }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      await eliminarProyecto(id).then(() => {
        setProjects(projects.filter(project => project.id !== id));
        setSnackbarMessage('Proyecto eliminado con éxito');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        fetchProjects();
      }).catch((error) => {
        console.error('Error eliminando proyecto', error);
        setSnackbarMessage('Error:' + error.response.data.msg);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
    } catch (error) {
      console.error('Error eliminando proyecto', error);
    }
  };

  return (
    <div>
      {isAdmin && (
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Crear Proyecto
        </Button>
      )}
      <TableContainer component={Paper} style={{ marginTop: '16px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Usuario Asignado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project: Proyecto) => (
              <TableRow key={project.id}>
                <TableCell>{project.id}</TableCell>
                <TableCell>{project.nombre}</TableCell>
                <TableCell>{project.descripcion}</TableCell>
                <TableCell>{users.find(user => user.id === project.usuario)?.username}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEditProject(project.id)} color="primary">
                    Editar
                  </Button>
                  <Button onClick={() => handleDeleteProject(project.id)} color="secondary">
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para crear o editar proyecto */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? 'Editar Proyecto' : 'Crear Proyecto'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            type="text"
            fullWidth
            name="nombre"
            value={newProject.nombre}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Descripción"
            type="text"
            fullWidth
            name="descripcion"
            value={newProject.descripcion}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Usuario Asignado</InputLabel>
            <Select
              value={newProject.usuario}
              onChange={handleUserChange}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Fecha de Inicio"
            type="date"
            fullWidth
            name="fecha_inicio"
            value={newProject.fecha_inicio} // Asegúrate de que newProject tenga esta propiedad
            onChange={handleInputChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            label="Fecha de Fin"
            type="date"
            fullWidth
            name="fecha_finalizacion"
            value={newProject.fecha_finalizacion} // Asegúrate de que newProject tenga esta propiedad
            onChange={handleInputChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={isEditing ? handleUpdateProject : handleCreateProject} color="primary">
            {isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>


      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProjectsTable;
