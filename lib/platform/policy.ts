export const environments = ["local", "staging", "production"] as const;
export type Environment = (typeof environments)[number];
export const roles = [
  "elevate_owner",
  "elevate_admin",
  "business_owner",
  "business_admin",
  "business_member",
] as const;
export type Role = (typeof roles)[number];
export const permissions = [
  "read:business",
  "read:customers",
  "read:leads",
  "read:submissions",
  "create:submission",
  "read:activity",
  "read:change-requests",
  "create:change-request",
  "manage:change-requests",
  "read:billing",
  "manage:team",
  "manage:integrations",
  "read:public-config",
] as const;
export type Permission = (typeof permissions)[number];

const operational: readonly Permission[] = [
  "read:business",
  "read:customers",
  "read:leads",
  "read:submissions",
  "read:activity",
  "read:change-requests",
  "create:change-request",
  "read:public-config",
];
const rolePermissions: Record<Role, readonly Permission[]> = {
  elevate_owner: permissions,
  elevate_admin: permissions.filter((permission) => permission !== "manage:team"),
  business_owner: [...operational, "read:billing", "manage:team", "manage:integrations"],
  business_admin: [...operational, "manage:integrations"],
  business_member: operational.filter((permission) => permission !== "create:change-request"),
};

export class PlatformError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "PlatformError";
  }
}

export function environment(value: unknown): Environment {
  if (!environments.includes(value as Environment))
    throw new PlatformError(503, "NOT_CONFIGURED", "Platform environment is unavailable.");
  return value as Environment;
}

export function uuid(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  ) {
    throw new PlatformError(400, "INVALID_ID", "A valid resource ID is required.");
  }
  return value.toLowerCase();
}

export type Membership = {
  userId: string;
  businessId: string;
  role: Role;
  active: boolean;
  businessActive: boolean;
};
export type Context = {
  businessId: string;
  environment: Environment;
  actorId: string;
  actorType: "user" | "credential";
  permissions: readonly Permission[];
};

// Identity must already be verified with the authentication provider by the caller.
export function memberContext(
  userId: string,
  businessId: string,
  selectedEnvironment: Environment,
  membership: Membership | null,
): Context {
  const id = uuid(businessId);
  if (
    !membership ||
    !membership.active ||
    !membership.businessActive ||
    membership.userId !== userId ||
    membership.businessId !== id ||
    !roles.includes(membership.role)
  ) {
    throw new PlatformError(403, "ACCESS_DENIED", "Access to this business is denied.");
  }
  return {
    businessId: id,
    environment: environment(selectedEnvironment),
    actorId: userId,
    actorType: "user",
    permissions: rolePermissions[membership.role],
  };
}

export function authorize(context: Context, permission: Permission) {
  if (!context.permissions.includes(permission))
    throw new PlatformError(403, "ACCESS_DENIED", "This action is not permitted.");
}

export function assertOwnership(
  context: Context,
  resource: { businessId: string; environment: Environment } | null,
) {
  if (
    !resource ||
    resource.businessId !== context.businessId ||
    resource.environment !== context.environment
  ) {
    throw new PlatformError(404, "NOT_FOUND", "The resource was not found.");
  }
}
