import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { jobOffersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Euro as EuroIcon,
} from '@mui/icons-material';

/**
 * JobOffersList component
 * Displays a list of job offers with search, filter and pagination
 */
export default function JobOffersList() {
  const { user } = useAuth();
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    contractType: '',
    minSalary: '',
    onlyMine: false, // For recruiters to see only their own job offers
  });
  
  // Check if user is a recruiter
  const isRecruiter = user?.role === 'recruiter';
  
  // Contract type options
  const contractTypes = [
    { value: '', label: 'Tous les types' },
    { value: 'CDI', label: 'CDI' },
    { value: 'CDD', label: 'CDD' },
    { value: 'Stage', label: 'Stage' },
    { value: 'Alternance', label: 'Alternance' },
    { value: 'Freelance', label: 'Freelance' },
  ];
  
  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Toggle "only mine" filter for recruiters
  const toggleOnlyMine = () => {
    setFilters((prev) => ({
      ...prev,
      onlyMine: !prev.onlyMine,
    }));
    setCurrentPage(1); // Reset to first page
  };
  
  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  
  // Fetch job offers with filters
  useEffect(() => {
    const fetchJobOffers = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Prepare query parameters based on filters
        const params = {
          page: currentPage,
          search: filters.search || undefined,
          location: filters.location || undefined,
          contract_type: filters.contractType || undefined,
          min_salary: filters.minSalary || undefined,
          user_id: (isRecruiter && filters.onlyMine) ? user.id : undefined,
        };
        
        // Clean up undefined values
        Object.keys(params).forEach(key => 
          params[key] === undefined && delete params[key]
        );
        
        // Fetch job offers from API
        const response = await jobOffersAPI.getAll(params);
        
        // Set job offers and pagination info
        setJobOffers(response.data.job_offers || []);
        setTotalPages(1); // Backend doesn't support pagination yet
      } catch (err) {
        console.error('Error fetching job offers:', err);
        setError('Impossible de charger les offres d\'emploi.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobOffers();
  }, [currentPage, filters, isRecruiter, user?.id]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {isRecruiter ? 'Gestion des offres d\'emploi' : 'Offres d\'emploi'}
        </Typography>
        
        {isRecruiter && (
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/job-offers/new"
            startIcon={<AddIcon />}
          >
            Créer une offre
          </Button>
        )}
      </Box>
      
      {/* Filter section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Filtres
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Recherche"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Titre, compétences, mots-clés..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Lieu"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Ville, pays..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="contract-type-label">Type de contrat</InputLabel>
              <Select
                labelId="contract-type-label"
                id="contract-type"
                name="contractType"
                value={filters.contractType}
                label="Type de contrat"
                onChange={handleFilterChange}
              >
                {contractTypes.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Salaire min"
              name="minSalary"
              type="number"
              value={filters.minSalary}
              onChange={handleFilterChange}
              placeholder="30000"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EuroIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          {isRecruiter && (
            <Grid item xs={12}>
              <Button 
                variant={filters.onlyMine ? "contained" : "outlined"}
                color="primary"
                onClick={toggleOnlyMine}
                size="small"
              >
                {filters.onlyMine ? "Mes offres uniquement" : "Toutes les offres"}
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>
      
      {/* Results section */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : jobOffers.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Aucune offre d'emploi ne correspond à vos critères.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Essayez de modifier vos filtres pour trouver plus de résultats.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Jobs grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {(Array.isArray(jobOffers) ? jobOffers : []).map((jobOffer) => (
              <Grid item xs={12} sm={6} md={4} key={jobOffer.id}>
              <JobOfferCard 
                jobOffer={jobOffer} 
                isRecruiter={isRecruiter}
                user={user}
              />
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
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
        </>
      )}
    </Container>
  );
}

/**
 * Job Offer Card Component
 * Displays a job offer with its details
 */
function JobOfferCard({ jobOffer, isRecruiter, user }) {
  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom noWrap>
          {jobOffer.title}
        </Typography>
        
        <Typography color="text.secondary" gutterBottom>
          {jobOffer.company_name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          <Typography variant="body2">{jobOffer.location}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <WorkIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          <Typography variant="body2">{jobOffer.contract_type}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <EuroIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          <Typography variant="body2">
            {jobOffer.salary_min} - {jobOffer.salary_max} €
          </Typography>
        </Box>
        
        {!jobOffer.is_active && (
          <Chip 
            label="Inactive" 
            color="error" 
            size="small" 
            sx={{ mt: 1 }} 
          />
        )}
      </CardContent>
      
      <Divider />
      
      <CardActions>
        <Button 
          size="small" 
          component={RouterLink} 
          to={`/job-offers/${jobOffer.id}`}
        >
          Voir détails
        </Button>
        
        {isRecruiter && jobOffer.user_id === user?.id && (
          <>
            <Button 
              size="small" 
              component={RouterLink} 
              to={`/job-offers/${jobOffer.id}/edit`}
              color="primary"
            >
              Modifier
            </Button>
            <Button 
              size="small" 
              component={RouterLink} 
              to={`/applications/job/${jobOffer.id}`}
              color="secondary"
            >
              Candidatures
            </Button>
          </>
        )}
      </CardActions>
    </Card>
  );
}