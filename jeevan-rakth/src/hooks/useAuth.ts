import { useAuthContext } from "@/context/AuthContext";

export function useAuth() {
  const { user, login, signup, logout, isLoading } = useAuthContext();

  return {
    isAuthenticated: !!user,
    user,
    login,
    signup,
    logout,
    isLoading,
  };
}
