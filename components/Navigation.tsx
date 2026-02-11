'use client';

import { usePathname } from 'next/navigation';
import { Home, CheckSquare, Smile, MessageSquare, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { href: '/habits', label: 'Habits', icon: <CheckSquare className="w-5 h-5" /> },
  { href: '/mood', label: 'Mood', icon: <Smile className="w-5 h-5" /> },
  { href: '/chat', label: 'AI Coach', icon: <MessageSquare className="w-5 h-5" /> },
  { href: '/insights', label: 'Insights', icon: <BarChart3 className="w-5 h-5" /> },
];

export function Navigation({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn('border-t bg-background', className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around h-16 sm:h-20">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200',
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <div className={cn('transition-transform', isActive ? 'scale-110' : '')}>
                  {item.icon}
                </div>
                <span className="text-xs font-medium hidden sm:block">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// Desktop sidebar navigation for larger screens
export function SidebarNavigation({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn('border-r bg-background w-64 h-screen sticky top-0 hidden lg:block', className)}>
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-8">
          HabitFlow
        </h1>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="border-t pt-4">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
