import { CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

export function PermissionGuard(resource: string, action: string): any {
  return class implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      let userPermissions = user?.permissions;
      if (typeof userPermissions === 'string') {
        try { userPermissions = JSON.parse(userPermissions); } catch { userPermissions = []; }
      }
      if (Array.isArray(userPermissions) && userPermissions.includes('*')) return true;
      const requiredPermission = `${resource}:${action}`;
      if (!userPermissions || !userPermissions.includes(requiredPermission)) {
        throw new ForbiddenException({
          error: 'Acesso negado',
          requiredPermission,
          userPermissions
        });
      }
      return true;
    }
  };
} 