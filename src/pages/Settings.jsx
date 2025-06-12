import { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw, FiMoon, FiSun } from 'react-icons/fi';

const Settings = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [settings, setSettings] = useState({
    notifications: true,
    autoAnalyze: true,
    saveReports: true,
    detectionLevel: 'medium',
    maxLogSize: 5,
    reportFormat: 'detailed'
  });
  const [isSaved, setIsSaved] = useState(false);
  
  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  };
  
  // Handle settings change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setIsSaved(false);
  };
  
  // Save settings
  const saveSettings = () => {
    localStorage.setItem('logAISettings', JSON.stringify(settings));
    setIsSaved(true);
    
    // Reset saved indicator after 3 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };
  
  // Reset settings
  const resetSettings = () => {
    const defaultSettings = {
      notifications: true,
      autoAnalyze: true,
      saveReports: true,
      detectionLevel: 'medium',
      maxLogSize: 5,
      reportFormat: 'detailed'
    };
    
    setSettings(defaultSettings);
    localStorage.setItem('logAISettings', JSON.stringify(defaultSettings));
    setIsSaved(true);
    
    // Reset saved indicator after 3 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('logAISettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Application Settings</h2>
        
        {/* Theme Toggle */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Appearance</h3>
          <div className="flex items-center">
            <span className="mr-4 text-gray-600 dark:text-gray-400">Theme:</span>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
              <span className="sr-only">Toggle Theme</span>
              <FiSun className={`absolute left-1 text-yellow-400 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`} size={12} />
              <FiMoon className={`absolute right-1 text-gray-100 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} size={12} />
            </button>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
        </div>
        
        {/* General Settings */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">General Settings</h3>
          
          <div className="space-y-4">
            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="notifications" className="font-medium text-gray-700 dark:text-gray-300">
                  Enable Notifications
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications when analysis is complete
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  id="notifications"
                  name="notifications"
                  checked={settings.notifications}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Auto Analyze */}
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="autoAnalyze" className="font-medium text-gray-700 dark:text-gray-300">
                  Auto-Analyze Logs
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically analyze logs when uploaded
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  id="autoAnalyze"
                  name="autoAnalyze"
                  checked={settings.autoAnalyze}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Save Reports */}
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="saveReports" className="font-medium text-gray-700 dark:text-gray-300">
                  Save Reports
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically save analysis reports
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  id="saveReports"
                  name="saveReports"
                  checked={settings.saveReports}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Analysis Settings */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Analysis Settings</h3>
          
          <div className="space-y-6">
            {/* Detection Level */}
            <div>
              <label htmlFor="detectionLevel" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Detection Level
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Set the sensitivity level for issue detection
              </p>
              <select
                id="detectionLevel"
                name="detectionLevel"
                value={settings.detectionLevel}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="low">Low - Only critical issues</option>
                <option value="medium">Medium - Critical and important issues</option>
                <option value="high">High - All issues including minor ones</option>
              </select>
            </div>
            
            {/* Max Log Size */}
            <div>
              <label htmlFor="maxLogSize" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maximum Log Size (MB)
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Set the maximum size for log files
              </p>
              <input
                type="number"
                id="maxLogSize"
                name="maxLogSize"
                min="1"
                max="50"
                value={settings.maxLogSize}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 py-2 px-3 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            {/* Report Format */}
            <div>
              <label htmlFor="reportFormat" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Report Format
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Choose the level of detail for analysis reports
              </p>
              <select
                id="reportFormat"
                name="reportFormat"
                value={settings.reportFormat}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="summary">Summary - Brief overview</option>
                <option value="detailed">Detailed - Complete analysis</option>
                <option value="technical">Technical - Developer-focused with code snippets</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={resetSettings}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiRefreshCw className="mr-2 -ml-1" />
            Reset to Default
          </button>
          <button
            type="button"
            onClick={saveSettings}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSaved
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <FiSave className="mr-2 -ml-1" />
            {isSaved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
