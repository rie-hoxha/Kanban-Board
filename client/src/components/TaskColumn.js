import React, { useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Input, Card } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { addTask,  deleteTask, editTaskInDatabase } from '../redux/taskActions'; // Make sure to import the actions
import { Droppable, Draggable } from 'react-beautiful-dnd';


const TaskColumn = ({ columnId, status }) => {
  const [input, setInput] = useState('');
  const [editId, setEditId] = useState(null);
  const [editInput, setEditInput] = useState('');
  const dispatch = useDispatch();
  const tasks = useSelector(state => state.tasks[columnId] || []);

  const addNewTask = () => {
    const newTask = { content: input, status:status };
    fetch('/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTask)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      dispatch(addTask(data));
      setInput(''); // Clear the input field
    })
    .catch(error => console.error('Error:', error));
  };


  
const startEdit = (task) => {
  setEditId(task._id);
  setEditInput(task.content);
};

const submitEdit = () => {
  dispatch(editTaskInDatabase({
      taskId: editId,
      content: editInput
  }));
  setEditId(null);
  setEditInput('');
};

const handleDelete = (taskId) => {
  // Assuming deleteTask is a redux action that handles the deletion
  dispatch(deleteTask(taskId));
};

const statusStyles = {
  Backlog: {
    display: 'inline-block',
    backgroundColor: '#E1E2FF', 
    borderRadius: '20px', 
    padding: '5px 15px', 
    color: '#000000', 
  },

  ToDo: {
    display: 'inline-block',
    backgroundColor: '#FBC8C4', 
    borderRadius: '20px', 
    padding: '5px 15px', 
    color: '#710A0B', 
  },
  InProgress: {
    display: 'inline-block',
    backgroundColor: '#f8e1b4', 
    borderRadius: '20px', 
    padding: '5px 15px', 
    color: '#6E3500',
  },
  Done:{
    display: 'inline-block',
    backgroundColor: '#BDD9BB',
    borderRadius: '20px',
    padding: '5px 15px',
    color: '#253D23',
    
  }
};
// const headerTabStyle = {
//   display: 'flex',
//   justifyContent: 'center',
//   backgroundColor: 'white', // this should match the Kanban board's background
//   marginBottom: '-20x', // this pulls the tab up into the board's edge
//   alignSelf: 'flex-start'
// };


const cardStyle = {
  marginBottom: '10px',
  backgroundColor: 'white', // This will be the background color of each task
  boxShadow: '0 4px 8px 0 rgba(0,0,0,0.1)', // This adds a shadow effect to each task
  borderRadius: '7px', // This adds rounded corners to each task
  // ... include other necessary styles
};



return (
  <Droppable droppableId={columnId}>
    {(provided) => (
      <div
        {...provided.droppableProps}
        ref={provided.innerRef}
        style={{ width: '100%' }}
      >
        <div><h2 style={statusStyles[status] || {}}>{status}</h2></div>
       

        <div style={{ marginBottom: '1rem' }}>
          {tasks.map((task, index) => (
            <Draggable key={task._id} draggableId={task._id} index={index}>
              {(provided) => (
                <Card
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{ marginBottom: '10px', ...cardStyle, ...provided.draggableProps.style }}
                >
                  <div style={{ position: 'relative', paddingTop: '5px' }}> {/* Padding for space above the content */}
                    {editId !== task._id && (
                      <div style={{ position: 'absolute', top: 0, right: 0 }}> {/* Position icons at the top right */}
                        <EditOutlined onClick={() => startEdit(task)} style={{ marginRight: 10 }} />
                        <DeleteOutlined onClick={() => handleDelete(task._id)} />
                      </div>
                    )}
                    {editId === task._id ? (
                      <>
                        <Input value={editInput} onChange={(e) => setEditInput(e.target.value)} onPressEnter={submitEdit} autoFocus />
                        <Button onClick={submitEdit} icon={<EditOutlined />} size="small">
                          Save
                        </Button>
                      </>
                    ) : (
                      <div style={{ minHeight: '32px' }}>
                        {task.content}
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="+ New"
          style={{ marginBottom: '8px', border: 'none' }}
          onPressEnter={() => addNewTask()} // Call addNewTask when Enter is pressed
        />
      </div>
    )}
  </Droppable>
);

};


export default TaskColumn;
