import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';

const schema = yup.object({
  email: yup
    .string()
    .email('Veuillez entrer une adresse email valide')
    .required('L\'email est requis'),
  password: yup
    .string()
    .required('Le mot de passe est requis')
    .min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
}).required();


export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      
      await login(data);
      
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de la connexion. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} 
        sx={{ 
          marginTop: 8, 
          padding: 4, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockIcon />
        </Avatar>
        
        <Typography component="h1" variant="h5">
          Connexion
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Adresse email"
            autoComplete="email"
            autoFocus
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="password"
            label="Mot de passe"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Se connecter'}
          </Button>
          
          <Grid container>
            <Grid item xs>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Mot de passe oublié?
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Pas de compte? Inscrivez-vous"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}