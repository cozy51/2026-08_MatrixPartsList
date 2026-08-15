import type { Part, PartsList } from './types';

const natural = new Intl.Collator('ja', {
  numeric: true,
  sensitivity: 'base',
});

/**
 * PL columns in the reference workbook are ordered by PL number, rather than by
 * the order in which the browser happens to return selected files.
 */
export function sortPartsLists(lists: PartsList[]): PartsList[] {
  return [...lists].sort((a, b) =>
    natural.compare(a.plNo || a.fileName, b.plNo || b.fileName),
  );
}

/**
 * Match the workbook's primary sort: numeric balloons first in ascending order.
 * Returning zero for an equal balloon intentionally preserves first appearance
 * order within each balloon (Array#sort is stable in supported browsers).
 */
export function sortPartsByBalloon(parts: Part[]): Part[] {
  return parts
    .map((part, index) => ({ part, index }))
    .sort((a, b) => {
      const left = balloonRank(a.part.balloon);
      const right = balloonRank(b.part.balloon);
      if (left.group !== right.group) return left.group - right.group;
      if (left.group === 0 && left.value !== right.value) {
        return left.value - right.value;
      }
      if (left.group === 1) {
        const compared = natural.compare(a.part.balloon, b.part.balloon);
        if (compared) return compared;
      }
      return a.index - b.index;
    })
    .map(({ part }) => part);
}

function balloonRank(balloon: string): { group: number; value: number } {
  const value = Number(balloon.trim());
  if (balloon.trim() !== '' && Number.isFinite(value)) return { group: 0, value };
  if (balloon.trim() !== '') return { group: 1, value: 0 };
  return { group: 2, value: 0 };
}
