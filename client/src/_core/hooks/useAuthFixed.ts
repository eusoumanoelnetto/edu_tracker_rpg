import { useDemoData } from "@/contexts/DemoContext";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { isDemoMode, demoUser } = useDemoData();
  
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();

  // Se estiver em modo demo, retornar dados mockados
  if (isDemoMode) {
    return {
      user: demoUser,
      loading: false,
      error: null,
      isAuthenticated: true,
      refresh: () => Promise.resolve({ data: demoUser }),
      logout: async () => {
        // Em modo demo, não fazer nada
        console.log('[useAuth] Demo mode - logout disabled');
      },
    };
  }

  // Verificar se acabamos de fazer login
  const justLoggedIn = typeof window !== 'undefined' && sessionStorage.getItem('just_logged_in') === 'true';
  if (justLoggedIn) {
    sessionStorage.removeItem('just_logged_in');
    console.log('[useAuth] Just logged in, will refetch auth state');
  }

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
    // Se acabou de fazer login, forçar refetch imediatamente
    refetchOnMount: justLoggedIn ? 'always' : false,
    enabled: true,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  // Log para debug e prefetch de dados
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('app_session_id') : null;
    console.log('[useAuth] State:', {
      hasToken: !!token,
      isLoading: meQuery.isLoading,
      hasData: !!meQuery.data,
      error: meQuery.error?.message,
      isAuthenticated: Boolean(meQuery.data)
    });

    // Prefetch dados importantes quando usuário estiver autenticado
    if (meQuery.data && !meQuery.isLoading) {
      console.log('[useAuth] Prefetching course and achievement data...');
      utils.courses.list.prefetch();
      utils.achievements.list.prefetch();
    }
  }, [meQuery.isLoading, meQuery.data, meQuery.error, utils]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      // Clear localStorage token
      localStorage.removeItem('app_session_id');
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        "manus-runtime-user-info",
        JSON.stringify(meQuery.data)
      );
    }
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}