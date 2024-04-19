  import express from "express";
  import mongoose from "mongoose";
  import dotenv from 'dotenv';
  import cors from 'cors'; 
  import Task from './models/Task.js';


  dotenv.config();


  const app = express();
  app.use(express.json());


  app.use(cors());


  const PORT = process.env.PORT || 3000;


  //connect to our mongodb using mongoose

  mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true})
  .then( () => console.log('MongoDb connected'))
  .catch( err => console.log(err));




  app.post('/tasks', async (req, res) => {
      const { content, status } = req.body;

      // Check for required fields
      if (!content || !status) {
        return res.status(400).json({ error: "Task content and status are required" });
      }
      try {
        // Find the highest current position in the specified status category
        const maxPositionTask = await Task.findOne({ status: status }).sort({ position: -1 });
        const newPosition = maxPositionTask ? maxPositionTask.position + 1 : 0;

        // Create the new task with the next position
        const newTask = new Task({ content, status, position: newPosition });
        await newTask.save();
        res.status(201).json(newTask);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });


    // fetch tasks

    app.get('/tasks', async (req, res) => {
      try {
        const tasks = await Task.find({});
        res.status(200).json(tasks);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });


  app.patch('/tasks/:id', async (req, res) => {
    const { content, status, position } = req.body;
    const { id } = req.params;

    let updateFields = {};
    if (content !== undefined) {
      updateFields.content = content;
    }

    if (status !== undefined && position !== undefined) {
      updateFields.status = status;
      updateFields.position = position;
    } else if (status !== undefined || position !== undefined) {
      return res.status(400).json({ error: "Both status and position are required for moving a task" });
    }
    
    try {
      const updatedTask = await Task.findByIdAndUpdate(id, updateFields, { new: true });
      if (!updatedTask) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.status(200).json(updatedTask);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});


// app.patch('/tasks/:id', async (req, res) => {
//   const { content, status, position } = req.body;
//   const { id } = req.params;

//   let updateFields = {};
//   if (content !== undefined) {
//     updateFields.content = content;
//   }

//   // Update both status and position atomically if both are provided
//   if (status !== undefined && position !== undefined) {
//     updateFields.status = status;
//     updateFields.position = position;
//   } else {
//     return res.status(400).json({ error: "Both status and position are required for moving a task" });
//   }

//   try {
//     // Using findByIdAndUpdate to ensure atomicity of the update
//     const updatedTask = await Task.findByIdAndUpdate(id, updateFields, { new: true });
//     if (!updatedTask) {
//       return res.status(404).json({ error: "Task not found" });
//     }

//     res.status(200).json(updatedTask);
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error: " + error.message });
//   }
// });




  // DELETE a task
  app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await Task.deleteOne({ _id: id });
  
      if (result.deletedCount === 0) {
        // No document found with that ID or nothing was deleted
        return res.status(404).json({ error: "Task not found" });
      }
  
      // The task was found and deleted
      res.status(200).json({ message: "Task deleted successfully", _id: id });
    } catch (error) {
      // Handle any other errors that occur during the operation
      res.status(500).json({ error: error.message });
    }
  });
  
  


  app.listen(PORT, () => {
      console.log('Server is running in port', PORT);
  })  

  