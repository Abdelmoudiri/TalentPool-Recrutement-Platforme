import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobOffersAPI, jobApplicationsAPI } from '../services/api';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Work as WorkIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

/**
 * Dashboard page component
 * Displays different content based on user role (candidate or recruiter)
 */
export default function Dashboard() {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Check if user is a recruiter
  const isRecruiter = user?.role === 'recruiter';
  
  // Fetch dashboard data based on user role
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        let stats = {};
        let items = [];
        
        // Get statistics based on user role
        if (isRecruiter) {
          try {
            // Recruiter: get job offer statistics
            const statsResponse = await jobOffersAPI.getStatistics();
            stats = statsResponse.data.statistics || statsResponse.data || {};
            console.log('Recruiter stats:', stats);
          } catch (err) {
            console.error('Error fetching recruiter statistics:', err);
            stats = {
              active_offers: 0,
              total_applications: 0,
              pending_applications: 0,
              accepted_applications: 0
            };
          }
          
          // For recruiters, fetch recent applications
          try {
            const recentAppsResponse = await jobApplicationsAPI.getRecentApplications(5);
            items = recentAppsResponse.data.applications || recentAppsResponse.data || [];
            console.log('Recent applications:', items);
          } catch (err) {
            console.error('Error fetching recent applications:', err);
            items = []; // Initialize with empty array to avoid errors
          }
        } else {
          try {
            // Candidate: get application statistics
            const statsResponse = await jobApplicationsAPI.getStatistics();
            stats = statsResponse.data.statistics || statsResponse.data || {};
            console.log('Candidate stats:', stats);
          } catch (err) {
            console.error('Error fetching candidate statistics:', err);
            stats = {
              total_applications: 0,
              reviewing_applications: 0,
              accepted_applications: 0
            };
          }
          
          try {
            // Get recent job offers
            const recentResponse = await jobOffersAPI.getAll({ limit: 5 });
            items = recentResponse.data.data || recentResponse.data || [];
            console.log('Recent job offers:', items);
          } catch (err) {
            console.error('Error fetching recent job offers:', err);
            items = [];
          }
        }
        
        setStatistics(stats);
        setRecentItems(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Impossible de charger les données du tableau de bord');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchDashboardData();
    }
  }, [user, isRecruiter]);

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
      </Container>
    );
  }

  // Render recruiter dashboard
  if (isRecruiter) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tableau de bord recruteur
        </Typography>
        
        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Offres actives" 
              value={statistics?.active_offers || statistics?.activeJobOffers || 0}
              icon={<WorkIcon />} 
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Candidatures totales" 
              value={statistics?.total_applications || statistics?.totalApplications || 0}
              icon={<PersonIcon />} 
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Candidatures en attente" 
              value={statistics?.pending_applications || statistics?.pendingApplications || 0}
              icon={<VisibilityIcon />} 
              color="#ed6c02"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Candidats recrutés" 
              value={statistics?.accepted_applications || statistics?.acceptedApplications || 0}
              icon={<PersonIcon />} 
              color="#9c27b0"
            />
          </Grid>
        </Grid>
        
        {/* Quick Actions */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Actions rapides
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/job-offers/new"
                startIcon={<AddIcon />}
              >
                Publier une offre
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                component={RouterLink} 
                to="/job-offers"
              >
                Gérer mes offres
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                component={RouterLink} 
                to="/applications"
              >
                Voir les candidatures
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Recent Applications */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Candidatures récentes
            </Typography>
            <Button 
              component={RouterLink} 
              to="/applications" 
              endIcon={<ArrowForwardIcon />}
              size="small"
            >
              Voir tout
            </Button>
          </Box>
          
          {Array.isArray(recentItems) && recentItems.length > 0 ? (
            <List>
              {recentItems.map((application) => {
                // Vérifier si l'application a toutes les propriétés nécessaires
                if (!application || !application.id) {
                  return null; // Ne pas rendre cet élément s'il est invalide
                }
                
                return (
                  <Box key={application.id}>
                    <ListItem 
                      component={RouterLink} 
                      to={`/applications/${application.id}`}
                      sx={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={application.candidate?.name || application.user?.name || 'Candidat anonyme'}
                        secondary={`Offre: ${application.job_offer?.title || 'Non spécifié'}`}
                      />
                      <Chip 
                        label={getStatusLabel(application.status || 'pending')}
                        color={getStatusColor(application.status || 'pending')}
                        size="small"
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </Box>
                );
              })}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Aucune candidature récente.
            </Typography>
          )}
        </Paper>
      </Container>
    );
  }
  
  // Render candidate dashboard
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord candidat
      </Typography>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Candidatures envoyées" 
            value={statistics?.totalApplications || 0}
            icon={<WorkIcon />} 
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="En cours de revue" 
            value={statistics?.reviewing_applications || statistics?.reviewingApplications || 0}
            icon={<VisibilityIcon />} 
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Acceptées" 
            value={statistics?.acceptedApplications || 0}
            icon={<PersonIcon />} 
            color="#2e7d32"
          />
        </Grid>
      </Grid>
      
      {/* Quick Actions */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Actions rapides
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button 
              variant="contained" 
              component={RouterLink} 
              to="/job-offers"
              startIcon={<WorkIcon />}
            >
              Chercher des offres
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="outlined" 
              component={RouterLink} 
              to="/applications/my"
            >
              Mes candidatures
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Recent Job Offers */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Offres d'emploi récentes
          </Typography>
          <Button 
            component={RouterLink} 
            to="/job-offers" 
            endIcon={<ArrowForwardIcon />}
            size="small"
          >
            Voir tout
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {Array.isArray(recentItems) && recentItems.length > 0 ? (
            recentItems.map((jobOffer) => {
              // Vérifier si l'offre est valide
              if (!jobOffer || !jobOffer.id) {
                return null;
              }
              
              return (
                <Grid item xs={12} sm={6} md={4} key={jobOffer.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="div" noWrap>
                        {jobOffer.title || 'Titre non disponible'}
                      </Typography>
                      <Typography color="text.secondary" gutterBottom>
                        {jobOffer.company_name || 'Entreprise non spécifiée'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {jobOffer.location || 'Lieu non spécifié'}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          size="small" 
                          label={jobOffer.contract_type || 'Type non spécifié'}
                          sx={{ mr: 1, mb: 1 }}
                        />
                        <Chip 
                          size="small" 
                          label={`${jobOffer.salary_min || '?'} - ${jobOffer.salary_max || '?'} €`} 
                          sx={{ mb: 1 }}
                        />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        component={RouterLink} 
                        to={`/job-offers/${jobOffer.id}`}
                      >
                        Voir détails
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })
          ) : (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Aucune offre d'emploi récente.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
}

/**
 * Statistic Card Component
 */
function StatCard({ title, value, icon, color }) {
  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: 140,
        position: 'relative',
        overflow: 'hidden',
      }}
      elevation={2}
    >
      <Box 
        sx={{ 
          position: 'absolute',
          top: -15,
          right: -15,
          opacity: 0.1,
          transform: 'rotate(15deg)',
          fontSize: '8rem',
          color: color,
        }}
      >
        {icon}
      </Box>
      
      <Typography component="h2" variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography component="p" variant="h3">
        {value}
      </Typography>
    </Paper>
  );
}

/**
 * Get status label based on status code
 */
function getStatusLabel(status) {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'reviewing':
      return 'En cours';
    case 'accepted':
      return 'Accepté';
    case 'rejected':
      return 'Refusé';
    default:
      return status;
  }
}

/**
 * Get status color based on status code
 */
function getStatusColor(status) {
  switch (status) {
    case 'pending':
      return 'default';
    case 'reviewing':
      return 'warning';
    case 'accepted':
      return 'success';
    case 'rejected':
      return 'error';
    default:
      return 'default';
  }
}