// src/pages/UsersTable.tsx
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
} from '@mui/material';
import { getUsers } from '../../services/user.service'; // Asegúrate de tener este servicio
import { User } from '../../types/auth.types';

const UsersTable: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false); // Estado del modal
  const [newUser, setNewUser] = useState({ username: '', email: '', rol: '' }); // Estado para el nuevo usuario

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await getUsers();
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    };

    fetchUsers();
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleCreateUser = async () => {
    // Lógica para crear un nuevo usuario, usando el servicio correspondiente
    // Aquí debes llamar a tu API para crear el usuario
    console.log('Crear usuario:', newUser);
    handleClose();
  };

  const handleEditUser = (id: number) => {
    // Lógica para editar el usuario (puedes implementar un modal similar al de crear)
    console.log('Editar usuario con ID:', id);
  };

  const handleDeleteUser = (id: number) => {
    // Lógica para eliminar el usuario (aquí puedes llamar a tu API para eliminar)
    console.log('Eliminar usuario con ID:', id);
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

      {/* Modal para crear un nuevo usuario */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Crear Usuario</DialogTitle>
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
            label="Rol"
            type="text"
            fullWidth
            name="rol"
            value={newUser.rol}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleCreateUser} color="primary">
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UsersTable;
