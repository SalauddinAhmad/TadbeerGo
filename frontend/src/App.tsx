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
      <div className="min-h-screen bg-[#F4EFEB] flex items-center justify-center text-[#16221E] font-bengali">
        <div className="flex flex-col items-center space-y-3.5">
          <div className="w-16 h-16 rounded-full overflow-hidden p-0.5 border-2 border-[#3E5514] shadow-md bg-white">
            <img src="/shaikh-avatar.jpg" alt="শায়খ মোখতার আহমাদ" className="w-full h-full object-cover object-top rounded-full" />
          </div>
          <RefreshCw className="animate-spin text-[#3E5514]" size={22} />
          <p className="text-xs text-[#586661] font-heading font-semibold">TadbeerGo লোড হচ্ছে...</p>
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
