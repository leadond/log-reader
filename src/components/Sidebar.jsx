import { NavLink } from 'react-router-dom';
import { FiHome, FiUpload, FiBarChart2, FiFileText, FiSettings } from 'react-icons/fi';

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: <FiHome size={20} />, label: 'Dashboard' },
    { path: '/upload', icon: <FiUpload size={20} />, label: 'Upload Logs' },
    { path: '/reports', icon: <FiBarChart2 size={20} />, label: 'Reports' },
    { path: '/settings', icon: <FiSettings size={20} />, label: 'Settings' }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:block">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">LogAI</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Log Analysis</p>
      </div>
      
      {/* Navigation */}
      <nav className="mt-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className="px-2 py-1">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>LogAI v0.1.0</p>
          <p>© 2023 xBesh Labs</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
