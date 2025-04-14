import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { jobOffersAPI, jobApplicationsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Chip,
  Divider,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Euro as EuroIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
} from '@mui/icons-material';

// Form validation schema for job application
const applicationSchema = yup.object({
  cover_letter: yup
    .string()
    .required('La lettre de motivation est requise')
    .min(50, 'La lettre de motivation doit comporter au moins 50 caractères'),
}).required();

/**
 * JobOfferDetails component
 * Displays detailed information about a specific job offer
 * Allows candidates to apply and recruiters to edit/delete their offers
 */
export default function JobOfferDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobOffer, setJobOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [applicationError, setApplicationError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Check if user is a recruiter
  const isRecruiter = user?.role === 'recruiter';
  
  // Check if the user is the owner of this job offer
  const isOwner = jobOffer && isRecruiter && jobOffer.user_id === user?.id;
  
  // Initialize form with react-hook-form
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(applicationSchema),
    defaultValues: {
      cover_letter: '',
    }
  });

  // Fetch job offer data
  useEffect(() => {
    const fetchJobOffer = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await jobOffersAPI.getById(id);
        setJobOffer(response.data);
      } catch (err) {
        console.error('Error fetching job offer:', err);
        setError('Impossible de charger l\'offre d\'emploi.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobOffer();
  }, [id]);

  // Handle job application submission
  const handleApply = async (data) => {
    try {
      setApplying(true);
      setApplicationError('');
      
      await jobApplicationsAPI.apply(id, data);
      
      setApplicationSuccess(true);
      reset(); // Clear form fields
    } catch (err) {
      console.error('Error applying to job:', err);
      
      if (err.response?.data?.message) {
        setApplicationError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        // Format validation errors from the API
        const apiErrors = err.response.data.errors;
        const errorMessages = Object.keys(apiErrors)
          .map(key => apiErrors[key].join(', '))
          .join('. ');
        
        setApplicationError(errorMessages);
      } else {
        setApplicationError('Une erreur est survenue lors de la candidature. Veuillez réessayer.');
      }
    } finally {
      setApplying(false);
    }
  };

  // Handle job offer deletion
  const handleDelete = async () => {
    try {
      setDeleting(true);
      
      await jobOffersAPI.delete(id);
      
      // Close dialog and navigate back to list
      setDeleteDialogOpen(false);
      navigate('/job-offers', { replace: true });
    } catch (err) {
      console.error('Error deleting job offer:', err);
      setError('Impossible de supprimer cette offre d\'emploi.');
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  // Handle delete dialog open/close
  const openDeleteDialog = () => setDeleteDialogOpen(true);
  const closeDeleteDialog = () => setDeleteDialogOpen(false);

  // Render loading state
  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          component={RouterLink} 
          to="/job-offers" 
          sx={{ mt: 2 }}
        >
          Retour aux offres
        </Button>
      </Container>
    );
  }
  
  // Render job not found
  if (!jobOffer) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Offre d'emploi introuvable</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          component={RouterLink} 
          to="/job-offers" 
          sx={{ mt: 2 }}
        >
          Retour aux offres
        </Button>
      </Container>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back button and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          component={RouterLink} 
          to="/job-offers"
        >
          Retour aux offres
        </Button>
        
        {isOwner && (
          <Box>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<EditIcon />}
              component={RouterLink}
              to={`/job-offers/${id}/edit`}
              sx={{ mr: 1 }}
            >
              Modifier
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={openDeleteDialog}
            >
              Supprimer
            </Button>
          </Box>
        )}
      </Box>
      
      {/* Job offer details */}
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {jobOffer.title}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {jobOffer.company_name}
                </Typography>
              </Box>
              
              {!jobOffer.is_active && (
                <Chip label="Inactive" color="error" />
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <InfoItem 
              icon={<LocationIcon color="primary" />}
              label="Lieu"
              value={jobOffer.location}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <InfoItem 
              icon={<WorkIcon color="primary" />}
              label="Type de contrat"
              value={jobOffer.contract_type}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <InfoItem 
              icon={<EuroIcon color="primary" />}
              label="Salaire"
              value={`${jobOffer.salary_min} - ${jobOffer.salary_max} €`}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <InfoItem 
              icon={<CalendarIcon color="primary" />}
              label="Date d'expiration"
              value={formatDate(jobOffer.expires_at)}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {jobOffer.description}
            </Typography>
          </Grid>
        </Grid>
        
        {/* Application button for candidates */}
        {!isRecruiter && jobOffer.is_active && (
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => document.getElementById('application-form').scrollIntoView({ behavior: 'smooth' })}
            >
              Postuler maintenant
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Application form for candidates */}
      {!isRecruiter && jobOffer.is_active && (
        <Paper id="application-form" elevation={2} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Postuler
          </Typography>
          
          {applicationSuccess ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Votre candidature a été envoyée avec succès!
            </Alert>
          ) : (
            <>
              {applicationError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {applicationError}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit(handleApply)}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Lettre de motivation"
                  placeholder="Présentez-vous et expliquez pourquoi vous êtes intéressé par ce poste..."
                  margin="normal"
                  {...register('cover_letter')}
                  error={!!errors.cover_letter}
                  helperText={errors.cover_letter?.message}
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SendIcon />}
                  disabled={applying}
                  sx={{ mt: 2 }}
                >
                  {applying ? <CircularProgress size={24} /> : 'Envoyer ma candidature'}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      )}
      
      {/* Applications list link for recruiters who own this job */}
      {isOwner && (
        <Button 
          variant="contained" 
          color="primary"
          component={RouterLink}
          to={`/applications/job/${id}`}
          sx={{ mt: 3 }}
        >
          Voir les candidatures pour cette offre
        </Button>
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Supprimer cette offre?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette offre d'emploi? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={deleting}>Annuler</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={24} /> : null}
          >
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

/**
 * InfoItem Component
 * Displays a labeled piece of information with an icon
 */
function InfoItem({ icon, label, value }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {icon}
            <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 1 }}>
              {label}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}