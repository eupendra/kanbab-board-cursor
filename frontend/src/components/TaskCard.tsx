import React from 'react';
import { Card, CardContent, CardActions, Typography, IconButton, Chip, Box, Tooltip, useTheme } from '@mui/material';
import { Delete, Edit, Visibility, VisibilityOff, Person, DragIndicator } from '@mui/icons-material';
import { Task, TaskStatus } from '@/types';
import { Draggable } from 'react-beautiful-dnd';
import { useAuthStore } from '@/store/authStore';

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
  onToggleVisibility?: (id: number, isPublic: boolean) => void;
  isPublicBoard?: boolean;
}

const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.TODO:
      return '#3B82F6'; // Blue
    case TaskStatus.IN_PROGRESS:
      return '#F59E0B'; // Amber
    case TaskStatus.DONE:
      return '#10B981'; // Green
    default:
      return '#6B7280'; // Gray
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  index, 
  onEdit, 
  onDelete, 
  onToggleVisibility,
  isPublicBoard = false
}) => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const isOwnTask = user?.id === task.owner_id;
  const isAdmin = user?.is_admin === true;
  
  // In public board, only show edit controls for own tasks or for admins
  const showControls = !isPublicBoard || isOwnTask || isAdmin;
  
  return (
    <Draggable draggableId={`task-${task.id}`} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            mb: 2,
            borderLeft: `4px solid ${getStatusColor(task.status)}`,
            transition: 'all 0.2s ease',
            transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
            boxShadow: snapshot.isDragging 
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
            position: 'relative',
            zIndex: snapshot.isDragging ? 1 : 'auto',
            '&:hover': {
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
          }}
        >
          <Box 
            {...provided.dragHandleProps}
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              cursor: 'grab',
              color: theme.palette.text.secondary,
              opacity: 0.5,
              '&:hover': {
                opacity: 1,
              }
            }}
          >
            <DragIndicator fontSize="small" />
          </Box>
          
          <CardContent sx={{ pt: 2, pb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography 
                variant="subtitle1" 
                component="div" 
                sx={{ 
                  fontWeight: 600,
                  pr: 4, // Make room for drag handle
                  wordBreak: 'break-word'
                }}
              >
                {task.title}
              </Typography>
            </Box>
            
            {task.description && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {task.description}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {isPublicBoard && (
                <Tooltip title="Task Owner">
                  <Chip
                    icon={<Person fontSize="small" />}
                    label={isOwnTask ? "You" : `User ${task.owner_id}`}
                    size="small"
                    color={isOwnTask ? "secondary" : "default"}
                    variant="outlined"
                    sx={{ 
                      borderRadius: '4px',
                      height: '24px',
                      '& .MuiChip-label': {
                        px: 1,
                        fontSize: '0.75rem',
                      }
                    }}
                  />
                </Tooltip>
              )}
              <Chip
                label={task.is_public ? 'Public' : 'Private'}
                size="small"
                color={task.is_public ? 'primary' : 'default'}
                variant="outlined"
                sx={{ 
                  borderRadius: '4px',
                  height: '24px',
                  '& .MuiChip-label': {
                    px: 1,
                    fontSize: '0.75rem',
                  }
                }}
              />
            </Box>
          </CardContent>
          
          {showControls && onEdit && onDelete && onToggleVisibility && (
            <CardActions sx={{ pt: 0, pb: 1, px: 2, justifyContent: 'flex-end' }}>
              <Tooltip title={task.is_public ? "Make Private" : "Make Public"}>
                <IconButton 
                  size="small" 
                  onClick={() => onToggleVisibility(task.id, !task.is_public)}
                  color={task.is_public ? "primary" : "default"}
                >
                  {task.is_public ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit Task">
                <IconButton 
                  size="small" 
                  onClick={() => onEdit(task)}
                  color="primary"
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Task">
                <IconButton 
                  size="small" 
                  onClick={() => onDelete(task.id)}
                  color="error"
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </CardActions>
          )}
        </Card>
      )}
    </Draggable>
  );
};

export default TaskCard; 