import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardProvider } from './context/DashboardContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Home } from './pages/Home';
import { Timeline } from './pages/Timeline';
import { Details } from './pages/Details';
import { Status } from './pages/Status';

export const App: React.FC = () => {
  return (
    <DashboardProvider>
      <Router>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/details" element={<Details />} />
            <Route path="/status" element={<Status />} />
            {/* Fallback routing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DashboardLayout>
      </Router>
    </DashboardProvider>
  );
};

export default App;
