import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AccessibilityPanel from './components/AccessibilityPanel';
import LandingPage from './pages/LandingPage';
import LiveTranslatorPage from './pages/LiveTranslatorPage';
import ConversationPage from './pages/ConversationPage';
import HistoryPage from './pages/HistoryPage';
import DashboardPage from './pages/DashboardPage';
import LearnSignsPage from './pages/LearnSignsPage';
import AuthPage from './pages/AuthPage';
import { getCurrentUser } from './services/supabaseClient';
import { Eye, ShieldCheck, RefreshCw, X } from 'lucide-react';

export default function App() {
  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#', '').trim();
    const validTabs = ['landing', 'translator', 'conversation', 'history', 'dashboard', 'learn', 'auth'];
    return validTabs.includes(hash) ? hash : 'landing';
  };

  const [activeTab, setActiveTabState] = useState(getTabFromHash());
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const setActiveTab = (tabId) => {
    setActiveTabState(tabId);
    if (window.location.hash !== `#${tabId}`) {
      window.history.pushState({ tabId }, '', `#${tabId}`);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const currentTab = getTabFromHash();
      setActiveTabState(currentTab);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoadingUser(true);
      const user = await getCurrentUser();
      setCurrentUser(user);
      if (!user) {
        setShowAuthModal(true);
      } else if (user?.highContrast) {
        document.body.classList.add('high-contrast');
      }
    } catch (err) {
      console.warn('Error loading user session:', err);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleAuthComplete = (user) => {
    setCurrentUser(user);
    setShowAuthModal(false);
    if (user?.highContrast) {
      document.body.classList.add('high-contrast');
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-xs font-semibold">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-brand-500 animate-spin" />
          <span>Loading SWAR...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col font-sans transition-colors duration-200 relative"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
      />

      {/* Main Pages */}
      <main className="flex-1">
        {activeTab === 'landing' && <LandingPage onNavigate={setActiveTab} />}
        {activeTab === 'translator' && <LiveTranslatorPage currentUser={currentUser} />}
        {activeTab === 'conversation' && <ConversationPage currentUser={currentUser} />}
        {activeTab === 'history' && <HistoryPage currentUser={currentUser} />}
        {activeTab === 'dashboard' && <DashboardPage onNavigate={setActiveTab} />}
        {activeTab === 'learn' && <LearnSignsPage />}
        {activeTab === 'auth' && <AuthPage currentUser={currentUser} setCurrentUser={handleAuthComplete} />}
      </main>

      {/* Sign In / Email OTP Verification Modal Popup */}
      {showAuthModal && !currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-full transition"
              title="Explore platform"
            >
              <X className="w-5 h-5" />
            </button>
            
            <AuthPage
              currentUser={currentUser}
              setCurrentUser={handleAuthComplete}
            />
          </div>
        </div>
      )}

      {/* Accessibility Panel Modal */}
      <AccessibilityPanel
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
        currentUser={currentUser}
        onUserUpdate={setCurrentUser}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-semibold">
            <img src="/swar-icon.png" alt="SWAR Logo" className="w-5 h-5 rounded-md object-cover" />
            <span className="text-slate-800 dark:text-white font-bold">SWAR</span>
            <span>– Every Sign Has a Voice</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAccessibilityOpen(true)}
              className="flex items-center gap-1 hover:text-brand-600 font-semibold"
            >
              <Eye className="w-4 h-4 text-brand-600" /> Accessibility Options
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('learn')} className="hover:underline font-medium">Dictionary</button>
            <span>•</span>
            <button onClick={() => setActiveTab('auth')} className="hover:underline font-medium">Account</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
