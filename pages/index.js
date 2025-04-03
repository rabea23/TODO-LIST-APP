import { useState, useEffect } from 'react';

export default function Home() {
  // State
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState({
    initial: true,    // Initial data load
    adding: false,    // Adding new todo
    saving: false     // Saving edits
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium'
  });

  // 1-second delay for adding todos
  const addDelay = () => new Promise(resolve => setTimeout(resolve, 1000));

  // Fetch todos from API
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await fetch('/api/todos');
        const data = await res.json();
        setTodos(data);
      } finally {
        setLoading(prev => ({ ...prev, initial: false }));
      }
    };
    fetchTodos();
  }, []);

  // Add new todo with 1-second delay
  const handleAdd = async () => {
    if (!title.trim()) return;
    
    try {
      setLoading(prev => ({ ...prev, adding: true }));
      await addDelay(); 
      
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, dueDate, priority }),
      });
      const newTodo = await res.json();
      setTodos([...todos, newTodo]);
      setTitle('');
      setDescription('');
      setDueDate('');
    } finally {
      setLoading(prev => ({ ...prev, adding: false }));
    }
  };

  // Start editing
  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditData({
      title: todo.title,
      description: todo.description || '',
      dueDate: todo.dueDate || '',
      priority: todo.priority || 'medium'
    });
  };

  // Save edited todo
  const saveEdit = async () => {
    if (!editData.title.trim()) return;
    
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      const res = await fetch(`/api/todos/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      
      setTodos(todos.map(todo => 
        todo.id === editingId ? { ...todo, ...editData } : todo
      ));
      setEditingId(null);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Toggle completion
  const handleToggle = async (id) => {
    const todo = todos.find(t => t.id === id);
    await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    setTodos(todos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  // Delete todo
  const handleDelete = async (id) => {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    setTodos(todos.filter(t => t.id !== id));
  };

  // Filter and sort
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return 0;
  });

  if (loading.initial) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
  <div className="min-h-screen bg-gray-100/0">
  
    <div className="fixed inset-0 -z-10">
      <img
        src="https://image-component.nextjs.gallery/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fmountains.a2eb1d50.jpg&w=3840&q=100"
        alt="fullscreen-bg"
        className="w-full h-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white/60"></div>
    </div>

    
      <div className="relative max-w-3xl mx-auto p-4 pt-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden">
        
          <div className="bg-blue-600 p-4 text-white text-center">
        <h1 className="text-2xl font-bold inline-block"> TODO LIST</h1>
          </div>

          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Task title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 mb-2 border rounded"
              disabled={loading.adding}
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 mb-2 border rounded"
              rows="2"
              disabled={loading.adding}
            />
            <div className="grid grid-cols-2 gap-4 mb-2">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="p-2 border rounded"
                disabled={loading.adding}
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="p-2 border rounded"
                disabled={loading.adding}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <button
              onClick={handleAdd}
              disabled={loading.adding}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded ${
                loading.adding ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading.adding ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Adding...
                </span>
              ) : (
                'Add Task'
              )}
            </button>
          </div>

          <div className="p-3 bg-gray-50 flex justify-between items-center">
            <div className="flex space-x-1">
              {['all', 'active', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-1 text-sm border rounded"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Sort by Priority</option>
            </select>
          </div>

          {sortedTodos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No tasks found. Add one above!
            </div>
          ) : (
            <ul className="divide-y">
              {sortedTodos.map((todo) => (
                <li 
                  key={todo.id} 
                  className={`p-4 ${todo.completed ? 'bg-gray-50' : ''}`}
                >
                  {editingId === todo.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({...editData, title: e.target.value})}
                        className="w-full p-2 border rounded"
                      />
                      <textarea
                        value={editData.description}
                        onChange={(e) => setEditData({...editData, description: e.target.value})}
                        className="w-full p-2 border rounded"
                        rows="2"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="date"
                          value={editData.dueDate}
                          onChange={(e) => setEditData({...editData, dueDate: e.target.value})}
                          className="p-2 border rounded"
                        />
                        <select
                          value={editData.priority}
                          onChange={(e) => setEditData({...editData, priority: e.target.value})}
                          className="p-2 border rounded"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          disabled={loading.saving}
                          className={`flex-1 bg-green-600 text-white py-1 rounded ${
                            loading.saving ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {loading.saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 bg-gray-500 text-white py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggle(todo.id)}
                        className="mt-1 mr-3 h-5 w-5"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className={`font-medium ${
                            todo.completed ? 'line-through text-gray-500' : 'text-gray-800'
                          }`}>
                            {todo.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            todo.priority === 'high' ? 'bg-red-100 text-red-800' :
                            todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {todo.priority}
                          </span>
                        </div>
                        {todo.description && (
                          <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                        )}
                        {todo.dueDate && (
                          <p className="text-xs text-gray-500 mt-2">
                            Due: {new Date(todo.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => startEditing(todo)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(todo.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
  