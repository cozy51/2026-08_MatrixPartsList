import { describe, expect, it } from 'vitest';
import { buildBalloonGroups, collectPartsInSourceOrder, isStandardPl, sortPartsByBalloon, sortPartsLists } from './matrix';
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
  modeId: '01',
  parts: [],
  visible: true,
  importedAt: '',
});

describe('reference workbook ordering', () => {
  it('identifies HH1 prefixes as standard PLs', () => {
    expect(isStandardPl('HH11000010')).toBe(true);
    expect(isStandardPl('hh110A0010')).toBe(true);
    expect(isStandardPl('HH3101K810')).toBe(false);
  });
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

  it('marks balloon group boundaries for row styling', () => {
    const parts = [part('1', 'a'), part('1', 'b'), part('2', 'c'), part('3', 'd')];
    expect(buildBalloonGroups(parts)).toEqual([
      { index: 0, start: true },
      { index: 0, start: false },
      { index: 1, start: true },
      { index: 2, start: true },
    ]);
  });

  it('keeps supplements separate by balloon and preserves source-list order', () => {
    const first = list('HH110A0010');
    first.parts = [part('2', 'ring'), part('1', '+')];
    const second = list('HH11000010');
    second.parts = [part('1', 'block'), part('2', '+')];
    expect(collectPartsInSourceOrder([first, second]).map(({ balloon, partNo }) => `${balloon}:${partNo}`)).toEqual([
      '1:+', '1:block', '2:ring', '2:+',
    ]);
  });

  it('sorts PL columns naturally, independent of import order', () => {
    expect(sortPartsLists([list('HH3101K810'), list('HH110A0010'), list('HH11002010'), list('HH11000010'), list('HH11001010')]).map(x => x.plNo)).toEqual([
      'HH11000010',
      'HH11001010',
      'HH11002010',
      'HH110A0010',
      'HH3101K810',
    ]);
  });
});
