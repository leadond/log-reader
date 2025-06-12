import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLogContext } from '../context/LogContext';
import LogViewer from '../components/LogViewer';
import { FiAlertTriangle, FiInfo, FiCheckCircle, FiDownload, FiFileText } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Analysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getLog, analyzeLog, analysisResults, isAnalyzing, theme } = useLogContext();
  const [log, setLog] = useState(null);
  const [result, setResult] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  
  useEffect(() => {
    const logData = getLog(id);
    if (!logData) {
      navigate('/upload');
      return;
    }
    
    setLog(logData);
    
    // Check if we already have analysis results
    if (analysisResults[id]) {
      setResult(analysisResults[id]);
    } else {
      // Analyze the log
      analyzeLog(id).then(analysisResult => {
        setResult(analysisResult);
      });
    }
  }, [id, getLog, analyzeLog, analysisResults, navigate]);
  
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };
  
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <FiAlertTriangle className="h-5 w-5" />;
      case 'medium':
        return <FiInfo className="h-5 w-5" />;
      case 'low':
        return <FiCheckCircle className="h-5 w-5" />;
      default:
        return <FiInfo className="h-5 w-5" />;
    }
  };
  
  const exportToPDF = async () => {
    if (!log || !result) return;
    
    setIsExporting(true);
    
    try {
      const reportElement = document.getElementById('analysis-report');
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`log-analysis-${log.name.replace(/\s+/g, '-')}.pdf`);
      
      setIsExporting(false);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      setIsExporting(false);
    }
  };
  
  if (!log) {
    return (
      <div className="p-6 flex justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Log not found. Please upload a log file.</p>
          <button
            onClick={() => navigate('/upload')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Upload Log
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{log.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(log.timestamp).toLocaleString()} • {log.content.length} bytes
          </p>
        </div>
        
        <button
          onClick={exportToPDF}
          disabled={isAnalyzing || isExporting || !result}
          className={`px-4 py-2 rounded-md flex items-center ${
            isAnalyzing || isExporting || !result
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          } text-white`}
        >
          {isExporting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <FiDownload className="mr-2" />
              Export Report
            </>
          )}
        </button>
      </div>
      
      <div id="analysis-report" className="space-y-6">
        {/* Analysis Status */}
        {isAnalyzing ? (
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Analyzing log file... This may take a moment.
            </p>
          </div>
        ) : result ? (
          <>
            {/* Summary */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Analysis Summary</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FiFileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <h3 className="font-medium text-gray-900 dark:text-white">Log Statistics</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Total Lines:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{result.summary.totalLines}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Errors:</span>
                        <span className="font-medium text-red-600 dark:text-red-400">{result.summary.errorCount}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Warnings:</span>
                        <span className="font-medium text-yellow-600 dark:text-yellow-400">{result.summary.warningCount}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Info:</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">{result.summary.infoCount}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className={`${getSeverityColor(result.summary.severity)}`}>
                        {getSeverityIcon(result.summary.severity)}
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white ml-2">Overall Severity</h3>
                    </div>
                    <div className="mt-4 text-center">
                      <span className={`text-2xl font-bold ${getSeverityColor(result.summary.severity)} capitalize`}>
                        {result.summary.severity}
                      </span>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {result.summary.severity === 'high' 
                          ? 'Critical issues detected that require immediate attention'
                          : result.summary.severity === 'medium'
                            ? 'Some issues found that should be addressed'
                            : 'Minor or no issues detected'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FiInfo className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <h3 className="font-medium text-gray-900 dark:text-white">Time Range</h3>
                    </div>
                    {result.summary.timeRange ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Start:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {new Date(result.summary.timeRange.start).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">End:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {new Date(result.summary.timeRange.end).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {Math.round((new Date(result.summary.timeRange.end) - new Date(result.summary.timeRange.start)) / 1000 / 60)} minutes
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No timestamp information found in log
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Issues */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Detected Issues</h2>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {result.issues.length > 0 ? (
                  result.issues.map((issue, index) => (
                    <div key={index} className="p-6">
                      <div className="flex items-start">
                        <div className={`mt-0.5 ${getSeverityColor(issue.severity)}`}>
                          {getSeverityIcon(issue.severity)}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-base font-medium text-gray-900 dark:text-white capitalize">
                            {issue.type.replace(/-/g, ' ')} ({issue.count})
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {issue.description}
                          </p>
                          
                          {issue.lines && issue.lines.length > 0 && (
                            <div className="mt-3 bg-gray-50 dark:bg-gray-700 rounded-md p-3 text-sm">
                              <p className="font-medium text-gray-900 dark:text-white mb-2">Sample occurrences:</p>
                              <ul className="space-y-1">
                                {issue.lines.map((line, i) => (
                                  <li key={i} className="text-gray-600 dark:text-gray-300 overflow-hidden text-ellipsis">
                                    <span className="text-gray-500 dark:text-gray-400 mr-2">Line {line.number}:</span>
                                    {line.content}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <FiCheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No issues detected in this log file.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recommendations</h2>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-4">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="flex">
                        <div className={`flex-shrink-0 mt-1 ${
                          rec.priority === 'high' 
                            ? 'text-red-600 dark:text-red-400' 
                            : rec.priority === 'medium'
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          <FiInfo className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                          <p className="text-base font-medium text-gray-900 dark:text-white">{rec.title}</p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{rec.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No analysis results available.</p>
          </div>
        )}
        
        {/* Log Viewer */}
        <LogViewer content={log.content} theme={theme} />
      </div>
    </div>
  );
};

export default Analysis;
