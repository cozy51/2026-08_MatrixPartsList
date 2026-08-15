import { useMemo } from 'react';
import { plLabel } from './csv';
import { calculatePlSimilarities, isStandardPl } from './matrix';
import type { PartsList } from './types';

type Props = { lists: PartsList[]; sequence: Map<string,number>; baseId: string; onBaseChange: (id: string) => void };

export default function SimilarityView({ lists, sequence, baseId, onBaseChange }: Props) {
  const effectiveBaseId = lists.some(list => list.id === baseId) ? baseId : lists[0]?.id ?? '';
  const results = useMemo(
    () => calculatePlSimilarities(lists, effectiveBaseId),
    [lists, effectiveBaseId],
  );

  if (!lists.length) return <div className="similarity-empty">表示対象のPLを選択してください。</div>;

  return <section className="similarity-view">
    <div className="similarity-controls">
      <div><h2>PL間の類似度</h2><p>共通部品 ÷ 全部品（Jaccard係数）</p></div>
      <label><span>基準PL</span><select value={effectiveBaseId} onChange={event => onBaseChange(event.target.value)}>{lists.map(list => <option key={list.id} value={list.id}>{sequence.get(list.id)}. {plLabel(list)}</option>)}</select></label>
    </div>
    <div className="similarity-list">{results.map((result, index) => <article className={`similarity-row ${result.list.id === effectiveBaseId ? 'is-base' : ''}`} key={result.list.id}>
      <span className="similarity-rank">{index + 1}</span>
      <div className="similarity-name"><b><span className="pl-sequence">{sequence.get(result.list.id)}.</span>{plLabel(result.list)}</b>{isStandardPl(result.list.plNo) && <span className="standard-badge">STD</span>}<small>{result.list.plName}</small></div>
      <div className="similarity-meter"><span style={{ width: `${result.score * 100}%` }} /></div>
      <strong>{(result.score * 100).toFixed(1)}%</strong>
      <small>{result.common} 共通 / {result.union} 全部品</small>
    </article>)}</div>
  </section>;
}
