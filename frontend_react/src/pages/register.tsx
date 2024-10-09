import React, { useState } from 'react';
import { register } from '../services/authService';
import { RegisterData } from '../types/auth.types';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await register(formData);
      if (localStorage.getItem('token')) {
        window.location.href = '/dashboard';
      } else {
        setIsRegistered(true); // Marcar que el registro fue exitoso
      }
    } catch (err) {
      setError('Hubo un error al registrarse. Intenta de nuevo.');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 8,
        }}
      >
        <Typography variant="h5">Registrarse</Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: '16px' }}>
          <TextField
            label="Nombre de usuario"
            name="username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            label="Contraseña"
            name="password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          {isRegistered && (
            <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
              Ya estás registrado. Puedes iniciar sesión <Link to="/login">aquí</Link>.
            </Typography>
          )}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Registrarse
          </Button>
            <Link to="/login" style={{ marginTop: '16px', display: 'block', textAlign: 'center' }}>
                Iniciar sesión
            </Link>
        </form>
      </Box>
    </Container>
  );
};

export default Register;
