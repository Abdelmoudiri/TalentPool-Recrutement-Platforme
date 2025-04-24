import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';

const schema = yup.object({
  name: yup
    .string()
    .required('Le nom est requis')
    .min(2, 'Le nom doit comporter au moins 2 caractères'),
  email: yup
    .string()
    .email('Veuillez entrer une adresse email valide')
    .required('L\'email est requis'),
  password: yup
    .string()
    .required('Le mot de passe est requis')
    .min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Les mots de passe doivent correspondre')
    .required('La confirmation du mot de passe est requise'),
  role: yup
    .string()
    .oneOf(['candidate', 'recruiter'], 'Veuillez sélectionner un rôle valide')
    .required('Le rôle est requis'),
}).required();


export default function Register() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'candidate',
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      
      await authRegister(data);
      
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response?.data?.errors) {
        const apiErrors = err.response.data.errors;
        const errorMessages = Object.keys(apiErrors)
          .map(key => apiErrors[key].join(', '))
          .join('. ');
        
        setError(errorMessages);
      } else {
        setError(
          err.response?.data?.message || 
          'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.'
        );
      }
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
          <PersonAddIcon />
        </Avatar>
        
        <Typography component="h1" variant="h5">
          Inscription
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="name"
                label="Nom complet"
                autoComplete="name"
                autoFocus
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Adresse email"
                autoComplete="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="password"
                label="Mot de passe"
                type="password"
                autoComplete="new-password"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="password_confirmation"
                label="Confirmer le mot de passe"
                type="password"
                autoComplete="new-password"
                {...register('password_confirmation')}
                error={!!errors.password_confirmation}
                helperText={errors.password_confirmation?.message}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl component="fieldset" error={!!errors.role}>
                <FormLabel component="legend">Je suis un(e)</FormLabel>
                <RadioGroup row aria-label="role" defaultValue="candidate">
                  <FormControlLabel 
                    value="candidate" 
                    control={<Radio {...register('role')} />} 
                    label="Candidat" 
                  />
                  <FormControlLabel 
                    value="recruiter" 
                    control={<Radio {...register('role')} />} 
                    label="Recruteur" 
                  />
                </RadioGroup>
                {errors.role && (
                  <FormHelperText>{errors.role.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'S\'inscrire'}
          </Button>
          
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Déjà un compte? Connectez-vous
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}