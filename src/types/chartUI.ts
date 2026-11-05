import type { StarPlacement, Palace } from '../engine/types.js';

export interface StarVisibilityFilters {
  main: boolean;
  secondary: boolean;
  transformation: boolean;
  annual: boolean;
}

export type RelationType = 'selected' | 'opposite' | 'trine' | 'harmonic' | 'none';

export interface PalaceRelationMap {
  [branch: number]: RelationType;
}

/**
 * Tính các cung Tam Phương Tứ Chính:
 * - Đối cung (xung chiếu): (branch + 6) % 12
 * - Tam hợp 1: (branch + 4) % 12
 * - Tam hợp 2: (branch + 8) % 12
 * - Nhị hợp (Lục hợp): phụ thuộc cặp địa chi
 */
export function getPalaceRelations(selectedBranch: number | null): PalaceRelationMap {
  if (selectedBranch === null) return {};

  const map: PalaceRelationMap = {};
  for (let i = 0; i < 12; i++) {
    map[i] = 'none';
  }

  map[selectedBranch] = 'selected';

  const opposite = (selectedBranch + 6) % 12;
  map[opposite] = 'opposite';

  const trine1 = (selectedBranch + 4) % 12;
  const trine2 = (selectedBranch + 8) % 12;
  map[trine1] = 'trine';
  map[trine2] = 'trine';

  return map;
}
