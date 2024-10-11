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
  Snackbar,
  Alert,
} from '@mui/material';

import { getUsers, getUser, deleteUser, updateUser, createUser } from '../../services/user.service';
import { User } from '../../types/auth.types';
import { RegisterData } from '../../types/auth.types';

const UsersTable: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false); // Estado del modal
  const [newUser, setNewUser] = useState<RegisterData>({
    username: '',
    password: '',
    email: ''
  }); // Estado para el nuevo usuario
  const [isEditing, setIsEditing] = useState(false); // Estado para saber si estamos editando
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); // ID del usuario actual a editar
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Estado del Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Mensaje del Snackbar
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success'); // Tipo de alerta

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const userList = await getUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users', error);
      setSnackbarMessage('Error al cargar usuarios');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setIsEditing(false); // Reiniciar el estado de edición
    setNewUser({ username: '', password: '', email: '' }); // Reiniciar el formulario
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false); // Reiniciar el estado de edición
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleCreateUser = async () => {
    try {
      await createUser(newUser).then(() => {
        fetchUsers();
        setSnackbarMessage('Usuario creado con éxito');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setOpen(false);
      }).catch((error) => {
        setSnackbarMessage('Error:' + error.response.data.msg);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setOpen(false);
      });

    } catch (error) {
      console.error('Error creando usuario', error);
      setSnackbarMessage('Error al crear usuario');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleEditUser = async (id: number) => {
    try {
      const user = await getUser(id.toString());
      if (user) {
        setCurrentUserId(user.id);
        setNewUser({
          username: user.username,
          email: user.email,
          password: '' // No mostramos la contraseña
        });
        setIsEditing(true);
        setOpen(true);
      }
    } catch (error) {
      console.error('Error obteniendo usuario', error);
    }
  };

  const handleUpdateUser = async () => {
    if (currentUserId !== null) {
      try {
        await updateUser(currentUserId.toString(), { ...newUser, id: currentUserId }).then(() => {
          fetchUsers();
          setSnackbarMessage('Usuario actualizado con éxito');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          setOpen(false);
        }).catch((error) => {
          fetchUsers();
          setSnackbarMessage('Error:' + error.response.data.msg);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setOpen(false);
        });
      } catch (error) {
        console.error('Error actualizando usuario', error);
      }
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await deleteUser(id.toString()).then(() => {
        setUsers(users.filter(user => user.id !== id));
        setSnackbarMessage('Usuario eliminado con éxito');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }).catch((error) => {
        setSnackbarMessage('Error:' + error.response.data.msg);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
    } catch (error) {
      console.error('Error eliminando usuario', error);
    }
  };

  return (
    <div>
      {isAdmin && (
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Crear Usuario
        </Button>
      )}
      <TableContainer component={Paper} style={{ marginTop: '16px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.rol}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEditUser(user.id)} color="primary">
                    Editar
                  </Button>
                  <Button onClick={() => handleDeleteUser(user.id)} color="secondary">
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para crear o editar usuario */}
      <Dialog open={open} onClose={handleClose} aria-labelledby="dialog-title" aria-describedby="dialog-description">
        <DialogTitle id="dialog-title">{isEditing ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            type="text"
            fullWidth
            name="username"
            value={newUser.username}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Correo"
            type="email"
            fullWidth
            name="email"
            value={newUser.email}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Contraseña"
            type="password"
            fullWidth
            name="password"
            value={newUser.password}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={isEditing ? handleUpdateUser : handleCreateUser} color="primary">
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

export default UsersTable;
