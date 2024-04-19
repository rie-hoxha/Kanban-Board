import React from "react";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import KanbanBoard from "./components/KanbanBoard";
// import TasksBoard from "./features/TasksBoard";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<KanbanBoard/>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
