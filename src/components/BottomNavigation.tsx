// Bottom Navigation Component

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ClipboardList, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/search', label: 'Buscar', icon: Search },
  { path: '/orders', label: 'Pedidos', icon: ClipboardList },
  { path: '/account', label: 'Conta', icon: User }
];

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'bottom-nav-item flex-1',
                isActive && 'active'
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
