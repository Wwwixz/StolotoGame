import { createContext, useContext, useState, type ReactNode } from "react";

export type Role = "user" | "admin" | null;

const ROLE_KEY = "stoloto-role";

const RoleCtx = createContext<{ role: Role; setRole: (r: Role) => void }>({
  role: null,
  setRole: () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    const saved = localStorage.getItem(ROLE_KEY);
    return saved === "user" || saved === "admin" ? saved : null;
  });

  const setRole = (r: Role) => {
    setRoleState(r);
    if (r) localStorage.setItem(ROLE_KEY, r);
    else localStorage.removeItem(ROLE_KEY);
  };

  return <RoleCtx.Provider value={{ role, setRole }}>{children}</RoleCtx.Provider>;
}

export const useRole = () => useContext(RoleCtx);
