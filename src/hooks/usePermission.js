import { useAuth } from "./useAuth";
import { ROLE_PERMISSIONS } from "../config/permissions";

export function usePermission() {
  const { user } = useAuth();
  const role = user?.role ?? "";

  const can = permission => {
    const perms = ROLE_PERMISSIONS[role];
    if (!perms) return false;
    return perms.has("*") || perms.has(permission);
  };

  return { can, role };
}
