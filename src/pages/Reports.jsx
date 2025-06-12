import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogContext } from '../context/LogContext';
import { FiFileText, FiAlertTriangle, FiCalendar, FiDownload, FiEye } from 'react-icons/fi';

const Reports = () => {
  const { logs, analysisResults } = useLogContext();
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  
  // Get analyzed logs
  const analyzedLogs = logs.filter(log => log.analyzed);
  
  // Apply filters
  const filteredLogs = analyzedLogs.filter(log => {
    const result = analysisResults[log.id];
    if (!result) return false;
    
    // Time filter
    if (timeFilter !== 'all') {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      
      switch (timeFilter) {
        case 'today':
          if (logDate.toDateString() !== now.toDateString()) return false;
          break;
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          if (logDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(now.getMonth() - 1);
          if (logDate < monthAgo) return false;
          break;
        default:
          break;
      }
    }
    
    // Severity filter
    if (severityFilter !== 'all' && result.summary.severity !== severityFilter) {
      return false;
    }
    
    return true;
  });
  
  // Sort by timestamp (newest first)
  const sortedLogs = [...filteredLogs].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
  
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <FiAlertTriangle className="mr-1" />
            Critical
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <FiAlertTriangle className="mr-1" />
            Warning
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <FiAlertTriangle className="mr-1" />
            Low
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            Unknown
          </span>
        );
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analysis Reports</h1>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="timeFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time Period
            </label>
            <select
              id="timeFilter"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="severityFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Severity
            </label>
            <select
              id="severityFilter"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Severities</option>
              <option value="high">Critical</option>
              <option value="medium">Warning</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Reports List */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Reports ({sortedLogs.length})
          </h2>
        </div>
        
        {sortedLogs.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedLogs.map(log => {
              const result = analysisResults[log.id];
              return (
                <div key={log.id} className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <FiFileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {log.name}
                        </h3>
                      </div>
                      
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        <span>Analyzed on {new Date(result.timestamp).toLocaleString()}</span>
                      </div>
                      
                      <div className="mt-2">
                        {getSeverityBadge(result.summary.severity)}
                      </div>
                      
                      <div className="mt-3 text-sm">
                        <div className="flex items-center">
                          <span className="text-gray-500 dark:text-gray-400 mr-2">Issues:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{result.issues.length}</span>
                        </div>
                        
                        <div className="flex items-center mt-1">
                          <span className="text-gray-500 dark:text-gray-400 mr-2">Recommendations:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{result.recommendations.length}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => navigate(`/analysis/${log.id}`)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FiEye className="mr-1.5 -ml-0.5 h-4 w-4" />
                        View
                      </button>
                      
                      <button
                        onClick={() => navigate(`/analysis/${log.id}`)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FiDownload className="mr-1.5 -ml-0.5 h-4 w-4" />
                        Export
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {analyzedLogs.length > 0
                ? 'No reports match the selected filters.'
                : 'No analyzed logs found. Upload and analyze a log file to generate reports.'}
            </p>
            
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiUpload className="mr-1.5 -ml-0.5 h-4 w-4" />
              Upload Log
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
