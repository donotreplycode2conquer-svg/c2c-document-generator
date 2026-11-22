import React from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  FileText,
  Award,
  CheckCircle2,
  History,
  Settings,
  ShieldCheck,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      exact: true
    },
    {
      to: '/generate-offer-letter',
      label: 'Generate Offer Letter',
      icon: FileText
    },
    {
      to: '/generate-certificate',
      label: 'Generate Certificate',
      icon: Award
    },
    {
      to: '/issued-certificates',
      label: 'Issued Certificates',
      icon: CheckCircle2
    },
    {
      to: '/document-history',
      label: 'Document History',
      icon: History
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-navy-900 text-slate-200 border-r border-navy-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-navy-800">
          <Logo size="md" variant="light" />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-navy-800/70'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Verification Status Card in Sidebar */}
        <div className="p-4 m-3 rounded-xl bg-navy-950/80 border border-navy-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-gold-400 mb-1">
            <ShieldCheck className="w-4 h-4 text-gold-400" />
            <span>Central Registry</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Certificates issued here register with MongoDB Atlas for public verification.
          </p>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-navy-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>v1.0.0 (Admin Local)</span>
          <span className="text-gold-400 font-medium">Code2Conquer</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
