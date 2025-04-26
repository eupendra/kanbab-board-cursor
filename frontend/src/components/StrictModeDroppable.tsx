import { useEffect, useState } from 'react';
import { Droppable, DroppableProps } from 'react-beautiful-dnd';

/**
 * A wrapper component for react-beautiful-dnd's Droppable component
 * that fixes issues with React 18's Strict Mode and concurrent rendering.
 */
export const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);
  
  useEffect(() => {
    // This timeout is needed to avoid the "Unable to find draggable with id" error
    // that occurs in React 18's Strict Mode due to double rendering
    const animation = requestAnimationFrame(() => setEnabled(true));
    
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  
  if (!enabled) {
    return null;
  }
  
  return <Droppable {...props}>{children}</Droppable>;
}; 