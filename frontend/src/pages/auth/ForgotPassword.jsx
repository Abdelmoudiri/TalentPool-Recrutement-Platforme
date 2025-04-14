import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import { LockReset as LockResetIcon } from '@mui/icons-material';

// Form validation schema
const schema = yup.object({
  email: yup
    .string()
    .email('Veuillez entrer une adresse email valide')
    .required('L\'email est requis'),
}).required();

/**
 * ForgotPassword component
 * Allows users to request a password reset link
 */
export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Initialize form with react-hook-form
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
    }
  });

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      
      // Call forgotPassword method from auth context
      await forgotPassword(data.email);
      
      // Show success message
      setSuccess(true);
    } catch (err) {
      console.error('Password reset request error:', err);
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de la demande de réinitialisation. Veuillez réessayer.'
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
          <LockResetIcon />
        </Avatar>
        
        <Typography component="h1" variant="h5">
          Mot de passe oublié
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          Entrez votre adresse email pour recevoir un lien de réinitialisation de mot de passe.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
            Si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation.
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3, width: '100%' }}>
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
            disabled={success}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || success}
          >
            {loading ? <CircularProgress size={24} /> : 'Envoyer le lien de réinitialisation'}
          </Button>
          
          <Grid container justifyContent="space-between">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Retour à la connexion
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                Créer un compte
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}