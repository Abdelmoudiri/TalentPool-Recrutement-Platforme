import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
} from '@mui/material';
import {
  Home as HomeIcon,
  Work as WorkIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';


export default function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h1" color="primary" sx={{ fontSize: '6rem', fontWeight: 'bold' }}>
          404
        </Typography>
        
        <Typography variant="h4" gutterBottom>
          Page introuvable
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          La page que vous recherchez n'existe pas ou a été déplacée.
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<HomeIcon />}
                component={RouterLink}
                to="/dashboard"
              >
                Retour au tableau de bord
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<WorkIcon />}
                component={RouterLink}
                to="/job-offers"
              >
                Voir les offres d'emploi
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => window.history.back()}
              >
                Retour en arrière
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/login"
              >
                Se connecter
              </Button>
              
              <Button
                variant="outlined"
                component={RouterLink}
                to="/register"
              >
                Créer un compte
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => window.history.back()}
              >
                Retour en arrière
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}