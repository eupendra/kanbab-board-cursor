// Configuration for different environments

// For GitHub Pages deployment, we'll need to point to a hosted backend API
// For local development, we'll use the local backend

const config = {
  // API base URL - in development, we use the proxy configuration
  // in production, we'll use the actual API URL
  apiBaseUrl: import.meta.env.PROD 
    ? 'https://your-backend-api-url.com/api/v1' // Replace with your actual hosted API URL
    : '/api/v1',
    
  // Other configuration options can be added here
  appName: 'Upen.AI Status Board',
};

export default config; 