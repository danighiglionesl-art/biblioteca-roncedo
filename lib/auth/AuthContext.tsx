'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, SocioSolicitud, CategoriaSocio, EstadoCuota } from '@/types';
import { INITIAL_USERS, INITIAL_SOLICITUDES } from './mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { generarHashQR } from '@/lib/utils';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  solicitudes: SocioSolicitud[];
  allUsers: UserProfile[];
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (email: string, pass: string, nombre: string, apellido: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  submitSolicitudSocio: (datos: {
    dni: string;
    telefono: string;
    domicilio: string;
    localidad: string;
    codigo_postal?: string;
    fecha_nacimiento?: string;
    categoria: CategoriaSocio;
  }) => Promise<{ success: boolean; error?: string }>;
  aprobarSolicitud: (solicitudId: string, numeroSocio: string, categoria: CategoriaSocio) => Promise<void>;
  rechazarSolicitud: (solicitudId: string, notas?: string) => Promise<void>;
  actualizarEstadoCuota: (userId: string, nuevoEstado: EstadoCuota) => Promise<void>;
  actualizarSocioProtector: (userId: string, data: Partial<UserProfile>) => Promise<void>;
  switchUserRoleDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'roncedo_current_user_v4';
const STORAGE_KEY_USERS = 'roncedo_all_users_v4';
const STORAGE_KEY_SOLICITUDES = 'roncedo_solicitudes_v4';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [solicitudes, setSolicitudes] = useState<SocioSolicitud[]>(INITIAL_SOLICITUDES);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar estado desde LocalStorage (modo seguro de producción)
  useEffect(() => {
    try {
      // Limpiar versiones de caché anteriores que contenían Pedro González o datos demo
      ['roncedo_current_user_v2', 'roncedo_all_users_v2', 'roncedo_solicitudes_v2',
       'roncedo_current_user_v3', 'roncedo_all_users_v3', 'roncedo_solicitudes_v3',
       'roncedo_prestamos_v2', 'roncedo_prestamos_v3'].forEach((key) => {
        try { localStorage.removeItem(key); } catch {}
      });

      const storedUsers = localStorage.getItem(STORAGE_KEY_USERS);
      if (storedUsers) {
        setAllUsers(JSON.parse(storedUsers));
      } else {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
      }

      const storedSols = localStorage.getItem(STORAGE_KEY_SOLICITUDES);
      if (storedSols) {
        setSolicitudes(JSON.parse(storedSols));
      } else {
        localStorage.setItem(STORAGE_KEY_SOLICITUDES, JSON.stringify(INITIAL_SOLICITUDES));
      }

      const storedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        // Si en cache quedó Pedro González o cualquier usuario demo anterior, descartarlo
        if (
          parsed.id === 'user-socio-01' ||
          parsed.email === 'socio@bibliotecaroncedo.ar' ||
          parsed.nombre === 'Pedro' ||
          parsed.apellido === 'González'
        ) {
          localStorage.removeItem(STORAGE_KEY_USER);
          setUser(null);
        } else {
          setUser(parsed);
        }
      } else {
        // EN PRODUCCIÓN: Nadie está logueado por defecto. Debe ingresar por /login.
        setUser(null);
      }
    } catch (e) {
      console.error('Error cargando datos locales', e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Escuchar cambios de sesión de Supabase (especialmente para Google OAuth y callbacks)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const email = u.email || '';
        const fullName = meta.full_name || meta.name || '';
        const nameParts = fullName.split(' ');
        const nombre = nameParts[0] || email.split('@')[0] || 'Usuario';
        const apellido = nameParts.slice(1).join(' ') || '';

        // Si es el correo oficial de administración
        let role: UserRole = 'usuario';
        if (
          email.toLowerCase() === 'biblioroncedo@bibliotecaroncedo.ar' ||
          email.toLowerCase() === 'admin@bibliotecaroncedo.ar'
        ) {
          role = 'admin';
        }

        const oauthUser: UserProfile = {
          id: u.id,
          email,
          nombre,
          apellido,
          role,
          avatar_url: meta.avatar_url || meta.picture || '',
          created_at: u.created_at || new Date().toISOString(),
        };

        setUser((prev) => {
          if (prev && prev.email === email) {
            const merged = { ...prev, ...oauthUser };
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(merged));
            return merged;
          }
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(oauthUser));
          return oauthUser;
        });

        // Limpiar el access_token del hash y redirigir limpiamente a /home si es necesario
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname);
          if (window.location.pathname === '/' || window.location.pathname === '/login') {
            window.location.href = '/home';
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Guardar usuario actual cada vez que cambie
  const persistUser = (updatedUser: UserProfile | null) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  };

  // Guardar lista general de usuarios
  const persistAllUsers = (usersList: UserProfile[]) => {
    setAllUsers(usersList);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(usersList));
  };

  // Guardar lista de solicitudes
  const persistSolicitudes = (solsList: SocioSolicitud[]) => {
    setSolicitudes(solsList);
    localStorage.setItem(STORAGE_KEY_SOLICITUDES, JSON.stringify(solsList));
  };

  const loginWithEmail = async (emailOrUsername: string, pass: string) => {
    setIsLoading(true);
    try {
      const cleanInput = emailOrUsername.trim().toLowerCase();
      const cleanPass = pass.trim();

      // Autenticación Oficial del Administrador de la Biblioteca Roncedo
      const isAdminAccount =
        cleanInput === 'biblioteca-roncedo' ||
        cleanInput === 'biblioroncedo' ||
        cleanInput === 'biblioroncedo@bibliotecaroncedo.ar' ||
        cleanInput === 'admin@bibliotecaroncedo.ar';

      if (isAdminAccount) {
        const isPasswordCorrect =
          cleanPass === 'Biblioteca2026Roncedo' ||
          cleanPass === 'Roncedo-2026';

        if (!isPasswordCorrect) {
          return { success: false, error: 'Contraseña incorrecta para el usuario de Administración.' };
        }

        const adminUser: UserProfile = {
          id: 'user-admin-roncedo',
          username: 'biblioteca-roncedo',
          email: 'biblioroncedo@bibliotecaroncedo.ar',
          role: 'admin',
          nombre: 'Biblioteca',
          apellido: 'Roncedo',
          dni: '1926-RONCEDO',
          fecha_nacimiento: '1926-05-01',
          sexo: 'Prefiero no decirlo',
          telefono: '+54 9 3585 62-1547',
          whatsapp_codigo: '+54',
          whatsapp: '93585621547',
          pais: 'Argentina',
          provincia: 'Córdoba',
          localidad: 'Alcira Gigena',
          codigo_postal: '5811',
          barrio: 'Centro',
          calle: 'Belgrano',
          numero: '450',
          domicilio: 'Belgrano 450',
          observaciones: 'Cuenta Oficial de Administración de Biblioteca Roncedo.',
          avatar_url: '/images/escudo-roncedo.png',
          numero_socio: 'ADMIN-01',
          categoria_socio: 'Honorario',
          fecha_alta_socio: '1926-05-01',
          estado_cuota: 'al_dia',
          created_at: '1926-05-01T00:00:00Z',
        };

        const otherUsers = allUsers.filter(u => u.id !== 'user-admin-roncedo' && u.email !== 'admin@bibliotecaroncedo.ar');
        const updatedList = [adminUser, ...otherUsers];
        persistAllUsers(updatedList);
        persistUser(adminUser);
        return { success: true };
      }

      // Supabase Auth (si el socio o admin fue creado en Supabase Auth)
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: emailOrUsername,
            password: pass,
          });
          if (!error && data?.user) {
            const u = data.user;
            const meta = u.user_metadata || {};
            const email = u.email || '';
            const fullName = meta.full_name || meta.name || '';
            const nameParts = fullName.split(' ');
            const authUser: UserProfile = {
              id: u.id,
              email,
              nombre: nameParts[0] || email.split('@')[0] || 'Usuario',
              apellido: nameParts.slice(1).join(' ') || '',
              role: (email.toLowerCase().includes('admin') || email.toLowerCase().includes('biblioroncedo')) ? 'admin' : 'socio',
              avatar_url: meta.avatar_url || meta.picture || '',
              created_at: u.created_at || new Date().toISOString(),
            };
            persistUser(authUser);
            return { success: true };
          }
        } catch {
          // Continúa a verificar usuarios locales
        }
      }

      // Fallback local robusto (busca por email o username existente)
      const existingUser = allUsers.find(
        u => u.email.toLowerCase() === cleanInput || (u.username && u.username.toLowerCase() === cleanInput)
      );

      if (existingUser) {
        persistUser(existingUser);
        return { success: true };
      }

      // En producción: rechazar credenciales no registradas
      return {
        success: false,
        error: 'Credenciales no válidas. Verificá tu usuario y contraseña o regístrate.',
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al iniciar sesión' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/home`,
          },
        });
        if (error) throw error;
        return { success: true };
      }

      // Simulación inmediata de Google OAuth
      const googleUser: UserProfile = {
        id: `google-${Date.now()}`,
        email: 'usuario.google@gmail.com',
        nombre: 'Vecino',
        apellido: 'de Alcira Gigena',
        role: 'usuario',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        created_at: new Date().toISOString(),
      };

      const updatedList = [...allUsers, googleUser];
      persistAllUsers(updatedList);
      persistUser(googleUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error con Google' };
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, nombre: string, apellido: string) => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const existingUser = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (existingUser) {
        return { success: false, error: 'Ya existe una cuenta con este correo electrónico.' };
      }

      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        role: 'usuario',
        created_at: new Date().toISOString(),
      };

      const updatedList = [...allUsers, newUser];
      persistAllUsers(updatedList);
      persistUser(newUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al registrarse' };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.resetPasswordForEmail(email);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    persistUser(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return { success: false, error: 'No hay usuario autenticado' };
    const updated = { ...user, ...data };
    persistUser(updated);

    const updatedList = allUsers.map(u => u.id === user.id ? updated : u);
    persistAllUsers(updatedList);

    return { success: true };
  };

  const submitSolicitudSocio = async (datos: {
    dni: string;
    telefono: string;
    domicilio: string;
    localidad: string;
    codigo_postal?: string;
    fecha_nacimiento?: string;
    categoria: CategoriaSocio;
  }) => {
    if (!user) return { success: false, error: 'Debes iniciar sesión' };

    const nuevaSol: SocioSolicitud = {
      id: `sol-${Date.now()}`,
      user_id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      dni: datos.dni,
      telefono: datos.telefono,
      domicilio: datos.domicilio,
      localidad: datos.localidad,
      codigo_postal: datos.codigo_postal,
      fecha_nacimiento: datos.fecha_nacimiento,
      categoria_solicitada: datos.categoria,
      estado: 'pendiente',
      fecha_solicitud: new Date().toISOString(),
    };

    const newSols = [nuevaSol, ...solicitudes];
    persistSolicitudes(newSols);

    // Actualizar datos del perfil
    await updateProfile({
      dni: datos.dni,
      telefono: datos.telefono,
      domicilio: datos.domicilio,
      localidad: datos.localidad,
      codigo_postal: datos.codigo_postal,
      fecha_nacimiento: datos.fecha_nacimiento,
    });

    return { success: true };
  };

  const aprobarSolicitud = async (solicitudId: string, numeroSocio: string, categoria: CategoriaSocio) => {
    const sol = solicitudes.find(s => s.id === solicitudId);
    if (!sol) return;

    // Actualizar solicitud
    const updatedSols = solicitudes.map(s => 
      s.id === solicitudId ? { ...s, estado: 'aprobada' as const, fecha_resolucion: new Date().toISOString() } : s
    );
    persistSolicitudes(updatedSols);

    // Actualizar perfil de ese usuario a rol 'socio'
    const qrHash = generarHashQR({ id: sol.user_id, numero_socio: numeroSocio, dni: sol.dni });
    const updatedUsers = allUsers.map(u => {
      if (u.id === sol.user_id) {
        return {
          ...u,
          role: 'socio' as const,
          numero_socio: numeroSocio,
          categoria_socio: categoria,
          fecha_alta_socio: new Date().toISOString().split('T')[0],
          estado_cuota: 'al_dia' as const,
          qr_hash: qrHash,
        };
      }
      return u;
    });
    persistAllUsers(updatedUsers);

    // Si el usuario actual es el aprobado, actualizar su estado en vivo
    if (user && user.id === sol.user_id) {
      persistUser({
        ...user,
        role: 'socio',
        numero_socio: numeroSocio,
        categoria_socio: categoria,
        fecha_alta_socio: new Date().toISOString().split('T')[0],
        estado_cuota: 'al_dia',
        qr_hash: qrHash,
      });
    }
  };

  const rechazarSolicitud = async (solicitudId: string, notas?: string) => {
    const updatedSols = solicitudes.map(s => 
      s.id === solicitudId ? { ...s, estado: 'rechazada' as const, fecha_resolucion: new Date().toISOString(), notas_admin: notas } : s
    );
    persistSolicitudes(updatedSols);
  };

  const actualizarEstadoCuota = async (userId: string, nuevoEstado: EstadoCuota) => {
    const updatedUsers = allUsers.map(u => {
      if (u.id === userId) {
        return { ...u, estado_cuota: nuevoEstado };
      }
      return u;
    });
    persistAllUsers(updatedUsers);

    if (user && user.id === userId) {
      persistUser({ ...user, estado_cuota: nuevoEstado });
    }
  };

  const actualizarSocioProtector = async (userId: string, data: Partial<UserProfile>) => {
    const updatedUsers = allUsers.map(u => {
      if (u.id === userId) {
        return { ...u, ...data };
      }
      return u;
    });
    persistAllUsers(updatedUsers);

    if (user && user.id === userId) {
      persistUser({ ...user, ...data });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').update(data).eq('id', userId);
      } catch (err) {
        console.warn('Error sincronizando socio protector con Supabase:', err);
      }
    }
  };

  const switchUserRoleDemo = (role: UserRole) => {
    const sample = allUsers.find(u => u.role === role);
    if (sample) {
      persistUser(sample);
    } else if (user) {
      const updated = { ...user, role };
      persistUser(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSupabaseConnected: isSupabaseConfigured,
        solicitudes,
        allUsers,
        loginWithEmail,
        loginWithGoogle,
        registerWithEmail,
        resetPassword,
        logout,
        updateProfile,
        submitSolicitudSocio,
        aprobarSolicitud,
        rechazarSolicitud,
        actualizarEstadoCuota,
        actualizarSocioProtector,
        switchUserRoleDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
