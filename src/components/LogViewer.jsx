import { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco, atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FiSearch, FiX, FiChevronDown, FiChevronUp, FiDownload } from 'react-icons/fi';

const LogViewer = ({ content, theme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (!term) {
      setSearchResults([]);
      return;
    }
    
    // Find all occurrences of the search term
    const regex = new RegExp(term, 'gi');
    const lines = content.split('\n');
    const results = [];
    
    lines.forEach((line, index) => {
      if (regex.test(line)) {
        results.push({ line, lineNumber: index + 1 });
      }
    });
    
    setSearchResults(results);
    setCurrentResultIndex(0);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };
  
  const navigateResults = (direction) => {
    if (searchResults.length === 0) return;
    
    if (direction === 'next') {
      setCurrentResultIndex((prev) => 
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else {
      setCurrentResultIndex((prev) => 
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    }
  };
  
  const downloadLog = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'log-export.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Highlight search results in the code
  const highlightedContent = searchTerm && searchResults.length > 0
    ? content.split('\n').map((line, i) => {
        if (searchResults.some(result => result.lineNumber === i + 1)) {
          const regex = new RegExp(`(${searchTerm})`, 'gi');
          return line.replace(regex, '<mark style="background-color: #ffff00; color: #000;">$1</mark>');
        }
        return line;
      }).join('\n')
    : content;
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Log Content
        </h3>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search..."
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            {searchTerm && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          
          {searchResults.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{currentResultIndex + 1} of {searchResults.length}</span>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => navigateResults('prev')}
                  className="p-1 rounded-l border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateResults('next')}
                  className="p-1 rounded-r border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          
          <button
            type="button"
            onClick={downloadLog}
            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiDownload className="h-4 w-4" />
          </button>
          
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isExpanded ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      <div className={`overflow-auto ${isExpanded ? 'max-h-[800px]' : 'max-h-[400px]'}`}>
        <SyntaxHighlighter
          language="plaintext"
          style={theme === 'dark' ? atomOneDark : docco}
          showLineNumbers={true}
          wrapLines={true}
          lineProps={lineNumber => {
            const isHighlighted = searchResults.some(
              result => result.lineNumber === lineNumber
            );
            const isCurrentResult = searchResults[currentResultIndex]?.lineNumber === lineNumber;
            
            return {
              style: {
                display: 'block',
                backgroundColor: isCurrentResult 
                  ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.2)' : 'rgba(255, 255, 0, 0.3)')
                  : isHighlighted
                    ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.1)' : 'rgba(255, 255, 0, 0.15)')
                    : undefined,
              }
            };
          }}
          customStyle={{
            margin: 0,
            padding: '1rem',
            borderRadius: 0,
          }}
        >
          {highlightedContent}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default LogViewer;
