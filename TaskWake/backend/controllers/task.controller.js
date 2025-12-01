const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const task = new Task(taskData);
    await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating task' 
    });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ 
      $or: [
        { createdBy: req.user.userId },
        { assignee: req.user.userId },
        { sharedWith: req.user.userId }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching tasks' 
    });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user.userId },
        { assignee: req.user.userId },
        { sharedWith: req.user.userId }
      ]
    });

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching task' 
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { createdBy: req.user.userId },
          { assignee: req.user.userId }
        ]
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found or unauthorized' 
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating task' 
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId
    });

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found or unauthorized' 
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting task' 
    });
  }
};