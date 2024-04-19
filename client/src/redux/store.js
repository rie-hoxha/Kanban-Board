import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import {thunk} from 'redux-thunk';
import { tasksReducer } from './taskActions';

const rootReducer = combineReducers({
  tasks: tasksReducer,
  // ... other reducers if any
});

// Use Redux DevTools Extension directly if installed in the browser
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(
    applyMiddleware(thunk)
  )
);

export default store;
