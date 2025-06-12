import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LogProvider } from './context/LogContext';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Theme handler component
const ThemeHandler = ({ children }) => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Apply theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(savedTheme);
  }, [pathname]); // Re-apply when route changes
  
  return children;
};

function App() {
  return (
    <Router>
      <LogProvider>
        <ThemeHandler>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="upload" element={<Upload />} />
              <Route path="analysis/:id" element={<Analysis />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </ThemeHandler>
      </LogProvider>
    </Router>
  );
}

export default App;
