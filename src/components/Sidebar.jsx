import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  HomeIcon,
  ChartBarIcon,
  CreditCardIcon,
  Cog6ToothIcon as CogIcon,
  ArrowRightOnRectangleIcon as LogoutIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { logout, user } = useAuth();
  console.log('Sidebar user:', user); // Add this log
  const location = useLocation();
  const [profileImage, setProfileImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Expenses', href: '/expenses', icon: CreditCardIcon },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col w-64 min-h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-r border-white/5">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
          Expense Tracker
        </h1>
      </div>

      {/* User Info */}
      <div className="p-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5">
          <div className="flex flex-col items-center text-center">
            <div className="relative cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="profileImageInput"
              />
              <label htmlFor="profileImageInput" className="cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-[2px]">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircleIcon className="w-16 h-16 text-slate-400" />
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-sm text-white font-medium">Change</span>
                </div>
              </label>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full ring-2 ring-slate-950"></div>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-base font-medium text-white">
                {user?.fullname || 'Loading...'}
              </p>
              <p className="text-sm text-slate-400">Active now</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1.5">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150
                  ${isActive(item.href)
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive(item.href) ? 'text-blue-400' : ''
                }`} />
                <span className="text-sm font-medium">{item.name}</span>
                {isActive(item.href) && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400
                   hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 group"
        >
          <LogoutIcon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
