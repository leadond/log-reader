import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogContext } from '../context/LogContext';
import { FiUpload, FiClipboard, FiFile } from 'react-icons/fi';

const Upload = () => {
  const [logText, setLogText] = useState('');
  const [uploadMethod, setUploadMethod] = useState('paste'); // 'paste' or 'file'
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  const { addLog, analyzeLog } = useLogContext();
  const navigate = useNavigate();
  
  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogText(event.target.result);
      };
      reader.readAsText(file);
    }
  };
  
  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogText(event.target.result);
      };
      reader.readAsText(file);
      setUploadMethod('file');
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (logText.trim()) {
      // Add log to context
      const logId = addLog(logText);
      
      // Analyze the log
      try {
        await analyzeLog(logId);
        // Navigate to analysis page
        navigate(`/analysis/${logId}`);
      } catch (error) {
        console.error('Error analyzing log:', error);
      }
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Upload Logs for Analysis</h2>
        
        {/* Upload Method Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
              uploadMethod === 'paste'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setUploadMethod('paste')}
          >
            <FiClipboard className="inline mr-2" />
            Paste Log
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
              uploadMethod === 'file'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setUploadMethod('file')}
          >
            <FiFile className="inline mr-2" />
            Upload File
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {uploadMethod === 'paste' ? (
            <div className="mb-4">
              <label htmlFor="logText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paste your log content below:
              </label>
              <textarea
                id="logText"
                rows="12"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Paste your log content here..."
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
              ></textarea>
            </div>
          ) : (
            <div 
              className={`mb-4 border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FiUpload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <div className="mt-2">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Drag and drop a file here, or click to select a file
                  </span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".log,.txt,.json"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Supported formats: .log, .txt, .json
              </p>
              {fileName && (
                <div className="mt-3 text-sm text-gray-800 dark:text-gray-200">
                  Selected file: <span className="font-medium">{fileName}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!logText.trim()}
              className={`px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                logText.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Analyze Log
            </button>
          </div>
        </form>
      </div>
      
      {/* Tips Section */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Tips for Better Analysis</h3>
        <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>Include complete log entries with timestamps and log levels</li>
          <li>Provide context about the application environment</li>
          <li>Include stack traces for error analysis</li>
          <li>For large logs, focus on the relevant time period around the issue</li>
          <li>Include system information if available (OS, memory, CPU)</li>
        </ul>
      </div>
    </div>
  );
};

export default Upload;
