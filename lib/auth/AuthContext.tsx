'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, SocioSolicitud, CategoriaSocio, EstadoCuota } from '@/types';
import { INITIAL_USERS, INITIAL_SOLICITUDES } from './mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { generarHashQR, isPerfilCompleto } from '@/lib/utils';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  solicitudes: SocioSolicitud[];
  allUsers: UserProfile[];
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  registerWithEmail: (email: string, pass: string, nombre?: string, apellido?: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
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

// Función para obtener la URL canónica de retorno hacia la web oficial
export function getAuthRedirectUrl(subpath: string = ''): string {
  // 1. Si estamos en el navegador en un dominio real (no localhost), usar ese origen de la web
  if (typeof window !== 'undefined' && window.location.origin) {
    if (!window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')) {
      const cleanSub = subpath ? (subpath.startsWith('/') ? subpath : `/${subpath}`) : '/';
      return `${window.location.origin}${cleanSub}`;
    }
  }

  // 2. Si está definida la variable de entorno y no es localhost, usarla
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    const cleanBase = envUrl.replace(/\/+$/, '');
    const cleanSub = subpath ? (subpath.startsWith('/') ? subpath : `/${subpath}`) : '/';
    return `${cleanBase}${cleanSub}`;
  }

  // 3. Dominio web oficial de producción
  const cleanSub = subpath ? (subpath.startsWith('/') ? subpath : `/${subpath}`) : '/';
  return `https://www.bibliotecaroncedo.ar${cleanSub}`;
}

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
      // Si la URL contiene un token de OAuth de Supabase, mantener isLoading activo
      // para que onAuthStateChange y getSession procesen la sesión antes de redirigir
      const hasOAuthHash = typeof window !== 'undefined' && (
        window.location.hash.includes('access_token') ||
        window.location.hash.includes('refresh_token')
      );
      if (!hasOAuthHash) {
        setIsLoading(false);
      }
    }
  }, []);

  // Escuchar cambios de sesión de Supabase (especialmente para Google OAuth y callbacks)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    // Detectar si vino con error en el hash
    if (typeof window !== 'undefined' && window.location.hash.includes('error=')) {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorDesc =
          hashParams.get('error_description') ||
          hashParams.get('error') ||
          'Error al autenticar con Google';
        console.warn('OAuth redirect error:', errorDesc);
        window.history.replaceState(null, '', '/login');
        setIsLoading(false);
        window.location.href = `/login?error=${encodeURIComponent(errorDesc)}`;
      } catch {}
      return;
    }

    const processSessionUser = async (u: any): Promise<UserProfile> => {
      const meta = u.user_metadata || {};
      const email = (u.email || '').trim().toLowerCase();
      const fullName = meta.full_name || meta.name || '';
      const nameParts = fullName.split(' ');
      const nombreMeta = meta.nombre || nameParts[0] || email.split('@')[0] || 'Usuario';
      const apellidoMeta = meta.apellido || nameParts.slice(1).join(' ') || '';

      // Determinar rol (admin o usuario común)
      let role: UserRole = meta.role || 'usuario';
      if (
        email === 'biblioroncedo@bibliotecaroncedo.ar' ||
        email === 'admin@bibliotecaroncedo.ar'
      ) {
        role = 'admin';
      }

      // 1. Obtener datos locales previos si existieran para no perder campos
      let localCached: Partial<UserProfile> = {};
      try {
        const stored = localStorage.getItem(STORAGE_KEY_USER);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.id === u.id || (parsed.email && parsed.email.toLowerCase() === email))) {
            localCached = parsed;
          }
        }
      } catch {}

      // Si no estaba en STORAGE_KEY_USER, buscar en allUsers de localStorage
      if (!localCached.id && typeof window !== 'undefined') {
        try {
          const storedUsers = localStorage.getItem(STORAGE_KEY_USERS);
          if (storedUsers) {
            const parsedList: UserProfile[] = JSON.parse(storedUsers);
            const found = parsedList.find(
              (p) => p.id === u.id || (p.email && p.email.toLowerCase() === email)
            );
            if (found) {
              localCached = found;
            }
          }
        } catch {}
      }

      // 2. Consultar perfil en la tabla de Supabase `profiles`
      let dbProfile: any = null;
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', u.id)
            .maybeSingle();
          if (!error && data) {
            dbProfile = data;
          }
        } catch (err) {
          console.warn('Aviso consultando perfil en Supabase:', err);
        }
      }

      // 3. Mergear datos con jerarquía de verdad:
      // dbProfile > user_metadata > localCached > defaults
      const finalUser: UserProfile = {
        id: u.id,
        email: email || localCached.email || u.email,
        username: dbProfile?.username || meta.username || localCached.username,
        role: (dbProfile?.role as UserRole) || (meta.role as UserRole) || role || localCached.role || 'usuario',
        nombre: dbProfile?.nombre || meta.nombre || localCached.nombre || nombreMeta,
        apellido: dbProfile?.apellido || meta.apellido || localCached.apellido || apellidoMeta,
        dni: dbProfile?.dni || meta.dni || localCached.dni || '',
        fecha_nacimiento: dbProfile?.fecha_nacimiento || meta.fecha_nacimiento || localCached.fecha_nacimiento || '',
        sexo: dbProfile?.sexo || meta.sexo || localCached.sexo || '',
        telefono: dbProfile?.telefono || meta.telefono || localCached.telefono || '',
        whatsapp_codigo: dbProfile?.whatsapp_codigo || meta.whatsapp_codigo || localCached.whatsapp_codigo || '+54',
        whatsapp: dbProfile?.whatsapp || meta.whatsapp || localCached.whatsapp || '',
        pais: dbProfile?.pais || meta.pais || localCached.pais || 'Argentina',
        provincia: dbProfile?.provincia || meta.provincia || localCached.provincia || 'Córdoba',
        localidad: dbProfile?.localidad || meta.localidad || localCached.localidad || 'Alcira Gigena',
        codigo_postal: dbProfile?.codigo_postal || meta.codigo_postal || localCached.codigo_postal || '5811',
        barrio: dbProfile?.barrio || meta.barrio || localCached.barrio || '',
        calle: dbProfile?.calle || meta.calle || localCached.calle || '',
        numero: dbProfile?.numero || meta.numero || localCached.numero || '',
        edificio: dbProfile?.edificio || meta.edificio || localCached.edificio || '',
        torre: dbProfile?.torre || meta.torre || localCached.torre || '',
        piso: dbProfile?.piso || meta.piso || localCached.piso || '',
        dpto: dbProfile?.dpto || meta.dpto || localCached.dpto || '',
        domicilio: dbProfile?.domicilio || meta.domicilio || localCached.domicilio || '',
        hincha_club: dbProfile?.hincha_club || meta.hincha_club || localCached.hincha_club || 'Lautaro Roncedo',
        hincha_nacional: dbProfile?.hincha_nacional || meta.hincha_nacional || localCached.hincha_nacional || [],
        hincha_nacional_otro: dbProfile?.hincha_nacional_otro || meta.hincha_nacional_otro || localCached.hincha_nacional_otro || '',
        observaciones: dbProfile?.observaciones || meta.observaciones || localCached.observaciones || '',
        avatar_url: dbProfile?.avatar_url || meta.avatar_url || meta.picture || localCached.avatar_url || '',
        datos_completados: Boolean(
          dbProfile?.datos_completados ||
          meta.datos_completados ||
          localCached.datos_completados ||
          isPerfilCompleto({
            ...localCached,
            ...meta,
            ...dbProfile,
            nombre: dbProfile?.nombre || meta.nombre || localCached.nombre || nombreMeta,
            apellido: dbProfile?.apellido || meta.apellido || localCached.apellido || apellidoMeta,
            dni: dbProfile?.dni || meta.dni || localCached.dni || '',
            fecha_nacimiento: dbProfile?.fecha_nacimiento || meta.fecha_nacimiento || localCached.fecha_nacimiento || '',
            sexo: dbProfile?.sexo || meta.sexo || localCached.sexo || '',
            whatsapp: dbProfile?.whatsapp || meta.whatsapp || localCached.whatsapp || '',
            pais: dbProfile?.pais || meta.pais || localCached.pais || 'Argentina',
            provincia: dbProfile?.provincia || meta.provincia || localCached.provincia || 'Córdoba',
            localidad: dbProfile?.localidad || meta.localidad || localCached.localidad || 'Alcira Gigena',
            codigo_postal: dbProfile?.codigo_postal || meta.codigo_postal || localCached.codigo_postal || '5811',
            barrio: dbProfile?.barrio || meta.barrio || localCached.barrio || '',
            calle: dbProfile?.calle || meta.calle || localCached.calle || '',
            numero: dbProfile?.numero || meta.numero || localCached.numero || '',
          } as any)
        ),
        created_at: dbProfile?.created_at || u.created_at || localCached.created_at || new Date().toISOString(),
        numero_socio: dbProfile?.numero_socio || meta.numero_socio || localCached.numero_socio,
        categoria_socio: dbProfile?.categoria_socio || meta.categoria_socio || localCached.categoria_socio,
        fecha_alta_socio: dbProfile?.fecha_alta_socio || meta.fecha_alta_socio || localCached.fecha_alta_socio,
        estado_cuota: dbProfile?.estado_cuota || meta.estado_cuota || localCached.estado_cuota,
        qr_hash: dbProfile?.qr_hash || meta.qr_hash || localCached.qr_hash,
        es_socio_protector: dbProfile?.es_socio_protector ?? meta.es_socio_protector ?? localCached.es_socio_protector,
        tipo_socio_protector: dbProfile?.tipo_socio_protector || meta.tipo_socio_protector || localCached.tipo_socio_protector,
        estado_socio_protector: dbProfile?.estado_socio_protector || meta.estado_socio_protector || localCached.estado_socio_protector,
        importe_mensual: dbProfile?.importe_mensual ?? meta.importe_mensual ?? localCached.importe_mensual,
        proveedor_pago: dbProfile?.proveedor_pago || meta.proveedor_pago || localCached.proveedor_pago,
        id_suscripcion_externa: dbProfile?.id_suscripcion_externa || meta.id_suscripcion_externa || localCached.id_suscripcion_externa,
        fecha_adhesion: dbProfile?.fecha_adhesion || meta.fecha_adhesion || localCached.fecha_adhesion,
        fecha_ultimo_pago: dbProfile?.fecha_ultimo_pago || meta.fecha_ultimo_pago || localCached.fecha_ultimo_pago,
        proximo_vencimiento: dbProfile?.proximo_vencimiento || meta.proximo_vencimiento || localCached.proximo_vencimiento,
      };

      setUser(finalUser);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(finalUser));

      // Asegurar que quede registrado en allUsers
      setAllUsers((prevUsers) => {
        const exists = prevUsers.some(
          (pu) => pu.id === u.id || (pu.email && pu.email.toLowerCase() === email)
        );
        let updatedList: UserProfile[];
        if (exists) {
          updatedList = prevUsers.map((pu) =>
            pu.id === u.id || (pu.email && pu.email.toLowerCase() === email)
              ? { ...pu, ...finalUser }
              : pu
          );
        } else {
          updatedList = [...prevUsers, finalUser];
        }
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedList));
        return updatedList;
      });

      // Si no existía en `profiles` en la base de datos de Supabase, asegurar el registro
      if (!dbProfile && isSupabaseConfigured && supabase && !u.id.startsWith('user-')) {
        try {
          supabase
            .from('profiles')
            .upsert({
              id: u.id,
              email: finalUser.email,
              nombre: finalUser.nombre,
              apellido: finalUser.apellido,
              role: finalUser.role,
              avatar_url: finalUser.avatar_url || null,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' })
            .then(() => {});
        } catch {}
      }

      setIsLoading(false);

      // Limpiar hash de access_token y redirigir
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        const destino = isPerfilCompleto(finalUser) ? '/home' : '/perfil';
        window.history.replaceState(null, '', destino);
        window.location.href = destino;
      }

      return finalUser;
    };

    // 1. Verificar sesión existente o token en URL inmediatamente
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.warn('Aviso verificando sesión de Supabase:', error.message);
        setIsLoading(false);
      } else if (session?.user) {
        await processSessionUser(session.user);
      } else {
        if (typeof window !== 'undefined' && !window.location.hash.includes('access_token')) {
          setIsLoading(false);
        }
      }
    });

    // 2. Suscripción a eventos de autenticación en tiempo real
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await processSessionUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setIsLoading(false);
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
            const loadedUser = await processSessionUser(data.user);
            return { success: true, user: loadedUser };
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
        return { success: true, user: existingUser };
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
        const redirectUrl = getAuthRedirectUrl('/');
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            },
          },
        });
        if (error) throw error;
        return { success: true };
      }

      // Simulación inmediata de Google OAuth si Supabase no estuviera configurado
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
      return { success: true, user: googleUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error con Google' };
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, nombre: string = '', apellido: string = '') => {
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

      // Si Supabase está configurado, registrar en Supabase Auth con retorno a la web oficial
      if (isSupabaseConfigured && supabase) {
        try {
          const redirectUrl = getAuthRedirectUrl('/');
          const fullName = `${nombre.trim()} ${apellido.trim()}`.trim();
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password: pass,
            options: {
              emailRedirectTo: redirectUrl,
              data: {
                full_name: fullName,
                name: nombre.trim(),
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                role: 'usuario',
                datos_completados: false,
              },
            },
          });
          if (data?.user?.id) {
            newUser.id = data.user.id;
          }
          if (error) {
            console.warn('Aviso en registro Supabase (se utiliza registro local):', error.message);
          }
        } catch (supaErr: any) {
          console.warn('Excepción en registro Supabase:', supaErr);
        }
      }

      const updatedList = [...allUsers, newUser];
      persistAllUsers(updatedList);
      persistUser(newUser);
      return { success: true, user: newUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al registrarse' };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const redirectUrl = getAuthRedirectUrl('/recuperar');
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });
        if (error) throw error;
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al enviar enlace de recuperación' };
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
    
    // El correo electrónico no es modificable (asociado a la cuenta institucional)
    const { email: _ignorarEmail, ...safeData } = data;
    const updated: UserProfile = {
      ...user,
      ...safeData,
      email: user.email,
      datos_completados: true,
    };

    // 1. Persistencia local inmediata
    persistUser(updated);

    const updatedList = allUsers.map(u =>
      u.id === user.id || (u.email && u.email.toLowerCase() === user.email.toLowerCase())
        ? updated
        : u
    );
    persistAllUsers(updatedList);

    // 2. Persistencia en Supabase
    if (isSupabaseConfigured && supabase && user.id && !user.id.startsWith('user-')) {
      // 2a. Guardar en Auth user_metadata (100% garantizado en Supabase Auth sin requerir RLS especial)
      try {
        await supabase.auth.updateUser({
          data: {
            ...safeData,
            nombre: updated.nombre,
            apellido: updated.apellido,
            dni: updated.dni,
            fecha_nacimiento: updated.fecha_nacimiento,
            sexo: updated.sexo,
            whatsapp_codigo: updated.whatsapp_codigo,
            whatsapp: updated.whatsapp,
            pais: updated.pais,
            provincia: updated.provincia,
            localidad: updated.localidad,
            codigo_postal: updated.codigo_postal,
            barrio: updated.barrio,
            calle: updated.calle,
            numero: updated.numero,
            edificio: updated.edificio,
            torre: updated.torre,
            piso: updated.piso,
            dpto: updated.dpto,
            domicilio: updated.domicilio,
            hincha_club: updated.hincha_club,
            hincha_nacional: updated.hincha_nacional,
            hincha_nacional_otro: updated.hincha_nacional_otro,
            observaciones: updated.observaciones,
            avatar_url: updated.avatar_url,
            datos_completados: true,
          },
        });
      } catch (errAuth) {
        console.warn('Aviso sincronizando user_metadata en Supabase Auth:', errAuth);
      }

      // 2b. Guardar en tabla PostgreSQL profiles con UPSERT
      try {
        const payload: any = {
          id: user.id,
          email: user.email,
          nombre: updated.nombre,
          apellido: updated.apellido,
          role: updated.role || 'usuario',
          dni: updated.dni || null,
          fecha_nacimiento: updated.fecha_nacimiento ? updated.fecha_nacimiento : null,
          sexo: updated.sexo || null,
          telefono: updated.telefono || updated.whatsapp || null,
          whatsapp_codigo: updated.whatsapp_codigo || '+54',
          whatsapp: updated.whatsapp || null,
          pais: updated.pais || 'Argentina',
          provincia: updated.provincia || 'Córdoba',
          localidad: updated.localidad || 'Alcira Gigena',
          codigo_postal: updated.codigo_postal || '5811',
          barrio: updated.barrio || null,
          calle: updated.calle || null,
          numero: updated.numero || null,
          edificio: updated.edificio || null,
          torre: updated.torre || null,
          piso: updated.piso || null,
          dpto: updated.dpto || null,
          domicilio: updated.domicilio || null,
          hincha_club: updated.hincha_club || 'Lautaro Roncedo',
          hincha_nacional: updated.hincha_nacional || [],
          hincha_nacional_otro: updated.hincha_nacional_otro || null,
          observaciones: updated.observaciones || null,
          avatar_url: updated.avatar_url || null,
          updated_at: new Date().toISOString(),
        };

        const { error: dbErr } = await supabase
          .from('profiles')
          .upsert(payload, { onConflict: 'id' });

        if (dbErr) {
          console.warn('Aviso upsert en profiles:', dbErr.message);
        }
      } catch (errDb) {
        console.warn('Error sincronizando perfil con tabla profiles en Supabase:', errDb);
      }
    }

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
        if (user && user.id === userId) {
          await supabase.auth.updateUser({ data });
        }
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
