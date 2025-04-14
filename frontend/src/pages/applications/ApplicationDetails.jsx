import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { jobApplicationsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
  ArrowBack as ArrowBackIcon,
  Update as UpdateIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

/**
 * ApplicationDetails component
 * Displays detailed information about a job application
 * Shows different actions based on user role
 */
export default function ApplicationDetails() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Check if user is a recruiter
  const isRecruiter = user?.role === 'recruiter';
  
  // Check if the user is the owner of this application (candidate)
  const isOwner = application && !isRecruiter && application.user_id === user?.id;
  
  // Check if the user is the recruiter for this job offer
  const isJobRecruiter = application && isRecruiter && application.job_offer.user_id === user?.id;
  
  // Status options
  const statusOptions = [
    { value: 'pending', label: 'En attente' },
    { value: 'reviewing', label: 'En cours de revue' },
    { value: 'accepted', label: 'Accepter' },
    { value: 'rejected', label: 'Refuser' },
  ];
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Fetch application data
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await jobApplicationsAPI.getById(applicationId);
        setApplication(response.data);
        
        // Set initial value for status dialog
        setNewStatus(response.data.status);
      } catch (err) {
        console.error('Error fetching application:', err);
        setError('Impossible de charger les détails de la candidature.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplication();
  }, [applicationId]);

  // Handle withdrawal confirmation
  const handleWithdraw = async () => {
    try {
      setWithdrawing(true);
      
      await jobApplicationsAPI.withdraw(applicationId);
      
      // Close dialog and navigate back to applications list
      setWithdrawDialogOpen(false);
      navigate('/applications', { replace: true });
    } catch (err) {
      console.error('Error withdrawing application:', err);
      setError('Impossible de retirer cette candidature.');
      setWithdrawDialogOpen(false);
    } finally {
      setWithdrawing(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    try {
      setUpdatingStatus(true);
      
      await jobApplicationsAPI.updateStatus(applicationId, newStatus);
      
      // Update local state
      setApplication(prev => ({
        ...prev,
        status: newStatus,
        last_status_change: new Date().toISOString(),
      }));
      
      // Close dialog
      setStatusDialogOpen(false);
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Impossible de mettre à jour le statut de cette candidature.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Dialog handlers
  const openWithdrawDialog = () => setWithdrawDialogOpen(true);
  const closeWithdrawDialog = () => setWithdrawDialogOpen(false);
  const openStatusDialog = () => setStatusDialogOpen(true);
  const closeStatusDialog = () => setStatusDialogOpen(false);
  
  // Handle status change in dialog
  const handleStatusChange = (event) => {
    setNewStatus(event.target.value);
  };

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
          to="/applications" 
          sx={{ mt: 2 }}
        >
          Retour aux candidatures
        </Button>
      </Container>
    );
  }
  
  // Render application not found
  if (!application) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Candidature introuvable</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          component={RouterLink} 
          to="/applications" 
          sx={{ mt: 2 }}
        >
          Retour aux candidatures
        </Button>
      </Container>
    );
  }

  // Get status label based on status code
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'reviewing':
        return 'En cours de revue';
      case 'accepted':
        return 'Acceptée';
      case 'rejected':
        return 'Refusée';
      default:
        return status;
    }
  };
  
  // Get status color based on status code
  const getStatusColor = (status) => {
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
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back button and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          component={RouterLink} 
          to="/applications"
        >
          Retour aux candidatures
        </Button>
        
        {/* Actions based on user role */}
        {isJobRecruiter && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<UpdateIcon />}
            onClick={openStatusDialog}
          >
            Mettre à jour le statut
          </Button>
        )}
        
        {isOwner && application.status === 'pending' && (
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteIcon />}
            onClick={openWithdrawDialog}
          >
            Retirer ma candidature
          </Button>
        )}
      </Box>
      
      {/* Application details */}
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Candidature {isRecruiter ? 'reçue' : 'envoyée'}
              </Typography>
              
              <Chip 
                label={getStatusLabel(application.status)} 
                color={getStatusColor(application.status)} 
                size="medium"
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Offre d'emploi
                </Typography>
                
                <Typography variant="h5" gutterBottom>
                  {application.job_offer.title}
                </Typography>
                
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {application.job_offer.company_name}
                </Typography>
                
                <Typography variant="body2" paragraph>
                  {application.job_offer.location} • {application.job_offer.contract_type}
                </Typography>
                
                <Button 
                  variant="outlined" 
                  size="small"
                  component={RouterLink}
                  to={`/job-offers/${application.job_offer.id}`}
                >
                  Voir l'offre complète
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {isRecruiter ? 'Candidat' : 'Vos informations'}
                </Typography>
                
                <Typography variant="h5" gutterBottom>
                  {application.candidate.name}
                </Typography>
                
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {application.candidate.email}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Candidature soumise le {formatDate(application.created_at)}
                  </Typography>
                  
                  {application.last_status_change && (
                    <Typography variant="body2" color="text.secondary">
                      Dernier changement de statut le {formatDate(application.last_status_change)}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Lettre de motivation
            </Typography>
            
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                mt: 2, 
                backgroundColor: '#f9f9f9', 
                whiteSpace: 'pre-line',
                fontFamily: 'inherit',
              }}
            >
              {application.cover_letter}
            </Paper>
          </Grid>
          
          {application.notes && isJobRecruiter && (
            <Grid item xs={12}>
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Notes internes
              </Typography>
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  mt: 2, 
                  backgroundColor: '#f5f5f5', 
                  whiteSpace: 'pre-line' 
                }}
              >
                {application.notes}
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>
      
      {/* Withdraw confirmation dialog */}
      <Dialog open={withdrawDialogOpen} onClose={closeWithdrawDialog}>
        <DialogTitle>Retirer votre candidature ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir retirer votre candidature pour ce poste ? 
            Cette action ne peut pas être annulée.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeWithdrawDialog} disabled={withdrawing}>Annuler</Button>
          <Button 
            onClick={handleWithdraw} 
            color="error" 
            disabled={withdrawing}
            startIcon={withdrawing ? <CircularProgress size={24} /> : null}
          >
            {withdrawing ? 'Retrait en cours...' : 'Retirer ma candidature'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Status update dialog */}
      <Dialog open={statusDialogOpen} onClose={closeStatusDialog}>
        <DialogTitle>Mettre à jour le statut</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Sélectionnez le nouveau statut pour cette candidature.
          </DialogContentText>
          
          <FormControl fullWidth>
            <InputLabel id="status-select-label">Statut</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              value={newStatus}
              label="Statut"
              onChange={handleStatusChange}
            >
              {statusOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStatusDialog} disabled={updatingStatus}>Annuler</Button>
          <Button 
            onClick={handleStatusUpdate} 
            color="primary" 
            variant="contained"
            disabled={updatingStatus || newStatus === application.status}
            startIcon={updatingStatus ? <CircularProgress size={24} /> : null}
          >
            {updatingStatus ? 'Mise à jour...' : 'Mettre à jour'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}