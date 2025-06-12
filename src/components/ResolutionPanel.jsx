import { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco, atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FiExternalLink, FiChevronDown, FiChevronUp, FiCopy, FiCheck } from 'react-icons/fi';

const ResolutionPanel = ({ resolution, theme }) => {
  const [expandedStep, setExpandedStep] = useState(null);
  const [copiedStates, setCopiedStates] = useState({});
  
  const toggleStep = (index) => {
    setExpandedStep(expandedStep === index ? null : index);
  };
  
  const copyCode = (code, stepIndex) => {
    navigator.clipboard.writeText(code);
    
    // Set copied state for this step
    setCopiedStates(prev => ({
      ...prev,
      [stepIndex]: true
    }));
    
    // Reset after 2 seconds
    setTimeout(() => {
      setCopiedStates(prev => ({
        ...prev,
        [stepIndex]: false
      }));
    }, 2000);
  };
  
  if (!resolution) {
    return null;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {resolution.title}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {resolution.description}
        </p>
      </div>
      
      {resolution.affectedLines && resolution.affectedLines.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Affected Lines
          </h4>
          <div className="space-y-2">
            {resolution.affectedLines.map((line, index) => (
              <div key={index} className="text-sm bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">
                <span className="text-gray-500 dark:text-gray-400 mr-2">Line {line.number}:</span>
                <span className="text-red-600 dark:text-red-400">{line.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="px-6 py-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          Resolution Steps
        </h4>
        
        <div className="space-y-4">
          {resolution.steps.map((step, index) => (
            <div 
              key={index} 
              className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleStep(index)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-700 text-left"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {index + 1}. {step.title}
                </span>
                {expandedStep === index ? (
                  <FiChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <FiChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>
              
              {expandedStep === index && (
                <div className="p-4">
                  <div className="relative">
                    <div className="absolute top-2 right-2 z-10 flex space-x-2">
                      <button
                        type="button"
                        onClick={() => copyCode(step.code, index)}
                        className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {copiedStates[index] ? (
                          <FiCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <FiCopy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <SyntaxHighlighter
                      language={step.language || 'javascript'}
                      style={theme === 'dark' ? atomOneDark : docco}
                      showLineNumbers={true}
                      customStyle={{
                        margin: 0,
                        borderRadius: '0.375rem',
                      }}
                    >
                      {step.code}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {resolution.resources && resolution.resources.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Additional Resources
          </h4>
          <ul className="space-y-2">
            {resolution.resources.map((resource, index) => (
              <li key={index}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center text-sm"
                >
                  {resource.title}
                  <FiExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResolutionPanel;
