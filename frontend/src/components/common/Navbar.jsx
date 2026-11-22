import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { offerLetterService } from '../../services/offerLetterService';
import { Menu, Database, ShieldAlert, CheckCircle, RefreshCw, LogOut, User } from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [dbStatus, setDbStatus] = useState({ connected: false, loading: true });
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const data = await offerLetterService.getHealth();
      const isConnected = data?.database === 'connected' || data?.database?.connected || false;
      setDbStatus({
        connected: isConnected,
        loading: false,
        details: typeof data?.database === 'object' ? data.database : { state: data?.database }
      });
    } catch (err) {
      setDbStatus({
        connected: false,
        loading: false,
        error: err.message
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Periodically refresh health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between">
        {/* Left Side: Mobile Menu Button & Context Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-600 hover:text-navy-900 rounded-lg hover:bg-slate-100 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-600">
              Admin Document Suite
            </span>
            <span className="text-sm font-bold text-navy-900">
              Code2Conquer Internal Management
            </span>
          </div>
        </div>

        {/* Right Side: DB Health Status, Admin Info, Actions */}
        <div className="flex items-center gap-3">
          {/* Database Status Indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              dbStatus.loading
                ? 'bg-slate-50 text-slate-600 border-slate-200'
                : dbStatus.connected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
            title={
              dbStatus.connected
                ? 'MongoDB is connected. Certificate registration and verification active.'
                : 'MongoDB is disconnected. Offer letters work locally, but certificates require DB connection.'
            }
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  dbStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  dbStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="hidden md:inline">Database:</span>
            <span>{dbStatus.connected ? 'Atlas / Online' : 'Offline / Standalone'}</span>
            <button
              onClick={checkHealth}
              disabled={checking}
              className="ml-1 p-0.5 rounded hover:bg-black/5 text-slate-500 hover:text-slate-800"
              title="Ping Database"
            >
              <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* User Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="w-5 h-5 rounded-full bg-navy-900 text-gold-400 flex items-center justify-center font-bold text-[10px]">
              A
            </div>
            <span className="font-medium text-slate-700">{user?.username || 'Admin'}</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
            title="Sign out of Admin Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
