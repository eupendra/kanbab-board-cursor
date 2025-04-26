import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, IconButton, Chip, useTheme } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Task, TaskStatus } from '@/types';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import { getNextWeek, getPreviousWeek, getWeekRange } from '@/utils/dateUtils';
import * as api from '@/services/api';
import { StrictModeDroppable } from '@/components/StrictModeDroppable';

const PublicBoardPage: React.FC = () => {
  const theme = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const { 
    currentWeek, 
    currentYear, 
    setCurrentWeek, 
    moveTask, 
    updateTask, 
    deleteTask 
  } = useTaskStore();
  
  const [publicTasks, setPublicTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  
  const weekRange = getWeekRange(currentWeek, currentYear);
  
  useEffect(() => {
    const fetchPublicTasks = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      try {
        const tasks = await api.getPublicTasksByWeek(currentWeek, currentYear);
        setPublicTasks(tasks);
      } catch (error) {
        console.error('Error fetching public tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPublicTasks();
  }, [currentWeek, currentYear, isAuthenticated]);
  
  const handlePreviousWeek = () => {
    const { week, year } = getPreviousWeek(currentWeek, currentYear);
    setCurrentWeek(week, year);
  };
  
  const handleNextWeek = () => {
    const { week, year } = getNextWeek(currentWeek, currentYear);
    setCurrentWeek(week, year);
  };
  
  const handleOpenTaskForm = (task?: Task) => {
    // Allow editing own tasks or any task for admins
    if (task && !user?.is_admin && task.owner_id !== user?.id) {
      return;
    }
    setSelectedTask(task);
    setTaskFormOpen(true);
  };
  
  const handleCloseTaskForm = () => {
    setSelectedTask(undefined);
    setTaskFormOpen(false);
  };
  
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // If dropped outside a droppable area
    if (!destination) {
      return;
    }
    
    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    // Map droppableId to TaskStatus
    let newStatus: TaskStatus;
    switch (destination.droppableId) {
      case 'todo':
        newStatus = TaskStatus.TODO;
        break;
      case 'in_progress':
        newStatus = TaskStatus.IN_PROGRESS;
        break;
      case 'done':
        newStatus = TaskStatus.DONE;
        break;
      default:
        console.error(`Unknown droppable ID: ${destination.droppableId}`);
        return;
    }
    
    // Extract task ID from draggableId (format: "task-123")
    const taskIdStr = draggableId.split('-')[1];
    if (!taskIdStr) {
      console.error(`Invalid draggableId format: ${draggableId}`);
      return;
    }
    
    const taskId = parseInt(taskIdStr, 10);
    if (isNaN(taskId)) {
      console.error(`Failed to parse task ID from: ${taskIdStr}`);
      return;
    }
    
    // Find the task
    const task = publicTasks.find(t => t.id === taskId);
    
    if (!task) {
      console.error(`Task with ID ${taskId} not found`);
      return;
    }
    
    // Only allow moving own tasks or any task for admins
    if (!user?.is_admin && task.owner_id !== user?.id) {
      return;
    }
    
    // Update task status
    moveTask(task.id, newStatus);
    
    // Update the local state
    const updatedTasks = publicTasks.map(t => 
      t.id === task.id ? { ...t, status: newStatus } : t
    );
    setPublicTasks(updatedTasks);
  };
  
  const handleToggleVisibility = (id: number, isPublic: boolean) => {
    // Allow toggling own tasks or any task for admins
    const task = publicTasks.find(t => t.id === id);
    if (task && (user?.is_admin || task.owner_id === user?.id)) {
      updateTask(id, { is_public: isPublic });
      
      // If making private, remove from public tasks
      if (!isPublic) {
        setPublicTasks(publicTasks.filter(t => t.id !== id));
      }
    }
  };
  
  const handleDeleteTask = (id: number) => {
    // Allow admins to delete any task, other users can only delete their own tasks
    const task = publicTasks.find(t => t.id === id);
    if (task && (user?.is_admin || task.owner_id === user?.id)) {
      deleteTask(id);
      setPublicTasks(publicTasks.filter(t => t.id !== id));
    }
  };
  
  // Group tasks by status
  const todoTasks = publicTasks.filter(task => task.status === TaskStatus.TODO);
  const inProgressTasks = publicTasks.filter(task => task.status === TaskStatus.IN_PROGRESS);
  const doneTasks = publicTasks.filter(task => task.status === TaskStatus.DONE);
  
  // Get column styles based on status
  const getColumnStyles = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return {
          bgcolor: '#F3F4F6',
          borderTop: `3px solid ${theme.palette.info.main}`,
        };
      case TaskStatus.IN_PROGRESS:
        return {
          bgcolor: '#F3F4F6',
          borderTop: `3px solid ${theme.palette.warning.main}`,
        };
      case TaskStatus.DONE:
        return {
          bgcolor: '#F3F4F6',
          borderTop: `3px solid ${theme.palette.success.main}`,
        };
      default:
        return {
          bgcolor: '#F3F4F6',
        };
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Upen.AI Public Board
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        mb: 4,
        bgcolor: 'white',
        borderRadius: 2,
        p: 2,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <IconButton onClick={handlePreviousWeek} color="primary">
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6" sx={{ mx: 2, fontWeight: 500 }}>
          Week {currentWeek}, {currentYear} ({weekRange.formattedRange})
        </Typography>
        <IconButton onClick={handleNextWeek} color="primary">
          <ChevronRight />
        </IconButton>
      </Box>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 2, 
                height: '100%',
                ...getColumnStyles(TaskStatus.TODO),
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  To Do
                </Typography>
                <Chip 
                  label={todoTasks.length} 
                  size="small" 
                  color="info"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <StrictModeDroppable droppableId="todo">
                {(provided, snapshot) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{ 
                      minHeight: '50vh',
                      flexGrow: 1,
                      transition: 'background-color 0.2s ease',
                      bgcolor: snapshot.isDraggingOver ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                      borderRadius: 1,
                      p: 1
                    }}
                  >
                    {todoTasks.map((task, index) => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        index={index} 
                        onEdit={handleOpenTaskForm}
                        onDelete={handleDeleteTask}
                        onToggleVisibility={handleToggleVisibility}
                        isPublicBoard={true}
                      />
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </StrictModeDroppable>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 2, 
                height: '100%',
                ...getColumnStyles(TaskStatus.IN_PROGRESS),
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  In Progress
                </Typography>
                <Chip 
                  label={inProgressTasks.length} 
                  size="small" 
                  color="warning"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <StrictModeDroppable droppableId="in_progress">
                {(provided, snapshot) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{ 
                      minHeight: '50vh',
                      flexGrow: 1,
                      transition: 'background-color 0.2s ease',
                      bgcolor: snapshot.isDraggingOver ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                      borderRadius: 1,
                      p: 1
                    }}
                  >
                    {inProgressTasks.map((task, index) => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        index={index}
                        onEdit={handleOpenTaskForm}
                        onDelete={handleDeleteTask}
                        onToggleVisibility={handleToggleVisibility}
                        isPublicBoard={true}
                      />
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </StrictModeDroppable>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 2, 
                height: '100%',
                ...getColumnStyles(TaskStatus.DONE),
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Done
                </Typography>
                <Chip 
                  label={doneTasks.length} 
                  size="small" 
                  color="success"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <StrictModeDroppable droppableId="done">
                {(provided, snapshot) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{ 
                      minHeight: '50vh',
                      flexGrow: 1,
                      transition: 'background-color 0.2s ease',
                      bgcolor: snapshot.isDraggingOver ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                      borderRadius: 1,
                      p: 1
                    }}
                  >
                    {doneTasks.map((task, index) => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        index={index}
                        onEdit={handleOpenTaskForm}
                        onDelete={handleDeleteTask}
                        onToggleVisibility={handleToggleVisibility}
                        isPublicBoard={true}
                      />
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </StrictModeDroppable>
            </Paper>
          </Grid>
        </Grid>
      </DragDropContext>
      
      <TaskForm
        open={taskFormOpen}
        onClose={handleCloseTaskForm}
        task={selectedTask}
      />
    </Box>
  );
};

export default PublicBoardPage; 