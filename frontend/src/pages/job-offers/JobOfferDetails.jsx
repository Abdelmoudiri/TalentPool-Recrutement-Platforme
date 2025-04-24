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

const applicationSchema = yup.object({
  cover_letter: yup
    .string()
    .required('La lettre de motivation est requise')
    .min(50, 'La lettre de motivation doit comporter au moins 50 caractères'),
  cv: yup
    .mixed()
    .test('fileSize', 'Le fichier est trop volumineux (max 2MB)', (value) => {
      if (!value || !value[0]) return true; 
      return value[0].size <= 2 * 1024 * 1024; 
    })
    .test('fileType', 'Format de fichier non supporté (.pdf, .doc, .docx uniquement)', (value) => {
      if (!value || !value[0]) return true; 
      const supportedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      return supportedTypes.includes(value[0].type);
    }),
}).required();


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
  
  const isRecruiter = user?.role === 'recruiter';
  
  const isOwner = jobOffer && isRecruiter && jobOffer.user_id === user?.id;
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(applicationSchema),
    defaultValues: {
      cover_letter: '',
    }
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    const fetchJobOffer = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await jobOffersAPI.getById(id);
        console.log('Job offer data:', response.data);
        const jobOfferData = response.data.job_offer || response.data;
        
        const processedOffer = {
          ...jobOfferData,
          is_active: jobOfferData.is_active === 1 ? true : (jobOfferData.is_active === 0 ? false : jobOfferData.is_active)
        };
        
        console.log('is_active value (processed):', processedOffer.is_active, typeof processedOffer.is_active);
        setJobOffer(processedOffer);
      } catch (err) {
        console.error('Error fetching job offer:', err);
        setError('Impossible de charger l\'offre d\'emploi.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobOffer();
  }, [id]);

  const handleApply = async (data) => {
    try {
        setApplying(true);
        setApplicationError('');
        setFileError('');

        const applicationData = {
            cover_letter: data.cover_letter
        };

        if (data.cv && data.cv[0]) {
            applicationData.cv = data.cv[0];
        }

        // const response = await jobApplicationsAPI.apply(id, applicationData);

        setApplicationSuccess(true);
        reset(); 
        setSelectedFile(null);
    } catch (err) {
        console.error('Error applying to job:', err);

        if (err.response?.data?.message) {
            setApplicationError(err.response.data.message);
        } else if (err.response?.data?.errors) {
            const errorMessages = Object.values(err.response.data.errors)
                .flat()
                .join(', ');
            setApplicationError(errorMessages);
        } else {
            setApplicationError('Une erreur est survenue lors de la candidature. Veuillez réessayer.');
        }
    } finally {
        setApplying(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFileError('Le fichier est trop volumineux (max 2MB)');
        setSelectedFile(null);
        return;
      }
      
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setFileError('Format de fichier non supporté (.pdf, .doc, .docx uniquement)');
        setSelectedFile(null);
        return;
      }
      
      setFileError('');
      setSelectedFile(file);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      
      await jobOffersAPI.delete(id);
      
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

  const openDeleteDialog = () => setDeleteDialogOpen(true);
  const closeDeleteDialog = () => setDeleteDialogOpen(false);

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
              
              {jobOffer.is_active === false && (
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
        
        {!isRecruiter && jobOffer.is_active === true && (
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
      
      {!isRecruiter && jobOffer.is_active === true && (
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
                
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    CV (optionnel)
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    id="cv-upload"
                    style={{ display: 'none' }}
                    {...register('cv')}
                    onChange={(e) => {
                      register('cv').onChange(e);
                      handleFileChange(e);
                    }}
                  />
                  <label htmlFor="cv-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      sx={{ mr: 2 }}
                    >
                      Parcourir...
                    </Button>
                    {selectedFile ? (
                      <Typography variant="body2" component="span">
                        {selectedFile.name}
                      </Typography>
                    ) : (
                      <Typography variant="body2" component="span" color="text.secondary">
                        Aucun fichier sélectionné
                      </Typography>
                    )}
                  </label>
                  {(errors.cv || fileError) && (
                    <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
                      {errors.cv?.message || fileError}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    Formats acceptés: PDF, DOC, DOCX. Taille maximale: 2MB
                  </Typography>
                </Box>
                
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