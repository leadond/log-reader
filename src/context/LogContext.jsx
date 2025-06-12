import { createContext, useState, useContext } from 'react';

const LogContext = createContext();

export const useLogContext = () => useContext(LogContext);

export const LogProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);
  const [currentLog, setCurrentLog] = useState(null);
  const [analysisResults, setAnalysisResults] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [theme, setTheme] = useState('light');

  // Add a new log file
  const addLog = (log) => {
    const newLog = {
      id: Date.now().toString(),
      name: log.name || `Log ${logs.length + 1}`,
      content: log.content,
      size: log.content.length,
      timestamp: new Date().toISOString(),
      analyzed: false
    };
    
    setLogs(prevLogs => [...prevLogs, newLog]);
    return newLog.id;
  };

  // Get a log by ID
  const getLog = (id) => {
    return logs.find(log => log.id === id) || null;
  };

  // Delete a log
  const deleteLog = (id) => {
    setLogs(prevLogs => prevLogs.filter(log => log.id !== id));
    if (currentLog?.id === id) {
      setCurrentLog(null);
    }
    // Also remove analysis results
    const newResults = { ...analysisResults };
    delete newResults[id];
    setAnalysisResults(newResults);
  };

  // Analyze a log file
  const analyzeLog = async (id) => {
    const log = getLog(id);
    if (!log) return null;
    
    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis results
      const result = mockAnalysis(log.content);
      
      // Update log status
      setLogs(prevLogs => 
        prevLogs.map(l => 
          l.id === id ? { ...l, analyzed: true } : l
        )
      );
      
      // Store analysis results
      setAnalysisResults(prev => ({
        ...prev,
        [id]: result
      }));
      
      setIsAnalyzing(false);
      return result;
    } catch (error) {
      console.error('Error analyzing log:', error);
      setIsAnalyzing(false);
      return null;
    }
  };

  // Mock analysis function
  const mockAnalysis = (content) => {
    const lines = content.split('\n');
    
    // Count error types
    const errorCount = lines.filter(line => 
      line.toLowerCase().includes('error') || 
      line.toLowerCase().includes('exception') || 
      line.toLowerCase().includes('fail')
    ).length;
    
    const warningCount = lines.filter(line => 
      line.toLowerCase().includes('warning') || 
      line.toLowerCase().includes('warn')
    ).length;
    
    const infoCount = lines.filter(line => 
      line.toLowerCase().includes('info') || 
      line.toLowerCase().includes('information')
    ).length;
    
    // Extract timestamps if present
    const timestampRegex = /\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/g;
    const timestamps = [];
    lines.forEach(line => {
      const matches = line.match(timestampRegex);
      if (matches) {
        timestamps.push(...matches);
      }
    });
    
    // Find potential issues
    const issues = [];
    
    if (errorCount > 0) {
      issues.push({
        type: 'error',
        count: errorCount,
        description: 'Critical errors detected in log',
        severity: 'high'
      });
    }
    
    if (warningCount > 0) {
      issues.push({
        type: 'warning',
        count: warningCount,
        description: 'Warnings found that may indicate potential problems',
        severity: 'medium'
      });
    }
    
    // Extract specific error patterns
    const nullPointerLines = lines.filter(line => 
      line.toLowerCase().includes('null pointer') || 
      line.toLowerCase().includes('nullpointerexception')
    );
    
    if (nullPointerLines.length > 0) {
      issues.push({
        type: 'null-pointer',
        count: nullPointerLines.length,
        description: 'Null pointer exceptions detected',
        severity: 'high',
        lines: nullPointerLines.map((line, i) => ({ 
          number: lines.indexOf(line) + 1, 
          content: line 
        })).slice(0, 5)
      });
    }
    
    const timeoutLines = lines.filter(line => 
      line.toLowerCase().includes('timeout') || 
      line.toLowerCase().includes('timed out')
    );
    
    if (timeoutLines.length > 0) {
      issues.push({
        type: 'timeout',
        count: timeoutLines.length,
        description: 'Timeout errors detected',
        severity: 'medium',
        lines: timeoutLines.map((line, i) => ({ 
          number: lines.indexOf(line) + 1, 
          content: line 
        })).slice(0, 5)
      });
    }
    
    // Generate recommendations
    const recommendations = [];
    
    if (errorCount > 0) {
      recommendations.push({
        title: 'Address critical errors',
        description: 'Fix the identified critical errors to improve system stability',
        priority: 'high'
      });
    }
    
    if (nullPointerLines.length > 0) {
      recommendations.push({
        title: 'Fix null pointer exceptions',
        description: 'Add proper null checks to prevent null pointer exceptions',
        priority: 'high'
      });
    }
    
    if (timeoutLines.length > 0) {
      recommendations.push({
        title: 'Optimize timeout operations',
        description: 'Review and optimize operations that are timing out',
        priority: 'medium'
      });
    }
    
    // Generate summary statistics
    const summary = {
      totalLines: lines.length,
      errorCount,
      warningCount,
      infoCount,
      timeRange: timestamps.length > 1 ? {
        start: new Date(timestamps[0]).toISOString(),
        end: new Date(timestamps[timestamps.length - 1]).toISOString()
      } : null,
      severity: errorCount > 10 ? 'high' : errorCount > 0 ? 'medium' : 'low'
    };
    
    return {
      summary,
      issues,
      recommendations,
      timestamp: new Date().toISOString()
    };
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    logs,
    currentLog,
    setCurrentLog,
    analysisResults,
    isAnalyzing,
    theme,
    addLog,
    getLog,
    deleteLog,
    analyzeLog,
    toggleTheme
  };

  return (
    <LogContext.Provider value={value}>
      {children}
    </LogContext.Provider>
  );
};
