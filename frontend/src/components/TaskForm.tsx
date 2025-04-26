import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Switch, TextField } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Task, TaskCreateRequest, TaskStatus, TaskUpdateRequest } from '@/types';
import { useTaskStore } from '@/store/taskStore';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  task?: Task;
}

const TaskForm: React.FC<TaskFormProps> = ({ open, onClose, task }) => {
  const { currentWeek, currentYear, createTask, updateTask } = useTaskStore();
  const isEditMode = !!task;
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<TaskCreateRequest | TaskUpdateRequest>({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || TaskStatus.TODO,
      is_public: task?.is_public || false,
      week_number: task?.week_number || currentWeek,
      year: task?.year || currentYear,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || TaskStatus.TODO,
        is_public: task?.is_public || false,
        week_number: task?.week_number || currentWeek,
        year: task?.year || currentYear,
      });
    }
  }, [open, task, reset, currentWeek, currentYear]);

  const onSubmit = async (data: TaskCreateRequest | TaskUpdateRequest) => {
    if (isEditMode && task) {
      await updateTask(task.id, data);
    } else {
      await createTask(data as TaskCreateRequest);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Task' : 'Create Task'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Controller
            name="title"
            control={control}
            rules={{ required: 'Title is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Title"
                fullWidth
                margin="normal"
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            )}
          />
          
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
            )}
          />
          
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Status"
                fullWidth
                margin="normal"
              >
                <MenuItem value={TaskStatus.TODO}>To Do</MenuItem>
                <MenuItem value={TaskStatus.IN_PROGRESS}>In Progress</MenuItem>
                <MenuItem value={TaskStatus.DONE}>Done</MenuItem>
              </TextField>
            )}
          />
          
          <Controller
            name="is_public"
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                  />
                }
                label="Make task public"
                sx={{ mt: 2 }}
              />
            )}
          />
          
          <Controller
            name="week_number"
            control={control}
            rules={{ required: 'Week number is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Week Number"
                type="number"
                fullWidth
                margin="normal"
                error={!!errors.week_number}
                helperText={errors.week_number?.message}
                InputProps={{ inputProps: { min: 1, max: 53 } }}
              />
            )}
          />
          
          <Controller
            name="year"
            control={control}
            rules={{ required: 'Year is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Year"
                type="number"
                fullWidth
                margin="normal"
                error={!!errors.year}
                helperText={errors.year?.message}
                InputProps={{ inputProps: { min: 2000, max: 2100 } }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm; 