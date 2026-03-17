import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import ProfileSelectScreen from './screens/ProfileSelectScreen';
import DashboardScreen from './screens/DashboardScreen';
import PreGameLogScreen from './screens/PreGameLogScreen';
import PostGameLogScreen from './screens/PostGameLogScreen';
import InsightsScreen from './screens/InsightsScreen';
import RawDataScreen from './screens/RawDataScreen';
import SettingsScreen from './screens/SettingsScreen';

export default function App() {
  const activeProfileId = useStore((state) => state.activeProfileId);

  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex justify-center">
        {/* Mobile container constraint */}
        <div className="w-full max-w-md bg-zinc-900 shadow-2xl overflow-hidden flex flex-col relative min-h-screen">
          <Routes>
            <Route path="/" element={activeProfileId ? <Navigate to="/dashboard" /> : <ProfileSelectScreen />} />
            <Route path="/profiles" element={<ProfileSelectScreen />} />
            
            {/* Protected Routes */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={activeProfileId ? <DashboardScreen /> : <Navigate to="/" />} />
              <Route path="/log/pre" element={activeProfileId ? <PreGameLogScreen /> : <Navigate to="/" />} />
              <Route path="/log/post/:logId" element={activeProfileId ? <PostGameLogScreen /> : <Navigate to="/" />} />
              <Route path="/insights" element={activeProfileId ? <InsightsScreen /> : <Navigate to="/" />} />
              <Route path="/data" element={activeProfileId ? <RawDataScreen /> : <Navigate to="/" />} />
              <Route path="/settings" element={activeProfileId ? <SettingsScreen /> : <Navigate to="/" />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}
