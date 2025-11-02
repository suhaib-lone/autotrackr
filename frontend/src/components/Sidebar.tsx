import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { logout } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col sticky top-0">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold gradient-text">AutoTrackr</h1>
        <p className="text-sm text-muted-foreground mt-1">Job Tracking System</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                'hover:bg-muted',
                isActive && 'bg-primary/10 text-primary border border-primary/20'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all duration-200 hover:bg-destructive/10 text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
