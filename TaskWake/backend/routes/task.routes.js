const express = require('express');
const { 
  createTask, 
  getTasks, 
  getTask, 
  updateTask, 
  deleteTask 
} = require('../controllers/task.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createTask);
router.get('/', getTasks);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;