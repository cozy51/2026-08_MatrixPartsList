import { describe, expect, it } from 'vitest';
import { buildMachinePartsListRows } from './DashboardView';
import { MACHINES } from './plModes';
import type { PartsList } from './types';

const list = (id: string, machineId: string, modeId: string, plNo: string, plName: string, note = ''): PartsList => ({
  id, machineId, modeId, plNo, plName, note, plVersion: '02', fileName: `${plNo}.csv`, parts: [], visible: true, importedAt: '',
});

describe('dashboard Excel rows', () => {
  it('exports only the selected machine and orders rows by unit then PL number', () => {
    const src350 = MACHINES.find(machine => machine.id === 'SRC350')!;
    const rows = buildMachinePartsListRows(src350, [
      list('3', 'HU300', '01', 'HU1', 'HU HOIST'),
      list('2', 'SRC350', '02', 'PL10', 'STEERING 10'),
      list('1', 'SRC350', '01', 'PL2', 'DRIVE 2', '要確認'),
    ]);
    expect(rows).toEqual([
      { ユニット名: '01 DRIVE GEAR BOX', PL: 'PL2', PL名称: 'DRIVE 2', 'PL Ver.': '02', 備考: '要確認' },
      { ユニット名: '02 STEERING UNIT(R)', PL: 'PL10', PL名称: 'STEERING 10', 'PL Ver.': '02', 備考: '' },
    ]);
  });
});
