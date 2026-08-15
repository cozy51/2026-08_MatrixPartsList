import { describe, expect, it } from 'vitest';
import { sortPartsByBalloon, sortPartsLists } from './matrix';
import type { Part, PartsList } from './types';

const part = (balloon: string, partNo: string): Part => ({
  balloon,
  partNo,
  version: '-',
  quantity: '1',
  name: partNo,
  material: '',
  additionalInfo: '',
  unavailable: '',
  unitMass: '',
  specification: '',
});

const list = (plNo: string): PartsList => ({
  id: plNo,
  fileName: `${plNo}.csv`,
  plNo,
  plName: '',
  plVersion: '',
  parts: [],
  visible: true,
  importedAt: '',
});

describe('reference workbook ordering', () => {
  it('sorts numeric balloons and keeps first appearance within a balloon', () => {
    const sorted = sortPartsByBalloon([
      part('4', 'four'),
      part('3', 'three-a'),
      part('11', 'eleven'),
      part('1', 'one'),
      part('3', 'three-b'),
      part('C', 'note'),
    ]);
    expect(sorted.map(({ partNo }) => partNo)).toEqual([
      'one',
      'three-a',
      'three-b',
      'four',
      'eleven',
      'note',
    ]);
  });

  it('sorts PL columns naturally, independent of import order', () => {
    expect(sortPartsLists([list('HH110A0010'), list('HH11002010'), list('HH11001010')]).map(x => x.plNo)).toEqual([
      'HH11001010',
      'HH11002010',
      'HH110A0010',
    ]);
  });
});
