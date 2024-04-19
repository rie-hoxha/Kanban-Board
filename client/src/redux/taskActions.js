  // Constants to avoid typos in action type strings
  const ADD_TASK = "ADD_TASK";
  const FETCH_TASKS_SUCCESS = "FETCH_TASKS_SUCCESS";
  const UPDATE_TASK_POSITION_SUCCESS = "UPDATE_TASK_POSITION_SUCCESS";
  const UPDATE_TASK_POSITION_FAILURE = "UPDATE_TASK_POSITION_FAILURE";
  const DELETE_TASK_SUCCESS = "DELETE_TASK_SUCCESS";
  const DELETE_TASK_FAILURE = "DELETE_TASK_FAILURE";
  const EDIT_TASK_SUCCESS = "EDIT_TASK_SUCCESS";
  const EDIT_TASK_FAILURE = "EDIT_TASK_FAILURE";

  // Action Creators
  // Functions that return action objects

  // Adds a new task to the Redux store
  export const addTask = (task) => ({
    type: ADD_TASK,
    payload: task,
  });

  // Stores fetched tasks in the Redux store after successful API call
  export const fetchTasksSuccess = (tasks) => ({
    type: FETCH_TASKS_SUCCESS,
    payload: tasks,
  });

  // export const moveTaskOptimistically = ({taskId, fromColumnId, toColumnId, fromIndex, toIndex}) => {
  //   return {
  //     type: 'MOVE_TASK_OPTIMISTICALLY',
  //     payload: {taskId, fromColumnId, toColumnId, fromIndex, toIndex}
  //   };
  // };

  // Updates the Redux store with the new state of a task after it has been successfully moved or its status has been updated in the database
  export const updateTaskPositionSuccess = (task) => ({
    type: UPDATE_TASK_POSITION_SUCCESS,
    payload: task,
  });

  // Handles errors during the task update process by logging or displaying them
  export const updateTaskPositionFailure = (error) => ({
    type: UPDATE_TASK_POSITION_FAILURE,
    payload: error,
  });

  // Marks a task as deleted in the Redux store upon successful deletion in the database
  export const deleteTaskSuccess = (taskId) => ({
    type: DELETE_TASK_SUCCESS,
    payload: taskId,
  });

  // Handles errors during the task deletion process by logging or displaying them
  export const deleteTaskFailure = (error) => ({
    type: DELETE_TASK_FAILURE,
    payload: error,
  });

  // Marks a task as updated in the Redux store upon successful edit
  export const editTaskSuccess = (taskId, updatedTaskData) => ({
    type: EDIT_TASK_SUCCESS,
    payload: { taskId, updatedTaskData },
  });

  // Handles errors during the task edit process
  export const editTaskFailure = (error) => ({
    type: EDIT_TASK_FAILURE,
    payload: error,
  });

  // export const revertTaskMove = ({taskId, fromColumnId, toColumnId, fromIndex, toIndex}) => {
  //   return {
  //     type: 'REVERT_TASK_MOVE',
  //     payload: {taskId, fromColumnId, toColumnId, fromIndex, toIndex}
  //   };
  // };

  // Thunks
  // Functions that return functions allowing them to dispatch actions asynchronously and handle asynchronous logic like API calls

  // Fetches tasks from the server and dispatches actions based on the response
  // Fetches tasks from the server and updates the Redux store
  // Actions like fetchTasks should dispatch an array to fetchTasksSuccess
  // Thunk to fetch tasks
  export const fetchTasks = () => async (dispatch) => {
    try {
      const response = await fetch("/tasks");
      const tasks = await response.json();
      if (!response.ok) throw new Error("Failed to fetch tasks");
      dispatch(fetchTasksSuccess(tasks));
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Use this action to handle the full update of the tasks state
  export const updateTasks = (tasks) => {
    // Process tasks into the format expected by the state
    const newTasksByStatus = tasks.reduce((acc, task) => {
      acc[task.status] = [...(acc[task.status] || []), task];
      return acc;
    }, {});

    return {
      type: FETCH_TASKS_SUCCESS,
      payload: newTasksByStatus,
    };
  };

  // Call this thunk after every task modification operation
  // to ensure the frontend state matches the backend
  export const synchronizeTasks = () => {
    return fetchTasks(); // Reuse the fetchTasks thunk for synchronization
  };

  // Sends a PATCH request to update a task's status in the database and handles the response
  export const updateTaskInDatabase =
    ({ taskId, content, position, status }) =>
    async (dispatch) => {
      try {
        const body = { status };
        if (content !== undefined) {
          body.content = content;
        }

        if (position !== undefined) {
          body.position = position;
        }
        const response = await fetch(`/tasks/${taskId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, position }),
        });

        if (!response.ok) {
          throw new Error("Error updating task status and position");
        }

        const updatedTask = await response.json();
        dispatch(updateTaskPositionSuccess(updatedTask)); // This action now needs to handle updating both status and position in Redux state
      } catch (error) {
        dispatch(updateTaskPositionFailure(error.toString()));
      }
    };

  // Sends a DELETE request to remove a task from the database and handles the response
  export const deleteTask = (taskId) => async (dispatch) => {
    try {
      const response = await fetch(`/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete the task");
      }
      dispatch(deleteTaskSuccess(taskId));
    } catch (error) {
      dispatch(deleteTaskFailure(error.toString()));
      console.error("Error:", error);
    }
  };

  export const editTaskInDatabase =
    ({ taskId, content }) =>
    async (dispatch) => {
      try {
        const response = await fetch(`/tasks/${taskId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          throw new Error("Error updating task");
        }

        const updatedTask = await response.json();
        dispatch(editTaskSuccess(taskId, updatedTask)); // Dispatch the success action
      } catch (error) {
        dispatch(editTaskFailure(error.toString())); // Dispatch the failure action
        console.error("Error updating task:", error);
      }
    };

  // Initial state for the reducer
  const initialState = {
    Backlog: [],
    ToDo: [],
    InProgress: [],
    Done: [],
  };

  // Reducer
  export const tasksReducer = (state = initialState, action) => {
    switch (action.type) {
      case ADD_TASK: {
        const { status, ...taskDetails } = action.payload;
        return {
          ...state,
          [status]: [...state[status], taskDetails],
        };
      }
      case FETCH_TASKS_SUCCESS:
        // Creating a new state structure based on fetched tasks
        const newTasksByStatus = action.payload.reduce((acc, task) => {
          acc[task.status] = [...(acc[task.status] || []), task];
          return acc;
        }, {});
        return { ...state, ...newTasksByStatus };

      // case "MOVE_TASK_OPTIMISTICALLY": {
      //   const { taskId, fromColumnId, toColumnId, fromIndex, toIndex } =
      //     action.payload;
      //   const taskMoved = { ...state[fromColumnId][fromIndex] }; // Make sure to deep copy the task object
      //   const newFromColumn = [...state[fromColumnId]];
      //   const newToColumn = [...state[toColumnId]];

      //   newFromColumn.splice(fromIndex, 1); // Remove from old column
      //   newToColumn.splice(toIndex, 0, taskMoved); // Insert into new column

      //   return {
      //     ...state,
      //     [fromColumnId]: newFromColumn,
      //     [toColumnId]: newToColumn,
      //   };
      // }
      // Inside tasksReducer, update the UPDATE_TASK_POSITION_SUCCESS case
      case UPDATE_TASK_POSITION_SUCCESS: {
        // Extract necessary data from the action payload
        const { status, _id, position } = action.payload;

        // Remove the task from all columns
        let newState = { ...state };
        for (const column in newState) {
          newState[column] = newState[column].filter((task) => task._id !== _id);
        }

        // Insert the task into the new column at the specified position
        const sortedTasks = [...newState[status]].sort(
          (a, b) => a.position - b.position
        );
        const insertionIndex = sortedTasks.findIndex(
          (task) => task.position >= position
        );
        const index = insertionIndex === -1 ? sortedTasks.length : insertionIndex;
        sortedTasks.splice(index, 0, action.payload);

        // Update the position of tasks that come after the inserted task
        for (let i = index + 1; i < sortedTasks.length; i++) {
          sortedTasks[i].position = i;
        }

        newState[status] = sortedTasks;
        return newState;
      }

      case UPDATE_TASK_POSITION_FAILURE: {
        console.error('Failed to update task position:', action.payload);
        return state;
      }

      // case "UPDATE_TASK_POSITION_FAILURE": {
      //   const { taskId, originalColumnId, originalIndex } = action.payload;
      //   // You would need to include the originalColumnId and originalIndex in the failure action payload
      //   // Find the task that needs to be moved back
      //   const task = state[action.payload.newColumnId].find(
      //     (t) => t._id === taskId
      //   );

      //   // Remove the task from its new column
      //   const updatedNewColumn = state[action.payload.newColumnId].filter(
      //     (t) => t._id !== taskId
      //   );
      //   // Insert the task back into its original column and position
      //   const updatedOriginalColumn = [...state[originalColumnId]];
      //   updatedOriginalColumn.splice(originalIndex, 0, task);

      //   return {
      //     ...state,
      //     [action.payload.newColumnId]: updatedNewColumn,
      //     [originalColumnId]: updatedOriginalColumn,
      //   };
      // }

      case DELETE_TASK_SUCCESS: {
        const newState = { ...state };
        Object.keys(newState).forEach((statusKey) => {
          newState[statusKey] = newState[statusKey].filter(
            (task) => task._id !== action.payload
          );
        });
        return newState;
      }
      case DELETE_TASK_FAILURE: {
        console.error("Delete task failed:", action.payload);
        return state;
      }
      case EDIT_TASK_SUCCESS:
        const { taskId, updatedTaskData } = action.payload;
        const statusKey = updatedTaskData.status; // Assuming status might also be updated
        return {
          ...state,
          [statusKey]: state[statusKey].map((task) =>
            task._id === taskId ? { ...task, ...updatedTaskData } : task
          ),
        };

      case EDIT_TASK_FAILURE:
        console.error("Edit task failed:", action.payload);
        return state;

      case "REVERT_TASK_MOVE": {
        const { fromColumnId, toColumnId, fromIndex, toIndex } = action.payload;
        const newFromColumn = [...state[fromColumnId]];
        const newToColumn = [...state[toColumnId]];
        const [taskReverted] = newToColumn.splice(toIndex, 1);
        newFromColumn.splice(fromIndex, 0, taskReverted);

        return {
          ...state,
          [fromColumnId]: newFromColumn,
          [toColumnId]: newToColumn,
        };
      }

      default:
        return state;
    }
  };
