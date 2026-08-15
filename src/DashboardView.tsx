import { MACHINES } from './plModes';
import type { PartsList } from './types';

type Props = {
  lists: PartsList[];
  onOpenUnit: (machineId: string, modeId: string) => void;
};

export default function DashboardView({ lists, onOpenUnit }: Props) {
  return <section className="dashboard-view" aria-labelledby="dashboard-title">
    <div className="dashboard-heading">
      <div><h2 id="dashboard-title">登録状況ダッシュボード</h2><p>機種・ユニット別の登録件数を一覧できます。</p></div>
      <strong>{lists.length}<span> 登録PL</span></strong>
    </div>
    <div className="machine-tree">{MACHINES.map(machine => {
      const machineLists = lists.filter(list => list.machineId === machine.id);
      return <section className="machine-branch" key={machine.id}>
        <div className="machine-node"><span className="tree-icon" aria-hidden="true">▾</span><div><b>{machine.label}</b><small>{machine.modes.length} ユニット</small></div><strong>{machineLists.length}件</strong></div>
        <ul>{machine.modes.map(mode => {
          const count = machineLists.filter(list => list.modeId === mode.id).length;
          return <li key={mode.id}>
            <span className="tree-line" aria-hidden="true" />
            <button type="button" onClick={() => onOpenUnit(machine.id, mode.id)} aria-label={`${machine.label} ${mode.label}を開く、${count}件`}>
              <span>{mode.label}</span><strong>{count}件</strong><span className="dashboard-link">マトリックスへ →</span>
            </button>
          </li>;
        })}</ul>
      </section>;
    })}</div>
  </section>;
}
