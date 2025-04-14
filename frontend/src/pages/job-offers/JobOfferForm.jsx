import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { jobOffersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  InputAdornment,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'dayjs/locale/fr';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

// Form validation schema
const schema = yup.object({
  title: yup
    .string()
    .required('Le titre est requis')
    .min(5, 'Le titre doit comporter au moins 5 caractères')
    .max(100, 'Le titre ne doit pas dépasser 100 caractères'),
  description: yup
    .string()
    .required('La description est requise')
    .min(50, 'La description doit comporter au moins 50 caractères'),
  location: yup
    .string()
    .required('Le lieu est requis'),
  company_name: yup
    .string()
    .required('Le nom de l\'entreprise est requis'),
  contract_type: yup
    .string()
    .required('Le type de contrat est requis')
    .oneOf(['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance'], 'Type de contrat invalide'),
  salary_min: yup
    .number()
    .required('Le salaire minimum est requis')
    .positive('Le salaire doit être positif')
    .typeError('Le salaire doit être un nombre'),
  salary_max: yup
    .number()
    .required('Le salaire maximum est requis')
    .positive('Le salaire doit être positif')
    .min(
      yup.ref('salary_min'),
      'Le salaire maximum doit être supérieur au salaire minimum'
    )
    .typeError('Le salaire doit être un nombre'),
  expires_at: yup
    .date()
    .required('La date d\'expiration est requise')
    .min(
      new Date(new Date().setDate(new Date().getDate() + 7)),
      'La date d\'expiration doit être d\'au moins 7 jours à partir d\'aujourd\'hui'
    )
    .typeError('Date invalide'),
  is_active: yup
    .boolean()
    .required('Le statut est requis'),
}).required();

/**
 * Contract type options
 */
const contractTypes = [
  { value: 'CDI', label: 'CDI' },
  { value: 'CDD', label: 'CDD' },
  { value: 'Stage', label: 'Stage' },
  { value: 'Alternance', label: 'Alternance' },
  { value: 'Freelance', label: 'Freelance' },
];

/**
 * JobOfferForm component
 * Used for both creating new job offers and editing existing ones
 */
export default function JobOfferForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [error, setError] = useState('');
  const [isEditMode] = useState(!!id);
  
  // Initialize form with react-hook-form
  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      company_name: '',
      contract_type: '',
      salary_min: '',
      salary_max: '',
      expires_at: dayjs(new Date().setDate(new Date().getDate() + 30)), // Use dayjs instead of Date
      is_active: true,
    }
  });
  
  // If in edit mode, fetch job offer data
  useEffect(() => {
    const fetchJobOffer = async () => {
      try {
        setInitialLoading(true);
        setError('');
        
        const response = await jobOffersAPI.getById(id);
        const jobOffer = response.data;
        
        // Check if the user is the owner of this job offer
        if (jobOffer.user_id !== user?.id) {
          navigate('/job-offers');
          return;
        }
        
        // Set form values from job offer data
        reset({
          title: jobOffer.title,
          description: jobOffer.description,
          location: jobOffer.location,
          company_name: jobOffer.company_name,
          contract_type: jobOffer.contract_type,
          salary_min: jobOffer.salary_min,
          salary_max: jobOffer.salary_max,
          expires_at: dayjs(jobOffer.expires_at), // Use dayjs instead of Date
          is_active: jobOffer.is_active,
        });
      } catch (err) {
        console.error('Error fetching job offer:', err);
        setError('Impossible de charger l\'offre d\'emploi.');
      } finally {
        setInitialLoading(false);
      }
    };
    
    if (isEditMode) {
      fetchJobOffer();
    }
  }, [id, isEditMode, navigate, reset, user?.id]);
  
  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      
      if (isEditMode) {
        // Update existing job offer
        await jobOffersAPI.update(id, data);
      } else {
        // Create new job offer
        await jobOffersAPI.create(data);
      }
      
      // Navigate back to job offers list
      navigate('/job-offers');
    } catch (err) {
      console.error('Error saving job offer:', err);
      
      if (err.response?.data?.errors) {
        // Format validation errors from the API
        const apiErrors = err.response.data.errors;
        const errorMessages = Object.keys(apiErrors)
          .map(key => apiErrors[key].join(', '))
          .join('. ');
        
        setError(errorMessages);
      } else {
        setError(
          err.response?.data?.message || 
          'Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (initialLoading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          component={RouterLink} 
          to="/job-offers"
        >
          Retour aux offres
        </Button>
      </Box>
      
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? 'Modifier l\'offre d\'emploi' : 'Créer une offre d\'emploi'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Titre du poste"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="company_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nom de l'entreprise"
                    fullWidth
                    error={!!errors.company_name}
                    helperText={errors.company_name?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Lieu"
                    placeholder="Ex: Paris, France"
                    fullWidth
                    error={!!errors.location}
                    helperText={errors.location?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Controller
                name="contract_type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Type de contrat"
                    fullWidth
                    error={!!errors.contract_type}
                    helperText={errors.contract_type?.message}
                  >
                    {contractTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Controller
                name="salary_min"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Salaire minimum"
                    type="number"
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">€</InputAdornment>,
                    }}
                    error={!!errors.salary_min}
                    helperText={errors.salary_min?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Controller
                name="salary_max"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Salaire maximum"
                    type="number"
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">€</InputAdornment>,
                    }}
                    error={!!errors.salary_max}
                    helperText={errors.salary_max?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    multiline
                    rows={10}
                    fullWidth
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
                <Controller
                  name="expires_at"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <DatePicker
                      {...rest}
                      label="Date d'expiration"
                      value={value}
                      onChange={onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.expires_at,
                          helperText: errors.expires_at?.message,
                        },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="is_active"
                control={control}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          {...rest}
                          checked={value}
                          onChange={(e) => onChange(e.target.checked)}
                        />
                      }
                      label={value ? "Actif" : "Inactif"}
                    />
                    {errors.is_active && (
                      <FormHelperText error>{errors.is_active.message}</FormHelperText>
                    )}
                  </Box>
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  type="button"
                  component={RouterLink}
                  to="/job-offers"
                  sx={{ mr: 2 }}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                  disabled={loading}
                >
                  {isEditMode ? 'Mettre à jour' : 'Créer l\'offre'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}