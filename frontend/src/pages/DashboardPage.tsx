import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Grid, Paper, Typography, Button } from '@mui/material';
import { Assignment, CheckCircle, HourglassEmpty, Person } from '@mui/icons-material';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';
import { TaskStatus } from '@/types';

const DashboardPage: React.FC = () => {
  const { currentWeekTasks, currentWeek, currentYear } = useTaskStore();
  const { user } = useAuthStore();
  
  // Calculate task statistics
  const todoTasks = currentWeekTasks.filter(task => task.status === TaskStatus.TODO);
  const inProgressTasks = currentWeekTasks.filter(task => task.status === TaskStatus.IN_PROGRESS);
  const doneTasks = currentWeekTasks.filter(task => task.status === TaskStatus.DONE);
  
  // Calculate completion rate
  const completionRate = currentWeekTasks.length > 0 
    ? Math.round((doneTasks.length / currentWeekTasks.length) * 100) 
    : 0;
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {user?.full_name || user?.email}'s Dashboard
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom>
        Welcome back, {user?.full_name || user?.email}!
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4 }}>
        Here's your task summary for Week {currentWeek}, {currentYear}
      </Typography>
      
      {/* Task Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Assignment fontSize="large" color="primary" sx={{ mb: 1 }} />
              <Typography variant="h5">{currentWeekTasks.length}</Typography>
              <Typography variant="body2" color="textSecondary">Total Tasks</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <HourglassEmpty fontSize="large" color="warning" sx={{ mb: 1 }} />
              <Typography variant="h5">{todoTasks.length}</Typography>
              <Typography variant="body2" color="textSecondary">To Do</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Person fontSize="large" color="info" sx={{ mb: 1 }} />
              <Typography variant="h5">{inProgressTasks.length}</Typography>
              <Typography variant="body2" color="textSecondary">In Progress</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CheckCircle fontSize="large" color="success" sx={{ mb: 1 }} />
              <Typography variant="h5">{doneTasks.length}</Typography>
              <Typography variant="body2" color="textSecondary">Completed</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Completion Rate */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Task Completion Rate
        </Typography>
        <Box sx={{ 
          height: 20, 
          width: '100%', 
          bgcolor: '#f0f0f0',
          borderRadius: 1,
          overflow: 'hidden',
          mb: 1
        }}>
          <Box sx={{ 
            height: '100%', 
            width: `${completionRate}%`, 
            bgcolor: 'success.main',
            transition: 'width 0.5s ease-in-out'
          }} />
        </Box>
        <Typography variant="body2" color="textSecondary">
          {completionRate}% of tasks completed this week
        </Typography>
      </Paper>
      
      {/* Quick Actions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              component={Link} 
              to="/tasks"
            >
              View All Tasks
            </Button>
          </Grid>
          {user?.is_admin && (
            <Grid item>
              <Button 
                variant="outlined" 
                color="primary" 
                component={Link} 
                to="/users"
              >
                Manage Users
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default DashboardPage; 