import { Injectable, CanActivate, ExecutionContext, ForbiddenException, } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from './roles.decorator';
import { Request } from 'express';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}


  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; 
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Недостатньо прав');
    }

    return true;
  }
}
