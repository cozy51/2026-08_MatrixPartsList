export type PlMode = { id: string; label: string };

export const PL_MODES: PlMode[] = [
  ['01', 'DRIVE GEAR BOX'], ['02', 'STEERING UNIT(R)'], ['03', 'STEERING UNIT(F)'],
  ['04', 'CORE UNIT'], ['05', 'DIVERGE UNIT(R)'], ['06', 'DIVERGE UNIT(F)'],
  ['07', 'HOIST GEAR BOX'], ['08', 'HOIST BASE UNIT'], ['09', 'HOIST DRUM UNIT'],
  ['10', 'HOIST SENSOR UNIT'], ['11', 'CENTER FRAME'], ['12', 'FRONT FRAME'],
  ['13', 'REAR FRAME'], ['14', 'FEEDER UNIT'], ['15', 'LAN UNIT'],
  ['16', 'E-84関係'], ['17', 'THETA UNIT'], ['18', 'LATERAL UNIT'],
  ['19', 'LATERAL GEAR BOX'], ['20', 'CRADLE'], ['21', 'HAND'], ['22', 'COVER'],
  ['23', 'HAZARD LABEL'], ['24', 'CARRY WAGON'], ['25', 'CLEANING NOZZLE UNIT'],
  ['26', 'CLEANER UNIT'], ['27', 'LOGO STICKER'],
].map(([id, name]) => ({ id, label: `${id} ${name}` }));

const normalized = (value: string) => value.normalize('NFKC').toUpperCase()
  .replace(/\.(CSV|XLSX?|XLSM)$/i, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();

export function inferPlMode(...values: string[]): string {
  const candidates = values.map(normalized).filter(Boolean);
  for (const mode of PL_MODES) {
    const name = normalized(mode.label.replace(/^\d+\s+/, ''));
    if (candidates.some(value => value.includes(name))) return mode.id;
  }
  return '';
}

export const plModeLabel = (id: string) => PL_MODES.find(mode => mode.id === id)?.label ?? '属性未設定';
