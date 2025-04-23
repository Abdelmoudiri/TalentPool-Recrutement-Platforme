import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobOffersAPI, jobApplicationsAPI } from '../services/api';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  Description as ApplicationIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

/**
 * Admin Dashboard Component
 * Displays administrative functions and overview of system data
 */
export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    usersCount: 0,
    recruitersCount: 0,
    candidatesCount: 0,
    jobOffersCount: 0,
    applicationsCount: 0,
  });
  
  const [recentJobOffers, setRecentJobOffers] = useState([]);
  
  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Fetch admin statistics and data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, these would be API calls to admin endpoints
        // For now, we're using the existing job offers and applications endpoints
        
        // Fetch job offers
        const jobOffersResponse = await jobOffersAPI.getAll();
        const jobOffers = jobOffersResponse.data.job_offers || [];
        
        // Fetch applications statistics
        const applicationsResponse = await jobApplicationsAPI.getStatistics();
        const applicationStats = applicationsResponse.data.statistics || {};
        
        // Set mock statistics (in real implementation, these would come from the API)
        setStats({
          usersCount: 25,
          recruitersCount: 10,
          candidatesCount: 15,
          jobOffersCount: jobOffers.length,
          applicationsCount: applicationStats.total_applications || 0,
        });
        
        // Set recent data
        setRecentJobOffers(jobOffers.slice(0, 5));
        
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Impossible de charger les données administratives.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);
  
  // If still checking authentication, show loading
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Only admins can access this page
  if (user.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Vous n'avez pas l'autorisation d'accéder à cette page. Seuls les administrateurs peuvent y accéder.
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tableau de bord Administration
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <PeopleIcon />
                    </Avatar>
                    <Typography variant="h6">Utilisateurs</Typography>
                  </Box>
                  <Typography variant="h4" component="div">
                    {stats.usersCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {stats.recruitersCount} recruteurs, {stats.candidatesCount} candidats
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <WorkIcon />
                    </Avatar>
                    <Typography variant="h6">Offres d'emploi</Typography>
                  </Box>
                  <Typography variant="h4" component="div">
                    {stats.jobOffersCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Publiées par les recruteurs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <ApplicationIcon />
                    </Avatar>
                    <Typography variant="h6">Candidatures</Typography>
                  </Box>
                  <Typography variant="h4" component="div">
                    {stats.applicationsCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Soumises par les candidats
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Admin Action Buttons */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Actions administratives
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ textTransform: 'none' }}
                  startIcon={<PeopleIcon />}
                  component={RouterLink}
                  to="/applications"
                  onClick={() => console.log("Redirection vers gestion des candidatures")}
                >
                  Gérer les candidatures
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ textTransform: 'none' }}
                  startIcon={<WorkIcon />}
                  component={RouterLink}
                  to="/job-offers"
                  onClick={() => console.log("Redirection vers modération des offres")}
                >
                  Modérer les offres
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ textTransform: 'none' }}
                  startIcon={<BusinessIcon />}
                  onClick={() => {
                    alert("Fonctionnalité en cours de développement");
                    console.log("Redirection vers paramètres système (non implémenté)");
                  }}
                >
                  Paramètres système
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ textTransform: 'none' }}
                  color="error"
                  onClick={() => {
                    alert("Fonctionnalité en cours de développement");
                    console.log("Redirection vers maintenance (non implémenté)");
                  }}
                >
                  Maintenance
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Recent Activity */}
          <Grid container spacing={3}>
            {/* Recent Job Offers */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Offres d'emploi récentes
                </Typography>
                
                {recentJobOffers.length === 0 ? (
                  <Typography color="text.secondary" sx={{ p: 2 }}>
                    Aucune offre d'emploi récente.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Titre</TableCell>
                          <TableCell>Entreprise</TableCell>
                          <TableCell>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentJobOffers.map((offer) => (
                          <TableRow key={offer.id}>
                            <TableCell>
                              <RouterLink to={`/job-offers/${offer.id}`}>
                                {offer.title}
                              </RouterLink>
                            </TableCell>
                            <TableCell>{offer.company_name}</TableCell>
                            <TableCell>
                              {offer.is_active ? 'Active' : 'Inactive'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    size="small" 
                    component={RouterLink} 
                    to="/job-offers"
                  >
                    Voir tous
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            {/* Recent Users */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Activités récentes
                </Typography>
                
                <List sx={{ width: '100%' }}>
                  {/* These would be real activities in a production app */}
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Nouveau compte créé" 
                      secondary="Il y a 2 heures"
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <WorkIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Nouvelle offre d'emploi publiée" 
                      secondary="Il y a 3 heures"
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <ApplicationIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Nouvelle candidature soumise" 
                      secondary="Il y a 5 heures"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}