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
    fecha_nacimiento?: string;
    categoria: CategoriaSocio;
  }) => Promise<{ success: boolean; error?: string }>;
  aprobarSolicitud: (solicitudId: string, numeroSocio: string, categoria: CategoriaSocio) => Promise<void>;
  rechazarSolicitud: (solicitudId: string, notas?: string) => Promise<void>;
  actualizarEstadoCuota: (userId: string, nuevoEstado: EstadoCuota) => Promise<void>;
  switchUserRoleDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'roncedo_current_user_v1';
const STORAGE_KEY_USERS = 'roncedo_all_users_v1';
const STORAGE_KEY_SOLICITUDES = 'roncedo_solicitudes_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [solicitudes, setSolicitudes] = useState<SocioSolicitud[]>(INITIAL_SOLICITUDES);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar estado desde LocalStorage si está en modo offline/preview
  useEffect(() => {
    try {
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
        setUser(JSON.parse(storedUser));
      } else {
        // Por defecto en la primera carga, usuario logueado como socio demo para explorar
        const defaultUser = INITIAL_USERS[1]; // Socio activo Pedro González
        setUser(defaultUser);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(defaultUser));
      }
    } catch (e) {
      console.error('Error cargando datos locales', e);
    } finally {
      setIsLoading(false);
    }
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

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        // En Supabase buscaríamos el profile en la tabla profiles
      }

      // Fallback local robusto
      const cleanEmail = email.trim().toLowerCase();
      const existingUser = allUsers.find(u => u.email.toLowerCase() === cleanEmail);

      if (existingUser) {
        persistUser(existingUser);
        return { success: true };
      }

      // Si no existe pero introdujo credenciales, creamos una sesión con rol 'usuario'
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        nombre: cleanEmail.split('@')[0],
        apellido: '',
        role: 'usuario',
        created_at: new Date().toISOString(),
      };

      const updatedList = [...allUsers, newUser];
      persistAllUsers(updatedList);
      persistUser(newUser);
      return { success: true };
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
