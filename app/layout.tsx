import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'Biblioteca Dr. Lautaro Roncedo | Alcira Gigena',
  description:
    'Plataforma digital oficial, carnet de socio con QR y archivo histórico de la Biblioteca del Club Sportivo y Biblioteca Dr. Lautaro Roncedo de Alcira Gigena, Córdoba.',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/escudo-roncedo.jpg',
    apple: '/images/emblema-biblioteca.jpg',
  },
  applicationName: 'Biblioteca Roncedo',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Biblio Roncedo',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#102A4E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/images/emblema-biblioteca.jpg" />
      </head>
      <body className="h-full flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-roncedo-blue selection:text-white">
        <AuthProvider>
          <ServiceWorkerRegister />
          <Header />
          <div className="flex-1">
            {children}
          </div>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
