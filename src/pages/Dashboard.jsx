import { useLogContext } from '../context/LogContext';
import { FiFileText, FiAlertCircle, FiAlertTriangle, FiInfo, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { logs, analyses } = useLogContext();
  
  // Calculate statistics
  const totalLogs = logs.length;
  const analyzedLogs = logs.filter(log => log.analyzed).length;
  const totalErrors = analyses.reduce((sum, analysis) => sum + analysis.errorCount, 0);
  const totalWarnings = analyses.reduce((sum, analysis) => sum + analysis.warningCount, 0);
  
  // Chart data
  const chartData = {
    labels: ['Errors', 'Warnings', 'Info'],
    datasets: [
      {
        label: 'Log Events',
        data: [totalErrors, totalWarnings, analyses.reduce((sum, analysis) => sum + analysis.infoCount, 0)],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(54, 162, 235)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Log Event Distribution',
      },
    },
  };
  
  // Recent logs
  const recentLogs = [...logs].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Logs" 
          value={totalLogs} 
          icon={<FiFileText className="text-blue-500" size={24} />} 
          color="blue"
        />
        <StatCard 
          title="Analyzed Logs" 
          value={analyzedLogs} 
          icon={<FiClock className="text-green-500" size={24} />} 
          color="green"
        />
        <StatCard 
          title="Total Errors" 
          value={totalErrors} 
          icon={<FiAlertCircle className="text-red-500" size={24} />} 
          color="red"
        />
        <StatCard 
          title="Total Warnings" 
          value={totalWarnings} 
          icon={<FiAlertTriangle className="text-yellow-500" size={24} />} 
          color="yellow"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Event Distribution</h2>
          <div className="h-64">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Recent Logs</h2>
          {recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.map(log => (
                <div key={log.id} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <div className="flex justify-between items-start">
                    <div className="truncate flex-1">
                      <Link 
                        to={`/analysis/${log.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Log #{log.id.substring(0, 8)}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {log.content.substring(0, 60)}...
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      log.analyzed 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                    }`}>
                      {log.analyzed ? 'Analyzed' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FiFileText size={40} className="mx-auto mb-2" />
              <p>No logs uploaded yet</p>
              <Link 
                to="/upload" 
                className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload Logs
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  };
  
  return (
    <div className={`rounded-lg shadow border ${colorClasses[color]} p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-white dark:bg-gray-700 shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
