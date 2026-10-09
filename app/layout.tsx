import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { LibrosProvider } from '@/lib/context/LibrosContext';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { BotonWhatsappFlotante } from '@/components/common/BotonWhatsappFlotante';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'Biblioteca Roncedo | Plataforma Digital Oficial',
  description:
    'Plataforma digital oficial, carnet de socio con QR y archivo de la Biblioteca Roncedo del Club Sportivo y Biblioteca Dr. Lautaro Roncedo.',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/escudo-roncedo.png',
    apple: '/images/logo-biblioteca.png',
  },
  applicationName: 'Biblioteca Roncedo',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Biblioteca Roncedo',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#5B9BE5',
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
      <body className="h-full flex flex-col bg-[#EDF5FD] text-slate-900 font-sans antialiased selection:bg-roncedo-celeste selection:text-white">
        <AuthProvider>
          <LibrosProvider>
            <ServiceWorkerRegister />
            <Header />
            <div className="flex-1">
              {children}
            </div>
            <BottomNav />
            <BotonWhatsappFlotante />
          </LibrosProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

