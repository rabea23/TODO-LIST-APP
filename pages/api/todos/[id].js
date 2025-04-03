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
    const { id } = req.query; // Get ID from URL

    // PUT - Update todo
    if (req.method === 'PUT') {
      const { title, description, dueDate, priority, completed } = req.body;
      let todos = readTodos();
      
      todos = todos.map(todo => 
        todo.id === Number(id) ? { 
          ...todo,
          title: title || todo.title,
          description: description || todo.description,
          dueDate: dueDate || todo.dueDate,
          priority: priority || todo.priority,
          completed: completed !== undefined ? completed : todo.completed
        } : todo
      );
      
      writeTodos(todos);
      return res.status(200).json({ success: true });
    }

    // DELETE - Remove todo
    if (req.method === 'DELETE') {
      let todos = readTodos();
      const initialLength = todos.length;
      
      todos = todos.filter(todo => todo.id !== Number(id));
      
      if (todos.length === initialLength) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      
      writeTodos(todos);
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
    
  } catch (error) {
    console.error('PUT/DELETE Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}