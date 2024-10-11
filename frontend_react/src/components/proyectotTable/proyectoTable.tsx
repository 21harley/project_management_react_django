// src/pages/ProjectsTable.tsx
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
} from '@mui/material';
import {  getUsers } from './../../services/user.service'; // Asegúrate de tener estos servicios
import { obtenerProyectos } from './../../services/proyecto.service'; // Asegúrate de tener estos servicios
import { Proyecto } from './../../types/proyecto.type'; // Asegúrate de definir el tipo Project
import { User } from '../../types/auth.types'; // Asegúrate de definir el tipo User

const ProjectsTable: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const [projects, setProjects] = useState<Proyecto[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', assignedUserId: '' });

  useEffect(() => {
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

    fetchProjects();
    fetchUsers();
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewProject({ name: '', description: '', assignedUserId: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as HTMLInputElement;
    setNewProject({ ...newProject, [name]: value });
  };

  const handleCreateProject = async () => {
    // Lógica para crear un nuevo proyecto, usando el servicio correspondiente
    console.log('Crear proyecto:', newProject);
    handleClose();
  };

  const handleEditProject = (id: number) => {
    // Lógica para editar el proyecto (puedes implementar un modal similar al de crear)
    console.log('Editar proyecto con ID:', id);
  };

  const handleDeleteProject = (id: number) => {
    // Lógica para eliminar el proyecto (aquí puedes llamar a tu API para eliminar)
    console.log('Eliminar proyecto con ID:', id);
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
            {projects.map((project:Proyecto) => (
              <TableRow key={project.id}>
                <TableCell>{project.id}</TableCell>
                <TableCell>{project.nombre}</TableCell>
                <TableCell>{project.descripcion}</TableCell>
                <TableCell>{project.usuario}</TableCell>
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

      {/* Modal para crear un nuevo proyecto */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Crear Proyecto</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            type="text"
            fullWidth
            name="name"
            value={newProject.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Descripción"
            type="text"
            fullWidth
            name="description"
            value={newProject.description}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Usuario Asignado</InputLabel>

          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleCreateProject} color="primary">
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProjectsTable;

/*
            <Select
              name="assignedUserId"
              value={newProject.assignedUserId}
              onChange={handleInputChange}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.username}
                </MenuItem>
              ))}
            </Select>
*/