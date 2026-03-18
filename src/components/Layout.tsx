import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, PlusCircle, BarChart2, Settings, List, StickyNote } from 'lucide-react';
import clsx from 'clsx';

const Layout = () => {
  return (
    <div className="flex flex-col h-full flex-1">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-zinc-900 border-t border-zinc-800 flex justify-around items-center h-16 px-2 z-50">
        <NavItem to="/dashboard" icon={<Home size={24} />} label="Home" />
        <NavItem to="/insights" icon={<BarChart2 size={24} />} label="Insights" />
        <NavItem to="/notes" icon={<StickyNote size={24} />} label="Notes" />
        <NavItem to="/data" icon={<List size={24} />} label="Data" />
        <NavItem to="/settings" icon={<Settings size={24} />} label="Settings" />
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
          isActive ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
        )
      }
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  );
};

export default Layout;
