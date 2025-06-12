import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogContext } from '../context/LogContext';
import { FiUpload, FiFile, FiX, FiClipboard, FiCheck } from 'react-icons/fi';

const Upload = () => {
  const { addLog } = useLogContext();
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileSelect = (file) => {
    if (file.type !== 'text/plain' && !file.name.endsWith('.log')) {
      setError('Please upload a text or log file');
      setSelectedFile(null);
      return;
    }
    
    setError('');
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileContent(e.target.result);
    };
    reader.readAsText(file);
  };
  
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileContent('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handlePasteChange = (e) => {
    setPastedContent(e.target.value);
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      let content = '';
      let name = '';
      
      if (activeTab === 'upload') {
        if (!selectedFile) {
          setError('Please select a file to upload');
          setIsLoading(false);
          return;
        }
        content = fileContent;
        name = selectedFile.name;
      } else {
        if (!pastedContent.trim()) {
          setError('Please paste some log content');
          setIsLoading(false);
          return;
        }
        content = pastedContent;
        name = `Pasted Log ${new Date().toLocaleString()}`;
      }
      
      // Add log to context
      const logId = addLog({
        name,
        content
      });
      
      // Navigate to analysis page
      setIsLoading(false);
      navigate(`/analysis/${logId}`);
    } catch (error) {
      console.error('Error uploading log:', error);
      setError('An error occurred while processing the log');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upload Log</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === 'upload'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('upload')}
        >
          <FiUpload className="inline-block mr-2" />
          Upload File
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === 'paste'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('paste')}
        >
          <FiClipboard className="inline-block mr-2" />
          Paste Content
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}
      
      {/* Upload File Tab */}
      {activeTab === 'upload' && (
        <div className="mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-700'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{ minHeight: '300px' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".txt,.log"
              onChange={handleFileInputChange}
            />
            
            {!selectedFile ? (
              <>
                <FiUpload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Drag and drop your log file here
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  or click to browse files (TXT, LOG)
                </p>
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Select File
                </button>
              </>
            ) : (
              <div className="w-full">
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
                  <div className="flex items-center">
                    <FiFile className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-white dark:bg-gray-800 max-h-60 overflow-auto">
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {fileContent.length > 1000
                      ? `${fileContent.substring(0, 1000)}...`
                      : fileContent}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Paste Content Tab */}
      {activeTab === 'paste' && (
        <div className="mb-6">
          <textarea
            value={pastedContent}
            onChange={handlePasteChange}
            placeholder="Paste your log content here..."
            className="w-full h-80 p-4 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
      )}
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className={`px-6 py-2 rounded-md flex items-center ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          } text-white`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <FiCheck className="mr-2" />
              Analyze Log
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Upload;
