import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogContext } from '../context/LogContext';
import { FiFileText, FiAlertTriangle, FiCheckCircle, FiActivity, FiClock } from 'react-icons/fi';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { logs, analysisResults } = useLogContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLogs: 0,
    analyzedLogs: 0,
    totalIssues: 0,
    criticalIssues: 0,
    warningIssues: 0
  });
  
  useEffect(() => {
    // Calculate dashboard statistics
    const analyzedLogs = logs.filter(log => log.analyzed);
    let totalIssues = 0;
    let criticalIssues = 0;
    let warningIssues = 0;
    
    analyzedLogs.forEach(log => {
      const result = analysisResults[log.id];
      if (result) {
        totalIssues += result.issues.length;
        criticalIssues += result.issues.filter(issue => issue.severity === 'high').length;
        warningIssues += result.issues.filter(issue => issue.severity === 'medium').length;
      }
    });
    
    setStats({
      totalLogs: logs.length,
      analyzedLogs: analyzedLogs.length,
      totalIssues,
      criticalIssues,
      warningIssues
    });
  }, [logs, analysisResults]);
  
  // Chart data for issue types
  const issueTypeData = {
    labels: ['Critical', 'Warning', 'Info'],
    datasets: [
      {
        label: 'Issue Types',
        data: [stats.criticalIssues, stats.warningIssues, stats.totalIssues - stats.criticalIssues - stats.warningIssues],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Chart data for log analysis status
  const logStatusData = {
    labels: ['Analyzed', 'Not Analyzed'],
    datasets: [
      {
        label: 'Log Status',
        data: [stats.analyzedLogs, stats.totalLogs - stats.analyzedLogs],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(201, 203, 207, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(201, 203, 207, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Recent logs
  const recentLogs = [...logs].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  ).slice(0, 5);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
            <FiFileText className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Logs</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLogs}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mr-4">
            <FiCheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Analyzed Logs</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.analyzedLogs}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-yellow-100 dark:bg-yellow-900 p-3 mr-4">
            <FiAlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Issues</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalIssues}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900 p-3 mr-4">
            <FiActivity className="h-6 w-6 text-red-600 dark:text-red-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical Issues</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.criticalIssues}</p>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Issue Distribution</h2>
          <div className="h-64">
            <Doughnut 
              data={issueTypeData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Log Analysis Status</h2>
          <div className="h-64">
            <Bar 
              data={logStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                    },
                    grid: {
                      color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                  },
                  x: {
                    ticks: {
                      color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                    },
                    grid: {
                      color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Recent Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Logs</h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentLogs.length > 0 ? (
            recentLogs.map(log => (
              <div 
                key={log.id} 
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => navigate(`/analysis/${log.id}`)}
              >
                <div className="flex items-center">
                  <FiFileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{log.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {log.size} bytes • {log.analyzed ? 'Analyzed' : 'Not analyzed'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FiClock className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No logs available. Upload a log file to get started.</p>
              <button
                onClick={() => navigate('/upload')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Upload Log
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
