import { useState, useEffect } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { jobApplicationsAPI, jobOffersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Badge,
  Pagination,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  WorkOutline as JobIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';


export default function ApplicationsList() {
  const { jobOfferId } = useParams();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [jobOffer, setJobOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });
  
  const isRecruiter = user?.role === 'recruiter';
  const isAdmin = user?.role === 'admin';
  
  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'reviewing', label: 'En cours de revue' },
    { value: 'accepted', label: 'Accepté' },
    { value: 'rejected', label: 'Refusé' },
  ];
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); 
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError('');
        
        const params = {
          page: currentPage,
          search: filters.search || undefined,
          status: filters.status || undefined,
        };
        
        Object.keys(params).forEach(key => 
          params[key] === undefined && delete params[key]
        );
        
        let response;
        
        try {
          const isAdmin = user?.role === 'admin';
          
          if (jobOfferId) {
            response = await jobApplicationsAPI.getJobOfferApplications(jobOfferId);
            
            const jobOfferResponse = await jobOffersAPI.getById(jobOfferId);
            setJobOffer(jobOfferResponse.data);
          } else if (isRecruiter || isAdmin) {
            console.log("Récupération des applications récentes pour admin/recruteur");
            response = await jobApplicationsAPI.getRecentApplications(100);
          } else {
            console.log("Récupération des applications du candidat");
            response = await jobApplicationsAPI.getMyApplications();
          }
        } catch (err) {
          console.error('Error during API call:', err);
          throw err; 
        }
        
        console.log('API response:', response);
        
        let applicationData;
        
        if (response.data.data) {
          applicationData = response.data.data;
        } else if (response.data.applications) {
          applicationData = response.data.applications;
        } else if (Array.isArray(response.data)) {
          applicationData = response.data;
        } else {
          const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
          applicationData = possibleArrays.length > 0 ? possibleArrays[0] : [];
        }
        
        console.log('Parsed application data:', applicationData);
        setApplications(Array.isArray(applicationData) ? applicationData : []);
        
        if (response.data.meta?.last_page) {
          setTotalPages(response.data.meta.last_page);
        } else {
          setTotalPages(1);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
        let errorMessage = 'Impossible de charger les candidatures.';
        
        if (err.response?.data?.message) {
          errorMessage += ` Détail: ${err.response.data.message}`;
        } else if (err.message) {
          errorMessage += ` Détail: ${err.message}`;
        }
        
        setError(errorMessage);
        setApplications([]); 
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [currentPage, filters, isRecruiter, jobOfferId]);

  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      await jobApplicationsAPI.updateStatus(applicationId, newStatus);
      
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus, last_status_change: new Date().toISOString() } 
            : app
        )
      );
    } catch (err) {
      console.error('Error updating application status:', err);
    }
  };

  const getPageTitle = () => {
    if (jobOfferId && jobOffer) {
      return `Candidatures pour ${jobOffer.title}`;
    } else if (isRecruiter) {
      return 'Toutes les candidatures reçues';
    } else if (isAdmin) {
      return 'Gestion des candidatures (Admin)';
    } else {
      return 'Mes candidatures';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {jobOfferId && (
            <Button 
              startIcon={<ArrowBackIcon />} 
              component={RouterLink} 
              to="/job-offers"
              sx={{ mr: 2 }}
            >
              Retour
            </Button>
          )}
          <Typography variant="h4" component="h1">
            {getPageTitle()}
          </Typography>
        </Box>
        
        <Button
          startIcon={<FilterListIcon />}
          onClick={toggleFilters}
          color="primary"
          variant={showFilters ? "contained" : "outlined"}
        >
          Filtres
        </Button>
      </Box>
      
      {showFilters && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Recherche"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder={isRecruiter ? "Nom du candidat..." : "Titre du poste..."}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Statut</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={filters.status}
                  label="Statut"
                  onChange={handleFilterChange}
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : applications.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Aucune candidature trouvée.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {isRecruiter 
              ? "Vous n'avez pas encore reçu de candidatures." 
              : "Vous n'avez pas encore postulé à des offres d'emploi."}
          </Typography>
          
          {!isRecruiter && (
            <Button 
              variant="contained" 
              color="primary" 
              component={RouterLink} 
              to="/job-offers"
              sx={{ mt: 3 }}
            >
              Parcourir les offres d'emploi
            </Button>
          )}
        </Paper>
      ) : (
        <Paper elevation={2}>
          <List sx={{ width: '100%' }}>
          {(Array.isArray(applications) ? applications : [])?.map((application, index) => (
              <Box key={application.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem
                  alignItems="flex-start"
                  sx={{ py: 2 }}
                >
                  <ListItemIcon>
                    {isRecruiter ? <PersonIcon color="primary" /> : <JobIcon color="primary" />}
                  </ListItemIcon>
                  
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" component="div">
                      {isRecruiter 
                        ? (application.candidate?.name || application.user?.name || 'Candidat anonyme')
                        : (application.job_offer?.title || 'Offre d\'emploi')}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" component="div">
                      {isRecruiter 
                        ? `Poste: ${application.job_offer?.title || 'Non spécifié'}`
                        : `Entreprise: ${application.job_offer?.company_name || 'Non spécifiée'}`}
                    </Typography>
                    
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon fontSize="small" style={{ marginRight: '4px', color: 'rgba(0, 0, 0, 0.6)' }} />
                      <Typography variant="body2" color="text.secondary" component="span">
                        {application.created_at 
                          ? `Candidature soumise le ${new Date(application.created_at).toLocaleDateString()}` 
                          : 'Date non disponible'}
                      </Typography>
                    </div>
                    
                    <div style={{ marginTop: '8px' }}>
                      <StatusChip status={application.status} />
                    </div>
                  </div>
                  
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {isRecruiter && (
                        <Box sx={{ mr: 2 }}>
                          <Tooltip title="Accepter">
                            <IconButton 
                              edge="end" 
                              color="success"
                              onClick={() => handleUpdateStatus(application.id, 'accepted')}
                              disabled={application.status === 'accepted'}
                            >
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Refuser">
                            <IconButton 
                              edge="end" 
                              color="error"
                              onClick={() => handleUpdateStatus(application.id, 'rejected')}
                              disabled={application.status === 'rejected'}
                              sx={{ ml: 1 }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        endIcon={<VisibilityIcon />}
                        component={RouterLink}
                        to={`/applications/${application.id}`}
                      >
                        Détails
                      </Button>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              </Box>
            ))}
          </List>
        </Paper>
      )}
      
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={currentPage} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      )}
    </Container>
  );
}


function StatusChip({ status }) {
  let color = 'default';
  let label = status;
  
  switch (status) {
    case 'pending':
      color = 'default';
      label = 'En attente';
      break;
    case 'reviewing':
      color = 'warning';
      label = 'En cours de revue';
      break;
    case 'accepted':
      color = 'success';
      label = 'Acceptée';
      break;
    case 'rejected':
      color = 'error';
      label = 'Refusée';
      break;
    default:
      break;
  }
  
  return <Chip label={label} color={color} size="small" />;
}