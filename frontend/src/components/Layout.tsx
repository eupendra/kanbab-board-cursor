import React from 'react';
import { AppBar, Box, Container, CssBaseline, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, useMediaQuery, useTheme, Avatar, Button } from '@mui/material';
import { Menu as MenuIcon, Dashboard, People, Person, ExitToApp, Assignment, Public } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'My Tasks', icon: <Assignment />, path: '/tasks' },
    { text: 'Public Board', icon: <Public />, path: '/public' },
  ];

  if (user?.is_admin) {
    menuItems.push({ text: 'Users', icon: <People />, path: '/users' });
  }

  const drawer = (
    <div>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          color: '#1B1F3B',
          display: 'flex',
          alignItems: 'center'
        }}>
          <img 
            src="/images/logo.png" 
            alt="Upen.AI Logo" 
            style={{ 
              width: 40, 
              height: 40, 
              marginRight: 8 
            }} 
          />
          Upen.AI Board
        </Typography>
      </Box>
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={Link} 
              to={item.path} 
              onClick={() => isMobile && setMobileOpen(false)}
              sx={{ 
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: theme.palette.primary.light + '20',
                  color: theme.palette.primary.main,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                },
                '&:hover': {
                  bgcolor: theme.palette.primary.light + '10',
                }
              }}
              selected={window.location.pathname === item.path}
            >
              <ListItemIcon sx={{ 
                minWidth: 40,
                color: window.location.pathname === item.path ? theme.palette.primary.main : theme.palette.text.secondary
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
                  fontWeight: window.location.pathname === item.path ? 600 : 400
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
        <Box sx={{ mt: 2, px: 2 }}>
          <Button
            variant="outlined"
            color="warning"
            fullWidth
            startIcon={<ExitToApp />}
            onClick={handleLogout}
            sx={{ 
              justifyContent: 'flex-start',
              textAlign: 'left',
              py: 1
            }}
          >
            Logout
          </Button>
        </Box>
      </List>
    </div>
  );

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: '#1B1F3B',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            Upen.AI Status Board
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/images/logo.png" 
              alt="Upen.AI Logo" 
              style={{ 
                width: 32, 
                height: 32,
                marginRight: 8
              }} 
            />
            <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
              {user?.full_name || user?.email}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: theme.palette.divider,
              boxShadow: { xs: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', md: 'none' }
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
        }}
      >
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 