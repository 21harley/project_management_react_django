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
  Collapse,
  Snackbar,
  Alert,
} from '@mui/material';
import { getUsers } from './../../services/user.service';
import { Tarea, Proyecto } from './../../types/tareas.type';
import { User } from '../../types/auth.types';
import { SelectChangeEvent } from '@mui/material';
import { crearTarea, obtenerTareas, actualizarTarea, eliminarTarea } from '../../services/tarea.service';
import { obtenerProyectos } from '../../services/proyecto.service';

const TasksTable: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const [projects, setProjects] = useState<Proyecto[]>([]);
  const [ListServiceProyectos, setListServiceProyectos] = useState<Proyecto[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTask, setNewTask] = useState<{
    id?: number;
    nombre: string;
    descripcion: string;
    proyecto: number;  // ID del proyecto asociado
    asignada_a: number;  // ID del usuario asignado
    estado: string;
  }>({
    id: 0,
    nombre: "",
    descripcion: "",
    proyecto: 16,  // ID del proyecto asociado
    asignada_a: 2,  // ID del usuario asignado
    estado: ""
  });
  const [openRows, setOpenRows] = useState<number[]>([]); // Estado para controlar las filas abiertas

  //alerta
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const fetchProjects = async () => {
    try {
      const proyectos: Proyecto[] = await obtenerTareas();
      setProjects(proyectos);
    } catch (error) {
      console.error('Error fetching projects', error);
    }
  };

  const fetchListProjects = async () => {
    try {
      const proyectos: Proyecto[] = await obtenerProyectos();
      setListServiceProyectos(proyectos);
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

  useEffect(() => {
    fetchProjects();
    if (isAdmin) fetchListProjects();
    fetchUsers();
  }, []);

  const handleOpen = () => {
    setIsEditing(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewTask({ nombre: '', descripcion: '', proyecto: 16, asignada_a: 2, estado: '', id: 0 });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as { name: string; value: unknown };
    setNewTask({ ...newTask, [name]: value });
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setNewTask({ ...newTask, [name]: value });
  };

  const handleCreateTask = async () => {
    await crearTarea({
      ...newTask, estado: 'pendiente',
    }).then(() => {
      fetchProjects();
      setSnackbarMessage('La tarea se creó con éxito');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }).catch((error) => {
      setSnackbarMessage('Error:' + error.response.data.msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    });

    handleClose();
  };

  const handleDeleteTask = (taskId: number) => {
    eliminarTarea(taskId).then(() => {
      fetchProjects();
      setSnackbarMessage('Tarea eliminada con éxito');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }).catch((error) => {
      setSnackbarMessage('Error:' + error.response.data.msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    });
  };

  const handleEditTask = (taskId: number, proyecto: number) => {
    setIsEditing(true);
    if (isAdmin) fetchListProjects();
    const taskToEdit = projects
      .flatMap(project => project.tareas)
      .filter(task => task?.id === taskId);
    let auxTaskToEdit = taskToEdit[0];

    if (auxTaskToEdit) {
      setNewTask({
        id: auxTaskToEdit.id,
        nombre: auxTaskToEdit.nombre,
        descripcion: auxTaskToEdit.descripcion,
        asignada_a: auxTaskToEdit.asignada_a,
        proyecto: proyecto,
        estado: auxTaskToEdit.estado,
      });
      setOpen(true);
    }
  };

  const handleUpdateTask = async () => {
    let tareaActualizada = { ...newTask };
    let auId = tareaActualizada.id;
    if (auId !== undefined) {
      delete tareaActualizada.id;
      actualizarTarea(auId, tareaActualizada).then(() => {
        setOpen(false);
        fetchProjects();
        setSnackbarMessage('Tarea actualizada con éxito');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }).catch((error) => {
        setSnackbarMessage('Error:' + error.response.data.msg);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
    } else {
      console.error('Error: Task ID is undefined');
    }
  };

  const handleTaskStatusChange = async (taskId: number, newStatus: string) => {
    try {
      const taskToUpdate = projects
        .flatMap(project => project.tareas)
        .find(task => task?.id === taskId);

      if (taskToUpdate) {
        const updatedTask = { ...taskToUpdate, estado: newStatus };
        await actualizarTarea(taskId, updatedTask).then(() => {
          setSnackbarMessage('Estado de la tarea actualizado con éxito');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        }).catch((error) => {
          setSnackbarMessage('Error:' + error.response.data.msg);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        });
        fetchProjects();
      } else {
        console.error('No se encontró la tarea con ID:', taskId);
      }
    } catch (error) {
      console.error('Error al actualizar la tarea', error);
    }
  };

  const handleRowClick = (projectId: number) => {
    setOpenRows((prev) =>
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
  };

  return (
    <div>
      {isAdmin && (
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Crear Tarea
        </Button>
      )}
      <div style={{ marginTop: '16px' }}>
        {projects.map((project: Proyecto) => (
          <div key={project.id} style={{ marginBottom: '16px', border: '1px solid #ccc', padding: '16px' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>ID del Proyecto</TableCell>
                  <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Nombre del Proyecto</TableCell>
                  <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Descripción del Proyecto</TableCell>
                  <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Fecha Inicio</TableCell>
                  <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Fecha Finalización</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{project.id}</TableCell>
                  <TableCell>{project.nombre}</TableCell>
                  <TableCell>{project.descripcion}</TableCell>
                  <TableCell>{project.fecha_inicio}</TableCell>
                  <TableCell>{project.fecha_finalizacion}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Button onClick={() => handleRowClick(project.id)} style={{ marginLeft: '8px' }}>
              {openRows.includes(project.id) ? 'Ocultar Tareas' : 'Mostrar Tareas'}
            </Button>
            <Collapse in={openRows.includes(project.id)} timeout="auto" unmountOnExit>
              <TableContainer component={Paper} style={{ marginTop: '8px' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre Tarea</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Asignado a</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(project.tareas) && project.tareas.length > 0 ? (
                      project.tareas.map((task: Tarea) => (
                        <TableRow key={task.id}>
                          <TableCell>{task.nombre}</TableCell>
                          <TableCell>{task.descripcion}</TableCell>
                          <TableCell>
                            {users.find(user => user.id === task.asignada_a)?.username || 'Sin asignar'}
                          </TableCell>
                          <TableCell>
                            <FormControl fullWidth>
                              <Select
                                value={task.estado}
                                onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                              >
                                <MenuItem value="pendiente">Pendiente</MenuItem>
                                <MenuItem value="en_progreso">En progreso</MenuItem>
                                <MenuItem value="completada">Completada</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            <Button onClick={() => handleEditTask(task.id, project.id)} color="primary">
                              Editar
                            </Button>
                            <Button onClick={() => handleDeleteTask(task.id)} color="secondary">
                              Eliminar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">No hay tareas disponibles</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Collapse>
          </div>
        ))}
      </div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? 'Editar Tarea' : 'Crear Tarea'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            type="text"
            name="nombre"
            fullWidth
            variant="standard"
            value={newTask.nombre}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Descripción"
            type="text"
            name="descripcion"
            fullWidth
            variant="standard"
            value={newTask.descripcion}
            onChange={handleInputChange}
          />
          <FormControl fullWidth variant="standard" margin="dense">
            <InputLabel id="select-proyecto-label">Proyecto</InputLabel>
            <Select
              labelId="select-proyecto-label"
              name="proyecto"
              value={newTask.proyecto.toString()}
              onChange={handleSelectChange}
            >
              {ListServiceProyectos.map((proyecto) => (
                <MenuItem key={proyecto.id} value={proyecto.id}>
                  {proyecto.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth variant="standard" margin="dense">
            <InputLabel id="select-usuario-label">Asignar a</InputLabel>
            <Select
              labelId="select-usuario-label"
              name="asignada_a"
              value={newTask.asignada_a.toString()}
              onChange={handleSelectChange}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={isEditing ? handleUpdateTask : handleCreateTask}>{isEditing ? 'Actualizar' : 'Crear'}</Button>
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

export default TasksTable;
