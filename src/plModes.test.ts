import { describe, expect, it } from 'vitest';
import { inferPlMode, PL_MODES, plModeLabel } from './plModes';

describe('PL display modes', () => {
  it('contains the 27 supported modes', () => {
    expect(PL_MODES).toHaveLength(27);
    expect(plModeLabel('01')).toBe('01 DRIVE GEAR BOX');
    expect(plModeLabel('27')).toBe('27 LOGO STICKER');
  });

  it('infers attributes from file names or PL names', () => {
    expect(inferPlMode('01_DRIVE_GEAR_BOX_2.csv')).toBe('01');
    expect(inferPlMode('HH110A0010_2.csv', 'DRIVE GEAR BOX (350M3)')).toBe('01');
    expect(inferPlMode('25 CLEANING NOZZLE UNIT.xlsx')).toBe('25');
    expect(inferPlMode('unknown.csv', 'unknown')).toBe('');
  });
});
