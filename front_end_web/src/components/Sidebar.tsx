import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  History,
  BookOpen,
  TrendingUp,
  User,
  Settings,
  X,
  Sprout,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Predict Crop', path: '/predict', icon: Sparkles },
    { name: 'Prediction History', path: '/predictions', icon: History },
    { name: 'Crop Library', path: '/crops', icon: BookOpen },
    { name: 'Market Mandi Prices', path: '/market', icon: TrendingUp },
    { name: 'User Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div>
          {/* Header on mobile */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 lg:hidden">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-agri-600 rounded-md text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-bold text-gray-900">Agri Advisor</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 mt-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-agri-50 text-agri-700 border border-agri-200/60 shadow-xs'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info inside sidebar */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="p-3 bg-agri-900 rounded-xl text-white">
            <div className="flex items-center space-x-2 text-agri-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sprout className="w-3.5 h-3.5 text-agri-400" />
              <span>AI Engine</span>
            </div>
            <p className="text-xs text-agri-100 font-medium leading-relaxed">
              ML Crop & Yield Prediction models synced with real-time Agmarknet.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
