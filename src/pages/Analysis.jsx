import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLogContext } from '../context/LogContext';
import { FiAlertCircle, FiAlertTriangle, FiInfo, FiDownload, FiCpu, FiDatabase, FiClock } from 'react-icons/fi';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Analysis = () => {
  const { id } = useParams();
  const { logs, analyses, getAnalysis, loading, error, analyzeLog } = useLogContext();
  const [analysis, setAnalysis] = useState(null);
  const [log, setLog] = useState(null);
  
  useEffect(() => {
    // Find the log
    const foundLog = logs.find(l => l.id === id);
    setLog(foundLog);
    
    // Get analysis if it exists
    const foundAnalysis = getAnalysis(id);
    
    if (foundAnalysis) {
      setAnalysis(foundAnalysis);
    } else if (foundLog && !foundLog.analyzed) {
      // Analyze the log if not already analyzed
      analyzeLog(id).then(result => {
        setAnalysis(result);
      }).catch(err => {
        console.error('Error analyzing log:', err);
      });
    }
  }, [id, logs, analyses, getAnalysis, analyzeLog]);
  
  // Export as PDF
  const exportAsPDF = async () => {
    const element = document.getElementById('analysis-report');
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`log-analysis-${id}.pdf`);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
        <h2 className="text-lg font-semibold mb-2">Error</h2>
        <p>{error}</p>
        <Link to="/upload" className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Try Again
        </Link>
      </div>
    );
  }
  
  if (!log) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-700 dark:text-yellow-400">
        <h2 className="text-lg font-semibold mb-2">Log Not Found</h2>
        <p>The requested log could not be found.</p>
        <Link to="/upload" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Upload New Log
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          Log Analysis #{id.substring(0, 8)}
        </h1>
        <button
          onClick={exportAsPDF}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiDownload className="mr-2" />
          Export as PDF
        </button>
      </div>
      
      <div id="analysis-report" className="space-y-6">
        {/* Log Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Log Content</h2>
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-auto max-h-64">
            <SyntaxHighlighter
              language="log"
              style={vscDarkPlus}
              customStyle={{ margin: 0, borderRadius: '0.5rem' }}
            >
              {log.content}
            </SyntaxHighlighter>
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Uploaded: {new Date(log.timestamp).toLocaleString()}
          </div>
        </div>
        
        {analysis ? (
          <>
            {/* Application Context */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Application Context</h2>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-300 font-medium">{analysis.applicationContext}</p>
              </div>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard 
                title="Errors" 
                value={analysis.errorCount} 
                icon={<FiAlertCircle size={20} />} 
                color="red"
              />
              <StatCard 
                title="Warnings" 
                value={analysis.warningCount} 
                icon={<FiAlertTriangle size={20} />} 
                color="yellow"
              />
              <StatCard 
                title="Info" 
                value={analysis.infoCount} 
                icon={<FiInfo size={20} />} 
                color="blue"
              />
            </div>
            
            {/* Performance Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Performance Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard 
                  title="Response Time" 
                  value={`${analysis.performanceMetrics.responseTime.toFixed(2)} ms`} 
                  icon={<FiClock />} 
                />
                <MetricCard 
                  title="Memory Usage" 
                  value={`${analysis.performanceMetrics.memoryUsage.toFixed(2)} MB`} 
                  icon={<FiDatabase />} 
                />
                <MetricCard 
                  title="CPU Load" 
                  value={`${analysis.performanceMetrics.cpuLoad.toFixed(2)}%`} 
                  icon={<FiCpu />} 
                />
              </div>
            </div>
            
            {/* Detected Issues */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Detected Issues</h2>
              {analysis.detectedIssues.length > 0 ? (
                <div className="space-y-4">
                  {analysis.detectedIssues.map((issue, index) => (
                    <IssueCard key={index} issue={issue} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No issues detected.</p>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Analyzing log data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
  };
  
  return (
    <div className={`rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center">
        <div className="p-2 rounded-full bg-white dark:bg-gray-700 mr-3">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, icon }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex items-center">
        <div className="p-2 rounded-full bg-white dark:bg-gray-600 mr-3 text-blue-600 dark:text-blue-400">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Issue Card Component
const IssueCard = ({ issue }) => {
  const typeColors = {
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
  };
  
  const typeIcons = {
    error: <FiAlertCircle className="text-red-500 dark:text-red-400" />,
    warning: <FiAlertTriangle className="text-yellow-500 dark:text-yellow-400" />,
    info: <FiInfo className="text-blue-500 dark:text-blue-400" />,
  };
  
  return (
    <div className={`rounded-lg border p-4 ${typeColors[issue.type]}`}>
      <div className="flex items-start">
        <div className="mr-3 mt-1">
          {typeIcons[issue.type]}
        </div>
        <div>
          <h3 className="font-semibold">{issue.message}</h3>
          {issue.lineNumber && (
            <p className="text-sm mt-1 opacity-80">Line: {issue.lineNumber}</p>
          )}
          {issue.recommendation && (
            <div className="mt-2 p-2 bg-white/50 dark:bg-black/20 rounded">
              <p className="text-sm font-medium">Recommendation:</p>
              <p className="text-sm">{issue.recommendation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analysis;
