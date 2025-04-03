import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'todos.json');

const readTodos = () => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf-8');
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const writeTodos = (todos) => {
  fs.writeFileSync(filePath, JSON.stringify(todos, null, 2), 'utf-8');
};

export default function handler(req, res) {
  try {
    // GET all todos
    if (req.method === 'GET') {
      const todos = readTodos();
      return res.status(200).json(todos);
    }

    // POST new todo
    if (req.method === 'POST') {
      const { title, description, dueDate, priority } = req.body;
      if (!title) return res.status(400).json({ error: 'Title is required' });

      const todos = readTodos();
      const newTodo = {
        id: Date.now(),
        title,
        description: description || '',
        completed: false,
        dueDate: dueDate || null,
        priority: priority || 'medium',
        createdAt: new Date().toISOString()
      };
      todos.push(newTodo);
      writeTodos(todos);
      return res.status(201).json(newTodo);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}