// index.js
const express = require('express');
const Joi = require('joi');
const app = express();
const port = 3000;

// Array para armazenar tarefas (em memória)
const tasks = [];
let nextTaskId = 1;
// Middleware para parsear JSON
app.use(express.json());

// Middleware para servir ficheiros estáticos
app.use(express.static('.'));

// Schema de validação para uma tarefa
const taskSchema = Joi.object({
  title: Joi.string().min(1).required(),
  completed: Joi.boolean(),
});

/**
 * @route GET /tasks
 * @group Tasks - Operações sobre tarefas
 * @returns {Array<object>} 200 - Um array com todas as tarefas
 */
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

/**
 * @route POST /tasks
 * @group Tasks - Operações sobre tarefas
 * @param {object} req.body.required - O objeto da nova tarefa
 * @returns {object} 201 - A tarefa recém-criada
 * @returns {Error} 400 - Requisição inválida (falha na validação)
 */
app.post('/tasks', (req, res) => {
  const { error, value } = taskSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { title, completed } = value;
  const newTask = {
    id: nextTaskId++,
    title,
    completed: completed || false,
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

/**
 * @route PUT /tasks/:id
 * @group Tasks - Operações sobre tarefas
 * @param {number} id.path.required - O ID da tarefa a ser atualizada
 * @param {object} req.body.required - Os campos da tarefa a serem atualizados
 * @returns {object} 200 - A tarefa atualizada
 * @returns {Error} 404 - Tarefa não encontrada
 */
app.put('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return res.status(404).json({ message: 'Tarefa não encontrada' });
  }

  const { title, completed } = req.body;

  if (title !== undefined) {
    task.title = title;
  }

  // Lógica para a data de conclusão
  if (completed !== undefined) {
    // Se a tarefa está a ser marcada como concluída (e não estava antes)
    if (completed === true && task.completed === false) {
      task.completedAt = new Date().toISOString();
    }
    // Se a tarefa está a ser desmarcada como concluída
    else if (completed === false) {
      task.completedAt = null; // ou delete task.completedAt;
    }
    task.completed = completed;
  }

  res.json(task);
});

/**
 * @route DELETE /tasks/:id
 * @group Tasks - Operações sobre tarefas
 * @param {number} id.path.required - O ID da tarefa a ser removida
 * @returns {void} 204 - Nenhuma resposta (sucesso na remoção)
 * @returns {Error} 404 - Tarefa não encontrada
 */
app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Tarefa não encontrada' });
  }

  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

