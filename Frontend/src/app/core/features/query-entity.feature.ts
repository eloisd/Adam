import {signalStoreFeature, type, withComputed, withState} from '@ngrx/signals';
import {EntityState} from '@ngrx/signals/entities';
import {computed} from '@angular/core';
import {HttpParams} from '@angular/common/http';

type OrderDirection = 'ASC' | 'DESC';

export type PaginationParams<Entity> = {
  limit: number
  offset: number
  orderBy: keyof Entity
  orderDirection: OrderDirection
};

export type ResultsPagination<Entity> = {
  items: Entity[]
  total: number
}

type QueryPaginationEntityState<Entity> = {
  query: Partial<PaginationParams<Entity>>
  total: number
}

export function withQueryPaginationEntity<Entity>(query: Partial<PaginationParams<Entity>>) {
  return signalStoreFeature(
    { state: type<EntityState<Entity>>() },
    withState<QueryPaginationEntityState<Entity>>({
      query: {
        limit: query.limit,
        offset: query.offset,
        orderBy: query.orderBy,
        orderDirection: query.orderDirection,
      },
      total: 0,
    }),
    withComputed((store) => ({
      hasMore: computed(() => store.total() > store.ids().length),
      size: computed(() => store.ids().length),
    }))
  );
}

export function setHttpParamsQuery<Entity>(query: Partial<PaginationParams<Entity>>): Record<string, string | number | boolean> {
  const { limit, offset, orderBy, orderDirection } = query;

  const params: Record<string, string | number | boolean> = {};

  if (limit !== undefined) {
    params['limit'] = limit;
  }

  if (offset !== undefined) {
    params['offset'] = offset;
  }

  if (orderBy !== undefined) {
    params['orderBy'] = orderBy.toString();
  }

  if (orderDirection !== undefined) {
    params['orderDirection'] = orderDirection;
  }

  return params;
}

export function setQueryTotal(total: number) {
  return {
    total: total
  }
}

export function setQueryParams<Entity>(query: Partial<PaginationParams<Entity>>) {
  return {
    query: query
  }
}
