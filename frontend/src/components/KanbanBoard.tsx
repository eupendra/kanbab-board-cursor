import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Paper, Typography, IconButton, Chip, useTheme } from '@mui/material';
import { Add, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import { Task, TaskStatus } from '@/types';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import { getNextWeek, getPreviousWeek, getWeekRange } from '@/utils/dateUtils';
import { StrictModeDroppable } from './StrictModeDroppable';

const KanbanBoard: React.FC = () => {
  const theme = useTheme();
  const { isAuthenticated, user } = useAuthStore();
  const { 
    currentWeekTasks, 
    currentWeek, 
    currentYear, 
    setCurrentWeek, 
    moveTask, 
    updateTask, 
    deleteTask,
    fetchTasksByWeek 
  } = useTaskStore();
  
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  
  const weekRange = getWeekRange(currentWeek, currentYear);
  
  useEffect(() => {
    if (isAuthenticated && currentWeek && currentYear) {
      fetchTasksByWeek(currentWeek, currentYear);
    }
  }, [isAuthenticated, currentWeek, currentYear, fetchTasksByWeek]);
  
  const handlePreviousWeek = () => {
    const { week, year } = getPreviousWeek(currentWeek, currentYear);
    setCurrentWeek(week, year);
  };
  
  const handleNextWeek = () => {
    const { week, year } = getNextWeek(currentWeek, currentYear);
    setCurrentWeek(week, year);
  };
  
  const handleOpenTaskForm = (task?: Task) => {
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
    if (!destination) return;
    
    // If dropped in the same place
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
    
    // Move the task
    moveTask(taskId, newStatus);
  };
  
  const handleToggleVisibility = (id: number, isPublic: boolean) => {
    updateTask(id, { is_public: isPublic });
  };
  
  // Group tasks by status
  const todoTasks = currentWeekTasks.filter(task => task.status === TaskStatus.TODO);
  const inProgressTasks = currentWeekTasks.filter(task => task.status === TaskStatus.IN_PROGRESS);
  const doneTasks = currentWeekTasks.filter(task => task.status === TaskStatus.DONE);

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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>{user?.full_name || user?.email}'s Tasks</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenTaskForm()}
          sx={{ 
            borderRadius: '8px',
            px: 3
          }}
        >
          Add Task
        </Button>
      </Box>
      
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
                    ref={provided.innerRef}
                    {...provided.droppableProps}
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
                        onDelete={deleteTask}
                        onToggleVisibility={handleToggleVisibility}
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
                    ref={provided.innerRef}
                    {...provided.droppableProps}
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
                        onDelete={deleteTask}
                        onToggleVisibility={handleToggleVisibility}
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
                    ref={provided.innerRef}
                    {...provided.droppableProps}
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
                        onDelete={deleteTask}
                        onToggleVisibility={handleToggleVisibility}
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

export default KanbanBoard; 