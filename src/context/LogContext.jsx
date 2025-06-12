import { createContext, useState, useContext } from 'react';

// Create the context
const LogContext = createContext();

// Custom hook for using the context
export const useLogContext = () => useContext(LogContext);

// Provider component
export const LogProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add a new log
  const addLog = (log) => {
    const newLog = {
      id: Date.now().toString(),
      content: log,
      timestamp: new Date().toISOString(),
      analyzed: false
    };
    setLogs(prevLogs => [...prevLogs, newLog]);
    return newLog.id;
  };

  // Analyze a log
  const analyzeLog = async (logId) => {
    setLoading(true);
    setError(null);
    
    try {
      const log = logs.find(l => l.id === logId);
      if (!log) throw new Error('Log not found');
      
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const analysis = {
        id: logId,
        timestamp: new Date().toISOString(),
        summary: "Log analysis completed successfully",
        errorCount: Math.floor(Math.random() * 10),
        warningCount: Math.floor(Math.random() * 15),
        infoCount: Math.floor(Math.random() * 20),
        applicationContext: "Spring Boot Application",
        detectedIssues: [
          {
            type: "error",
            message: "NullPointerException in UserService.java",
            lineNumber: 42,
            recommendation: "Check for null user object before accessing properties"
          },
          {
            type: "warning",
            message: "Slow database query in ProductRepository",
            lineNumber: 156,
            recommendation: "Add index to product_category column"
          }
        ],
        performanceMetrics: {
          responseTime: Math.random() * 500 + 100,
          memoryUsage: Math.random() * 1024 + 512,
          cpuLoad: Math.random() * 80 + 20
        }
      };
      
      setAnalyses(prev => [...prev, analysis]);
      
      // Mark log as analyzed
      setLogs(prevLogs => 
        prevLogs.map(l => 
          l.id === logId ? { ...l, analyzed: true } : l
        )
      );
      
      setLoading(false);
      return analysis;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // Delete a log
  const deleteLog = (logId) => {
    setLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
    setAnalyses(prevAnalyses => prevAnalyses.filter(analysis => analysis.id !== logId));
  };

  // Get a specific analysis
  const getAnalysis = (logId) => {
    return analyses.find(analysis => analysis.id === logId);
  };

  const value = {
    logs,
    analyses,
    loading,
    error,
    addLog,
    analyzeLog,
    deleteLog,
    getAnalysis
  };

  return (
    <LogContext.Provider value={value}>
      {children}
    </LogContext.Provider>
  );
};
