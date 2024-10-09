import { useState } from 'react';
import { useAuthContext } from './../context/authContext';
import { Link } from 'react-router-dom';
import { TextField, Button, Typography, Container, Box } from '@mui/material';

const Login = () => {
  const { loginUser } = useAuthContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginUser(username, password);
      if (localStorage.getItem('token')) {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Login failed', error);
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
        <Typography variant="h5">Login</Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: '16px' }}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
          <Link to="/register" style={{ marginTop: '16px', display: 'block', textAlign: 'center' }}>
            Register
          </Link>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
