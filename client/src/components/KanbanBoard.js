import React, { useEffect } from 'react';
import TaskColumn from './TaskColumn';
import { Row, Col } from 'antd';
import { DragDropContext } from 'react-beautiful-dnd';
import { useDispatch } from 'react-redux';
import { updateTaskInDatabase} from '../redux/taskActions';
import { fetchTasks } from '../redux/taskActions';


const KanbanBoard = () => {
  const statuses = ['Backlog', 'ToDo', 'InProgress', 'Done'];
  const dispatch = useDispatch();

useEffect(() => {
  dispatch(fetchTasks());
}, [dispatch]);



  const onDragEnd = (result) => {
    const { source, destination } = result;
  
    // Dropped outside the list
    if (!destination) {
      return;
    }
  
    // Dropped in the same place, no change
    if (source.droppableId === destination.droppableId &&
        source.index === destination.index) {
      return;
    }
  
    // Determine the new status and position
    const status = getStatusFromColumnId(destination.droppableId);
    const position = destination.index; // New position of the task after drag and drop
  
    // Dispatch an action to update the task in the database
    dispatch(updateTaskInDatabase({
      taskId: result.draggableId,
      fromColumnId: source.droppableId,
      toColumnId: destination.droppableId,
      position,
      status,
    }));
  };
  

  const getStatusFromColumnId = (columnId) => {
    switch (columnId) {
      case 'Backlog':
        return 'Backlog';
      case 'ToDo':
        return 'ToDo';
      case 'InProgress':
        return 'InProgress';
      case 'Done':
        return 'Done';
      default:
        throw new Error(`Invalid column ID: ${columnId}`);
    }
  };
  // const onDragEnd = (result) => {
  //   const { source, destination } = result;
  
  //   // Dropped outside the list
  //   if (!destination) {
  //     return;
  //   }
  
  //   // Dropped in the same place, no change
  //   if (source.droppableId === destination.droppableId &&
  //       source.index === destination.index) {
  //     return;
  //   }
  
  //   // Assuming the task can be moved optimistically
  //   dispatch(moveTaskOptimistically({
  //     taskId: result.draggableId,
  //     fromColumnId: source.droppableId,
  //     toColumnId: destination.droppableId,
  //     fromIndex: source.index,
  //     toIndex: destination.index
  //   }));
  
  //   // Determine the new status and position
  //   const status = getStatusFromColumnId(destination.droppableId);
  //   const position = destination.index; // New position of the task after drag and drop
  
  //   // Dispatch an action to update the task in the database
  //   dispatch(updateTaskInDatabase({
  //     taskId: result.draggableId,
  //     fromColumnId: source.droppableId,
  //     toColumnId: destination.droppableId,
  //     position,
  //     status
  //   })).catch(error => {
  //     // Handle error here if the backend update fails - revert the optimistic update
  //     console.error("Failed to update task in database:", error);
  //     dispatch(revertTaskMove({
  //       taskId: result.draggableId,
  //       fromColumnId: destination.droppableId,
  //       toColumnId: source.droppableId,
  //       fromIndex: destination.index,
  //       toIndex: source.index
  //     }));
  //   });
  // };
  
  // // Helper function to get status from column ID
  // const getStatusFromColumnId = (columnId) => {
  //   switch (columnId) {
  //     case 'Backlog':
  //       return 'Backlog';
  //     case 'ToDo':
  //       return 'ToDo';
  //     case 'InProgress':
  //       return 'InProgress';
  //     case 'Done':
  //       return 'Done';
  //     default:
  //       throw new Error(`Invalid column ID: ${columnId}`);
  //   }
  // };
  

//   // new onDragEnd function, aims efficiency
//  // onDragEnd function with optimistic update
// const onDragEnd = (result) => {
//   const { source, destination } = result;

//   // Dropped outside the list
//   if (!destination) {
//     return;
//   }

//   // Dropped in the same place, no change
//   if (source.droppableId === destination.droppableId && source.index === destination.index) {
//     return;
//   }

//   const sourceId = source.droppableId;
//   const destId = destination.droppableId;
//   const sourceIndex = source.index;
//   const destIndex = destination.index;
//   const newStatus = getStatusFromColumnId(destId);

//   // Perform optimistic update
//   dispatch(moveTaskOptimistically({
//     taskId: result.draggableId,
//     fromColumnId: sourceId,
//     toColumnId: destId,
//     fromIndex: sourceIndex,
//     toIndex: destIndex,
//   }));

//   // Perform server update
//   dispatch(updateTaskInDatabase({
//     taskId: result.draggableId,
//     position: destIndex, // The new position after the drag and drop
//     status: newStatus,  // The new status determined by the destination column ID
//   })).catch(error => {

    
//   });
// };

// // Helper function to map column IDs to statuses
// const getStatusFromColumnId = (columnId) => {
//   const statusMap = {
//     'column-1': 'Backlog',
//     'column-2': 'ToDo',
//     'column-3': 'InProgress',
//     'column-4': 'Done'
//   };

//   return statusMap[columnId] || null; // Return null or throw an error if the column ID does not exist
// };



  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ margin: '2rem', backgroundColor: '#F8F8F8',  padding: '1rem',borderRadius: '8px'  }}>
        <Row gutter={16}>
          {statuses.map((status, index) => (
            <Col
              key={index}
              span={6}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <TaskColumn columnId={status} status={status} />
            </Col>
          ))}
        </Row>
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;