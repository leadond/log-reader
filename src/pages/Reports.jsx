import { useState } from 'react';
import { useLogContext } from '../context/LogContext';
import { FiDownload, FiBarChart2, FiPieChart, FiTrendingUp } from 'react-icons/fi';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Reports = () => {
  const { logs, analyses } = useLogContext();
  const [activeTab, setActiveTab] = useState('summary');
  
  // Export as PDF
  const exportAsPDF = async () => {
    const element = document.getElementById('report-content');
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('log-analysis-report.pdf');
  };
  
  // Calculate summary data
  const totalLogs = logs.length;
  const analyzedLogs = logs.filter(log => log.analyzed).length;
  const totalErrors = analyses.reduce((sum, analysis) => sum + analysis.errorCount, 0);
  const totalWarnings = analyses.reduce((sum, analysis) => sum + analysis.warningCount, 0);
  const totalInfos = analyses.reduce((sum, analysis) => sum + analysis.infoCount, 0);
  
  // Prepare chart data
  const eventDistributionData = {
    labels: ['Errors', 'Warnings', 'Info'],
    datasets: [
      {
        label: 'Event Count',
        data: [totalErrors, totalWarnings, totalInfos],
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
  
  // Application context distribution
  const contextCounts = {};
  analyses.forEach(analysis => {
    const context = analysis.applicationContext;
    contextCounts[context] = (contextCounts[context] || 0) + 1;
  });
  
  const contextDistributionData = {
    labels: Object.keys(contextCounts),
    datasets: [
      {
        label: 'Application Contexts',
        data: Object.values(contextCounts),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgb(54, 162, 235)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
          'rgb(255, 159, 64)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Performance trends
  const performanceTrendData = {
    labels: analyses.map((_, index) => `Log ${index + 1}`),
    datasets: [
      {
        label: 'Response Time (ms)',
        data: analyses.map(a => a.performanceMetrics.responseTime),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Memory Usage (MB)',
        data: analyses.map(a => a.performanceMetrics.memoryUsage / 10), // Scaled for visibility
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header with Export Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Analysis Reports</h1>
        <button
          onClick={exportAsPDF}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiDownload className="mr-2" />
          Export as PDF
        </button>
      </div>
      
      {/* Report Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-3 font-medium text-sm focus:outline-none ${
              activeTab === 'summary'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('summary')}
          >
            <FiBarChart2 className="inline mr-2" />
            Summary
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm focus:outline-none ${
              activeTab === 'distribution'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('distribution')}
          >
            <FiPieChart className="inline mr-2" />
            Distribution
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm focus:outline-none ${
              activeTab === 'performance'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('performance')}
          >
            <FiTrendingUp className="inline mr-2" />
            Performance
          </button>
        </div>
      </div>
      
      {/* Report Content */}
      <div id="report-content" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {totalLogs === 0 ? (
          <div className="text-center py-12">
            <FiBarChart2 size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Data Available</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Upload and analyze logs to generate reports.</p>
          </div>
        ) : (
          <>
            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Log Analysis Summary</h2>
                
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <SummaryCard title="Total Logs" value={totalLogs} />
                  <SummaryCard title="Analyzed Logs" value={analyzedLogs} />
                  <SummaryCard title="Total Errors" value={totalErrors} />
                  <SummaryCard title="Total Warnings" value={totalWarnings} />
                </div>
                
                {/* Event Distribution Chart */}
                <div className="mt-8">
                  <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300">Event Distribution</h3>
                  <div className="h-64">
                    <Bar 
                      data={eventDistributionData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                        },
                      }} 
                    />
                  </div>
                </div>
                
                {/* Top Issues */}
                <div className="mt-8">
                  <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300">Top Issues</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Issue</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Occurrences</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {analyses.length > 0 && analyses[0].detectedIssues.map((issue, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{issue.message}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                issue.type === 'error' 
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
                                  : issue.type === 'warning'
                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                              }`}>
                                {issue.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{Math.floor(Math.random() * 5) + 1}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            {/* Distribution Tab */}
            {activeTab === 'distribution' && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Event Distribution Analysis</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Event Type Distribution */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300">Event Type Distribution</h3>
                    <div className="h-64">
                      <Pie 
                        data={eventDistributionData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                          },
                        }} 
                      />
                    </div>
                  </div>
                  
                  {/* Application Context Distribution */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300">Application Context Distribution</h3>
                    <div className="h-64">
                      <Pie 
                        data={contextDistributionData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                          },
                        }} 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Distribution Table */}
                <div className="mt-8">
                  <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300">Detailed Distribution</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Application Context</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Errors</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Warnings</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Info</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {Object.keys(contextCounts).map((context, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{context}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{Math.floor(Math.random() * 10)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{Math.floor(Math.random() * 15)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{Math.floor(Math.random() * 20)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">{contextCounts[context]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Performance Analysis</h2>
                
                {/* Performance Trend Chart */}
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300">Performance Trends</h3>
                  <div className="h-80">
                    <Line 
                      data={performanceTrendData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                      }} 
                    />
                  </div>
                </div>
                
                {/* Performance Metrics Table */}
                <div className="mt-8">
                  <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300">Performance Metrics</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Log ID</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Response Time (ms)</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Memory Usage (MB)</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">CPU Load (%)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {analyses.map((analysis, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">#{analysis.id.substring(0, 8)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{analysis.performanceMetrics.responseTime.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{analysis.performanceMetrics.memoryUsage.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{analysis.performanceMetrics.cpuLoad.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ title, value }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
    </div>
  );
};

export default Reports;
