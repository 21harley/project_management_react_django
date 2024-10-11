// src/pages/TasksTable.tsx
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
import { getUsers } from './../../services/user.service';
import { obtenerTareas } from './../../services/tarea.service'; // Asegúrate de que este servicio obtenga los proyectos correctamente
import { Tarea, Proyecto } from './../../types/tareas.type';
import { User } from '../../types/auth.types';

const TasksTable: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const [projects, setProjects] = useState<Proyecto[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedUserId: '', projectId: '' });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const proyectos: Proyecto[] = await obtenerTareas();
        setProjects(proyectos);
      } catch (error) {
        console.error('Error fetching projects', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const userList = await getUsers();
        console.log('Usuarios:', userList);
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
    setNewTask({ title: '', description: '', assignedUserId: '', projectId: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as { name: string; value: unknown };
    setNewTask({ ...newTask, [name]: value });
  };

  const handleCreateTask = async () => {
    // Lógica para crear una nueva tarea
    console.log('Crear tarea:', newTask);
    handleClose();
  };

  const handleEditTask = (taskId: number) => {
    // Lógica para editar la tarea
    console.log('Editar tarea con ID:', taskId);
  };

  const handleDeleteTask = (taskId: number) => {
    // Lógica para eliminar la tarea
    console.log('Eliminar tarea con ID:', taskId);
  };

  return (
    <div>
      {isAdmin && (
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Crear Tarea
        </Button>
      )}
      <TableContainer component={Paper} style={{ marginTop: '16px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID del Proyecto</TableCell>
              <TableCell>Nombre del Proyecto</TableCell>
              <TableCell>Descripción del Proyecto</TableCell>
              <TableCell>Fecha Inicio</TableCell>
              <TableCell>Fecha Finalización</TableCell>
              <TableCell>Tareas</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project: Proyecto) => (
              <TableRow key={project.id}>
                <TableCell>{project.id}</TableCell>
                <TableCell>{project.nombre}</TableCell>
                <TableCell>{project.descripcion}</TableCell>
                <TableCell>{project.fecha_inicio}</TableCell>
                <TableCell>{project.fecha_finalizacion}</TableCell>
                <TableCell>
                  <ul>
                    {project.tareas.map((task: Tarea) => (
                      <li key={task.id}>
                        {task.nombre} - {task.descripcion} ({task.estado})
                        <Button onClick={() => handleEditTask(task.id)} color="primary">
                          Editar
                        </Button>
                        <Button onClick={() => handleDeleteTask(task.id)} color="secondary">
                          Eliminar
                        </Button>
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleOpen()} color="primary">
                    Agregar Tarea
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para crear una nueva tarea */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Crear Tarea</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Título"
            type="text"
            fullWidth
            name="title"
            value={newTask.title}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Descripción"
            type="text"
            fullWidth
            name="description"
            value={newTask.description}
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
          <Button onClick={handleCreateTask} color="primary">
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TasksTable;

/*
            <Select
              name="assignedUserId"
              value={newTask.assignedUserId}
              onChange={handleInputChange}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.username}
                </MenuItem>
              ))}
            </Select>
*/