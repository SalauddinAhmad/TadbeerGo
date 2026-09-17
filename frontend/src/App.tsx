import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/Auth/LoginPage';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { CalendarPage } from './pages/Calendar/CalendarPage';
import { ClassesPage } from './pages/Classes/ClassesPage';
import { JumuaPage } from './pages/Jumua/JumuaPage';
import { ProgrammesPage } from './pages/Programmes/ProgrammesPage';
import { ContactsPage } from './pages/Contacts/ContactsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { RefreshCw } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-emerald-500 shadow-xl bg-emerald-950 flex items-center justify-center">
            <img src="/shaikh-avatar.jpg" alt="শায়খ মোখতার আহমাদ" className="w-full h-full object-cover object-top" />
          </div>
          <RefreshCw className="animate-spin text-emerald-400" size={24} />
          <p className="text-xs text-slate-400">Loading TadbeerGo...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppLayout currentTab={currentTab} onSelectTab={setCurrentTab}>
      {currentTab === 'dashboard' && <DashboardPage onNavigate={setCurrentTab} />}
      {currentTab === 'calendar' && <CalendarPage />}
      {currentTab === 'classes' && <ClassesPage />}
      {currentTab === 'jumua' && <JumuaPage />}
      {currentTab === 'programmes' && <ProgrammesPage />}
      {currentTab === 'contacts' && <ContactsPage />}
      {currentTab === 'settings' && <SettingsPage />}
    </AppLayout>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
