import { describe, expect, it } from 'vitest';
import { inferMachine, inferPlMode, MACHINES, PL_MODES, plModeLabel, plModesForMachine } from './plModes';

describe('PL display modes', () => {
  it('contains the 27 supported modes', () => {
    expect(PL_MODES).toHaveLength(27);
    expect(plModeLabel('SRC350', '01')).toBe('01 DRIVE GEAR BOX');
    expect(plModeLabel('SRC350', '27')).toBe('27 LOGO STICKER');
    expect(MACHINES.map(machine => machine.id)).toEqual(['SRC350', 'HU300']);
    expect(plModesForMachine('HU300').map(mode => mode.label)).toEqual([
      '01 HOIST UNIT', '02 HAND UNIT', '03 CARRY FIXTURE(JIG)',
    ]);
  });

  it('infers attributes from file names or PL names', () => {
    expect(inferPlMode('SRC350', '01_DRIVE_GEAR_BOX_2.csv')).toBe('01');
    expect(inferPlMode('SRC350', 'HH110A0010_2.csv', 'DRIVE GEAR BOX (350M3)')).toBe('01');
    expect(inferPlMode('HU300', '03 CARRY FIXTURE(JIG).xlsx')).toBe('03');
    expect(inferPlMode('SRC350', 'unknown.csv', 'unknown')).toBe('');
    expect(inferMachine('HU300_01_HOIST_UNIT.csv')).toBe('HU300');
    expect(inferMachine('DRIVE GEAR BOX (350M3)')).toBe('SRC350');
    expect(inferMachine('unknown.csv')).toBe('');
  });
});
