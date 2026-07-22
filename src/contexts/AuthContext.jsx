import { createContext, useContext, useEffect, useState } from "react";
import {
  ADMIN_EMAIL,
  getStoredSession,
  loginWithEmail as svcLoginWithEmail,
  loginWithGoogle as svcLoginWithGoogle,
  logout as svcLogout,
  signUp as svcSignUp,
  updateCurrentUser,
} from "@/services/auth";

const AuthCtx = createContext({
  user: null,
  loading: true,
  isAdmin: false,
  loginWithEmail: async () => ({ session: null, error: "not-ready" }),
  loginWithGoogle: async () => ({ session: null, error: "not-ready" }),
  signUp: async () => ({ session: null, error: "not-ready" }),
  signOut: async () => {},
  updateProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hidrata a sessão a partir do localStorage (somente no cliente).
  useEffect(() => {
    const session = getStoredSession();
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  const loginWithEmail = async (credentials) => {
    const result = await svcLoginWithEmail(credentials);
    if (result.session) setUser(result.session.user);
    return result;
  };

  const loginWithGoogle = async () => {
    const result = await svcLoginWithGoogle();
    if (result.session) setUser(result.session.user);
    return result;
  };

  const signUp = async (data) => {
    const result = await svcSignUp(data);
    if (result.session) setUser(result.session.user);
    return result;
  };

  const signOut = async () => {
    await svcLogout();
    setUser(null);
  };

  const updateProfile = async (patch) => {
    const session = await updateCurrentUser(patch);
    if (session) setUser(session.user);
  };

  const isAdmin =
    user?.role === "admin" ||
    (!!user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  return (
    <AuthCtx.Provider
      value={{
        user,
        loading,
        isAdmin,
        loginWithEmail,
        loginWithGoogle,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
export { ADMIN_EMAIL };
