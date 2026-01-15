import React, { useState, useEffect, createContext, useContext } from 'react';
import { Calendar, Clock, MapPin, Plus, Settings, LayoutDashboard, ChevronDown, ChevronRight, Trash2, Car, AlertCircle } from 'lucide-react';

// Context for global state
const AppContext = createContext();

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// Main App Component
const App = () => {
  const [isConfigured, setIsConfigured] = useState(true);
  const [config, setConfig] = useState({ workerUrl: 'https://scheduler-gateway.parkerbranham.workers.dev', apiKey: 'scheduler-secret-sFHu6OIKmO7z4tyOk0QRYwNc5KiRPhps' });
  const [tasks, setTasks] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [currentView, setCurrentView] = useState('tasks');

  useEffect(() => {
    const savedConfig = localStorage.getItem('schedulerConfig');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(parsed);
      setIsConfigured(true);
      loadTasks(parsed);
    }
  }, []);

  const loadTasks = async (cfg) => {
    try {
      const response = await fetch(`${cfg.workerUrl}/api/tasks`, {
        headers: {
          'X-API-Key': cfg.apiKey,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const saveConfig = (newConfig) => {
    localStorage.setItem('schedulerConfig', JSON.stringify(newConfig));
    setConfig(newConfig);
    setIsConfigured(true);
    loadTasks(newConfig);
  };

  const contextValue = {
    config,
    tasks,
    setTasks,
    appointments,
    setAppointments,
    loadTasks: () => loadTasks(config)
  };

  if (!isConfigured) {
    return <SetupPage onSave={saveConfig} />;
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Smart Scheduler</span>
              </div>
              <div className="flex space-x-4 items-center">
                <NavButton icon={LayoutDashboard} label="Tasks" active={currentView === 'tasks'} onClick={() => setCurrentView('tasks')} />
                <NavButton icon={Car} label="Drivers" active={currentView === 'drivers'} onClick={() => setCurrentView('drivers')} />
                <NavButton icon={Settings} label="Settings" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'tasks' && <TasksView />}
          {currentView === 'drivers' && <DriversView />}
          {currentView === 'settings' && <SettingsView onConfigChange={saveConfig} />}
        </main>
      </div>
    </AppContext.Provider>
  );
};

// Setup Page
const SetupPage = ({ onSave }) => {
  const [workerUrl, setWorkerUrl] = useState('');
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = () => {
    if (workerUrl && apiKey) {
      onSave({ workerUrl, apiKey });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <Calendar className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Smart Scheduler</h1>
          <p className="text-gray-600 mt-2">Let's get you set up</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cloudflare Worker URL
            </label>
            <input
              type="url"
              value={workerUrl}
              onChange={(e) => setWorkerUrl(e.target.value)}
              placeholder="https://your-worker.workers.dev"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};

// Navigation Button
const NavButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
      active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    <Icon className="h-5 w-5" />
    <span className="font-medium">{label}</span>
  </button>
);

// Tasks View
const TasksView = () => {
  const [showAddTask, setShowAddTask] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Upcoming Tasks</h2>
        <button
          onClick={() => setShowAddTask(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Task</span>
        </button>
      </div>

      {showAddTask && <AddTaskForm onClose={() => setShowAddTask(false)} />}
      <TaskList />
    </div>
  );
};

// Add Task Form
const AddTaskForm = ({ onClose }) => {
  const { config, loadTasks } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    category: 'School',
    duration: 30,
    dueDate: '',
    description: '',
    autoSchedule: true
  });

  const categories = ['School', 'Personal', 'Chores', 'Exercise/Health', 'Social', 'Other'];

  const handleSubmit = async () => {
    if (!formData.title || !formData.dueDate) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const response = await fetch(`${config.workerUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'X-API-Key': config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadTasks();
        onClose();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Task</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Math homework"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              min="15"
              max="240"
              step="15"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Due Date & Time</label>
          <input
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            rows="3"
            placeholder="Add any additional details..."
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="autoSchedule"
            checked={formData.autoSchedule}
            onChange={(e) => setFormData({ ...formData, autoSchedule: e.target.checked })}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="autoSchedule" className="text-sm text-gray-700">
            Auto-schedule this task
          </label>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Add Task
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Task List
const TaskList = () => {
  const { tasks, config, loadTasks } = useApp();
  const [expandedTask, setExpandedTask] = useState(null);

  const categoryColors = {
    'School': 'bg-blue-500',
    'Personal': 'bg-purple-500',
    'Chores': 'bg-green-500',
    'Exercise/Health': 'bg-red-500',
    'Social': 'bg-pink-500',
    'Other': 'bg-gray-500'
  };

  const deleteTask = async (taskId) => {
    try {
      await fetch(`${config.workerUrl}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'X-API-Key': config.apiKey
        }
      });
      await loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No tasks scheduled yet</p>
        <p className="text-gray-400 text-sm mt-2">Click "Add Task" to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
        >
          <div
            className="p-4 cursor-pointer"
            onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className={`${categoryColors[task.category]} h-12 w-1 rounded-full`} />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{task.duration} min</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {task.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                {expandedTask === task.id ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {expandedTask === task.id && task.description && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-4">
              <p className="text-gray-600">{task.description}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Drivers View
const DriversView = () => {
  const { config } = useApp();
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [appointments, setAppointments] = useState([]);
  const [driverAssignments, setDriverAssignments] = useState({});

  useEffect(() => {
    loadAppointments();
  }, [weekStart]);

  const loadAppointments = async () => {
    try {
      const dateStr = weekStart.toISOString().split('T')[0];
      const response = await fetch(`${config.workerUrl}/api/appointments/week?date=${dateStr}`, {
        headers: {
          'X-API-Key': config.apiKey
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
        const assignments = {};
        data.appointments?.forEach(appt => {
          assignments[appt.id] = appt.driver || '';
        });
        setDriverAssignments(assignments);
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const saveAssignments = async () => {
    try {
      await fetch(`${config.workerUrl}/api/drivers/assign`, {
        method: 'POST',
        headers: {
          'X-API-Key': config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assignments: driverAssignments })
      });
      alert('Driver assignments saved!');
    } catch (error) {
      console.error('Failed to save assignments:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Sunday Driver Planning</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Previous Week
          </button>
          <span className="font-medium text-gray-700">
            Week of {weekStart.toLocaleDateString()}
          </span>
          <button
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Next Week
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No appointments this week</p>
          </div>
        ) : (
          appointments.map((appt) => (
            <div key={appt.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(appt.time).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                    <Clock className="h-4 w-4 ml-4" />
                    <span>{new Date(appt.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{appt.title}</h3>
                  {appt.location && (
                    <div className="flex items-start space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                      <span className="text-sm">{appt.location}</span>
                    </div>
                  )}
                </div>
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Driver
                  </label>
                  <select
                    value={driverAssignments[appt.id] || ''}
                    onChange={(e) => setDriverAssignments({ ...driverAssignments, [appt.id]: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">None</option>
                    <option value="Parker">Parker</option>
                    <option value="Adrian">Adrian</option>
                    <option value="Mom">Mom</option>
                    <option value="Dad">Dad</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {appointments.length > 0 && (
        <button
          onClick={saveAssignments}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Save Driver Assignments
        </button>
      )}
    </div>
  );
};

// Settings View
const SettingsView = ({ onConfigChange }) => {
  const { config } = useApp();
  const [workerUrl, setWorkerUrl] = useState(config.workerUrl);
  const [apiKey, setApiKey] = useState(config.apiKey);

  const handleSave = () => {
    onConfigChange({ workerUrl, apiKey });
    alert('Settings saved!');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout? This will clear all settings.')) {
      localStorage.removeItem('schedulerConfig');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cloudflare Worker URL
            </label>
            <input
              type="url"
              value={workerUrl}
              onChange={(e) => setWorkerUrl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>

      <div className="bg-red-50 rounded-xl shadow-lg p-8 border-2 border-red-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h3>
            <p className="text-red-700 text-sm mb-4">
              Logging out will clear all saved settings. You'll need to re-enter your configuration.
            </p>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility functions
const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export default App;