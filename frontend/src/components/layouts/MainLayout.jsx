import { useState } from 'react';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Button,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Work as JobIcon,
  Description as ApplicationIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

export default function MainLayout() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const isRecruiter = user?.role === 'recruiter';
  const isAdmin = user?.role === 'admin';
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };
  
  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Job Offers', icon: <JobIcon />, path: '/job-offers' },
  ];
  
  if (isAdmin) {
    navigationItems.push(
      { text: 'Admin', icon: <PersonIcon />, path: '/admin' },
    );
  }
  
  if (isRecruiter) {
    navigationItems.push(
      { text: 'Post New Job', icon: <JobIcon />, path: '/job-offers/new' },
    );
  }
  
  navigationItems.push(
    { text: 'Applications', icon: <ApplicationIcon />, path: '/applications' },
  );
  
  const drawerContent = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          TalentPool
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={RouterLink} 
              to={item.path}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {isAdmin ? 'Admin Dashboard' : isRecruiter ? 'Recruiter Dashboard' : 'Candidate Dashboard'}
          </Typography>
          
          <Button 
            color="inherit" 
            onClick={handleMenuOpen}
            startIcon={
              <Avatar 
                sx={{ width: 32, height: 32 }}
                alt={user?.name || 'User'}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            }
          >
            {user?.name}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose} component={RouterLink} to="/profile">
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, 
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}