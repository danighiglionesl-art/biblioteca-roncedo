'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Home, CreditCard, Library, ShieldCheck, Download, User } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user || pathname === '/login' || pathname === '/recuperar') {
    return null;
  }

  const navItems = [
    {
      label: 'Inicio',
      href: '/home',
      icon: Home,
    },
    {
      label: 'Mi Carnet',
      href: '/carnet',
      icon: CreditCard,
    },
    {
      label: 'Mi Biblioteca',
      href: '/mi-biblioteca',
      icon: Library,
    },
    ...(user.role === 'admin'
      ? [
          {
            label: 'Admin',
            href: '/admin',
            icon: ShieldCheck,
          },
        ]
      : [
          {
            label: 'Perfil',
            href: '/perfil',
            icon: User,
          },
        ]),
    {
      label: 'Instalar',
      href: '/instalar',
      icon: Download,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg md:hidden">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center transition-colors relative py-1 ${
                isActive
                  ? 'text-roncedo-blue font-bold'
                  : 'text-slate-500 hover:text-roncedo-navy font-medium'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-roncedo-blue rounded-b-full" />
              )}
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[11px] leading-tight truncate px-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
