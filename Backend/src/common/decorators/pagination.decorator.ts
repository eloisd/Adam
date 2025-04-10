import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface PaginationParams {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export const QueryPagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationParams => {
    const request: Request = ctx.switchToHttp().getRequest();

    const rawLimit = request.query.limit;
    const rawOffset = request.query.offset;
    const rawOrderBy = request.query.orderBy;
    const rawOrderDirection = request.query.orderDirection;

    const limit = rawLimit && !isNaN(Number(rawLimit)) ? Math.min(Math.max(1, Number(rawLimit)), 100) : undefined;
    const offset = rawOffset && !isNaN(Number(rawOffset)) ? Math.max(0, Number(rawOffset)) : undefined;

    const orderBy = typeof rawOrderBy === 'string' ? rawOrderBy : undefined;
    const orderDirection = rawOrderDirection === 'ASC' || rawOrderDirection === 'DESC' ? rawOrderDirection : undefined;

    return { limit, offset, orderBy, orderDirection };
  },
);