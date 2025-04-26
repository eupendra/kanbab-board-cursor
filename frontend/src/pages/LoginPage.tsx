import React, { useEffect } from 'react';
import { Box, Button, Container, Paper, TextField, Typography, Alert, useTheme, useMediaQuery } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { login, isAuthenticated, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const onSubmit = async (data: LoginFormData) => {
    await login(data.email, data.password);
  };
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        pt: 8,
      }}
    >
      {/* Background Image */}
      {!isMobile && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '40%',
            maxWidth: 600,
            zIndex: 0,
            display: { xs: 'none', md: 'block' }
          }}
        >
          <img
            src="/images/upen-full-mac.png"
            alt="Upen.AI Illustration"
            style={{ 
              width: '100%', 
              height: 'auto',
            }}
          />
        </Box>
      )}

      <Container component="main" maxWidth="xs" sx={{ zIndex: 1, position: 'relative' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'rgba(0, 0, 0, 0.05)',
            }}
          >
            <Box
              sx={{
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <img
                src="/images/logo.png"
                alt="Upen.AI Logo"
                style={{ 
                  width: 80,
                  height: 80,
                  marginBottom: 16
                }}
              />
              
              <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 600, color: '#1B1F3B' }}>
                Upen.AI
              </Typography>
              
              <Typography component="h2" variant="h6" sx={{ mb: 3, color: '#4DC8F0', fontWeight: 500 }}>
                Status Board
              </Typography>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
              <Controller
                name="email"
                control={control}
                rules={{ 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                      }
                    }}
                  />
                )}
              />
              
              <Controller
                name="password"
                control={control}
                rules={{ required: 'Password is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                      }
                    }}
                  />
                )}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="warning"
                size="large"
                disabled={isLoading}
                sx={{ 
                  mt: 1, 
                  mb: 2,
                  py: 1.5,
                  borderRadius: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                {isLoading ? 'Logging in...' : 'Sign In'}
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage; 