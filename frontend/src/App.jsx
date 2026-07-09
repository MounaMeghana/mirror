import { useState, useEffect } from 'react'
import { BrainCircuit, LogOut, History, User } from 'lucide-react'
import { useAuth } from './context/AuthContext'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import WelcomeScreen from './components/WelcomeScreen'
import ScenarioSetup from './components/ScenarioSetup'
import SessionView from './components/SessionView'
import Dashboard from './components/Dashboard'
import SessionHistory from './components/SessionHistory'

function App() {
  const { user, logout } = useAuth();
  // App state: 'welcome', 'login', 'register', 'setup', 'active', 'dashboard', 'history'
  const [sessionState, setSessionState] = useState('welcome');
  const [scenario, setScenario] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [rawExpressions, setRawExpressions] = useState([]);

  // Redirect to welcome if user just logged in or registered
  useEffect(() => {
    if (user && (sessionState === 'login' || sessionState === 'register')) {
      setSessionState('welcome');
    } else if (!user && (sessionState !== 'login' && sessionState !== 'register')) {
      setSessionState('welcome');
    }
  }, [user, sessionState]);

  const startSetup = () => setSessionState('setup');
  const startSession = (scen) => {
    setScenario(scen);
    setSessionState('active');
  };
  const endSession = (data, expressions) => {
    setSummaryData(data);
    setRawExpressions(expressions);
    setSessionState('dashboard');
  };
  const goHome = () => setSessionState('welcome');
  const showHistory = () => setSessionState('history');

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col font-inter">
      {/* Header */}
      <header className="w-full border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={goHome}
          >
            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg shadow-purple-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Eunoia
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-sm font-medium text-neutral-300">{user.username}</span>
                </div>
                <button 
                  onClick={showHistory}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2"
                  title="Session History"
                >
                  <History className="w-5 h-5" />
                  <span className="hidden md:inline text-sm font-medium">History</span>
                </button>
                <button 
                  onClick={logout}
                  className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex items-center gap-2"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline text-sm font-medium">Logout</span>
                </button>
              </>
            ) : (
              <button 
                onClick={() => setSessionState('login')}
                className="px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content - Centered container */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        
        {/* ── AUTH PAGES ── */}
        {sessionState === 'login' && (
          <LoginPage onGoToRegister={() => setSessionState('register')} />
        )}
        {sessionState === 'register' && (
          <RegisterPage onGoToLogin={() => setSessionState('login')} />
        )}

        {/* ── APP PAGES ── */}
        {sessionState === 'welcome' && (
          <WelcomeScreen onStart={startSetup} />
        )}

        {sessionState === 'setup' && (
          <ScenarioSetup 
            onCancel={goHome} 
            onStartSession={startSession} 
          />
        )}

        {sessionState === 'active' && (
          <SessionView 
            scenario={scenario} 
            onEndSession={endSession} 
            onCancel={goHome}
          />
        )}

        {sessionState === 'dashboard' && (
          <Dashboard 
            summaryData={summaryData} 
            raw_expressions={rawExpressions}
            onRestart={goHome}
          />
        )}

        {sessionState === 'history' && (
          <SessionHistory onBack={goHome} />
        )}

      </main>

      {/* Decorative center glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] pointer-events-none rounded-full z-0" />
    </div>
  )
}

export default App
