import { computed } from '@angular/core';
import {patchState, signalStoreFeature, type, withComputed, withMethods, withState} from '@ngrx/signals';
import { EntityId, EntityState } from '@ngrx/signals/entities';

type SelectedEntityState = { selectedEntityId: EntityId | null };

export function withSelectedEntity<Entity>() {
  return signalStoreFeature(
    { state: type<EntityState<Entity>>() },
    withState<SelectedEntityState>({ selectedEntityId: null }),
    withComputed(({ entityMap, selectedEntityId }) => ({
      selectedEntity: computed(() => {
        const selectedId = selectedEntityId();
        return selectedId ? entityMap()[selectedId] : null;
      }),
    })),
    withMethods((store) => ({
      selectEntity: (id: EntityId | null) => patchState(store, { selectedEntityId: id }),
    }))
  );
}
