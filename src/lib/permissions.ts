export const roles = ["customer", "operator", "admin", "owner"] as const;
export type Role = (typeof roles)[number];

const access: Record<Role, readonly string[]> = {
  customer: ["booking:create", "booking:own", "payment:own", "ticket:own", "profile:update"],
  operator: ["booking:create", "booking:read", "payment:read", "manifest:read", "ticket:checkin"],
  admin: ["booking:create", "booking:read", "payment:read", "manifest:read", "ticket:checkin", "master:write", "user:manage", "report:read", "settings:write"],
  owner: ["booking:read", "payment:read", "manifest:read", "master:read", "report:read"],
};

export function can(role: Role, permission: string) {
  return access[role]?.includes(permission) ?? false;
}

export function canAccessBooking(role: Role, sessionUserId: string, bookingUserId: string) {
  if (role === "customer") return sessionUserId === bookingUserId;
  return role === "operator" || role === "admin" || role === "owner";
}
