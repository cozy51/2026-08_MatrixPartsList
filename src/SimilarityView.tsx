import { useMemo, useState } from 'react';
import { plLabel } from './csv';
import { calculatePlSimilarities, comparePlParts, isStandardPl } from './matrix';
import type { Part, PartsList } from './types';

type Props = { lists: PartsList[]; sequence: Map<string,number>; baseId: string; onBaseChange: (id: string) => void };
type DetailSectionProps = { title: string; parts: Part[]; tone: 'common' | 'base' | 'target' };

function DetailSection({ title, parts, tone }: DetailSectionProps) {
  return <section className={`similarity-detail-section ${tone}`}>
    <h3>{title}<span>{parts.length} 部品</span></h3>
    {parts.length ? <div className="similarity-detail-table"><table>
      <thead><tr><th>風船</th><th>品番</th><th>Ver.</th><th>品名</th><th>数量</th><th>材質・メーカー</th></tr></thead>
      <tbody>{parts.map(part => <tr key={`${part.balloon}-${part.partNo}-${part.version}-${part.name}-${part.quantity}`}>
        <td>{part.balloon}</td><td>{part.partNo}</td><td>{part.version}</td><td>{part.name}</td><td>{part.quantity}</td><td>{part.material}</td>
      </tr>)}</tbody>
    </table></div> : <p>該当する部品はありません。</p>}
  </section>;
}

export default function SimilarityView({ lists, sequence, baseId, onBaseChange }: Props) {
  const [expandedId, setExpandedId] = useState('');
  const effectiveBaseId = lists.some(list => list.id === baseId) ? baseId : lists[0]?.id ?? '';
  const base = lists.find(list => list.id === effectiveBaseId);
  const results = useMemo(
    () => calculatePlSimilarities(lists, effectiveBaseId),
    [lists, effectiveBaseId],
  );

  if (!lists.length || !base) return <div className="similarity-empty">表示対象のPLを選択してください。</div>;

  return <section className="similarity-view">
    <div className="similarity-controls">
      <div><h2>PL間の類似度</h2><p>共通部品 ÷ 全部品（Jaccard係数）・行をクリックすると詳細を表示</p></div>
      <label><span>基準PL</span><select value={effectiveBaseId} onChange={event => { onBaseChange(event.target.value); setExpandedId(''); }}>{lists.map(list => <option key={list.id} value={list.id}>{sequence.get(list.id)}. {plLabel(list)}</option>)}</select></label>
    </div>
    <div className="similarity-list">{results.map((result, index) => {
      const expanded = expandedId === result.list.id;
      const detail = expanded ? comparePlParts(base, result.list) : null;
      return <article className={`similarity-row ${result.list.id === effectiveBaseId ? 'is-base' : ''} ${expanded ? 'is-expanded' : ''}`} key={result.list.id}>
        <button className="similarity-summary" type="button" aria-expanded={expanded} onClick={() => setExpandedId(expanded ? '' : result.list.id)}>
          <span className="similarity-rank">{index + 1}</span>
          <span className="similarity-name"><b><span className="pl-sequence">{sequence.get(result.list.id)}.</span>{plLabel(result.list)}</b>{isStandardPl(result.list.plNo) && <span className="standard-badge">STD</span>}<small>{result.list.plName}</small></span>
          <span className="similarity-meter"><span style={{ width: `${result.score * 100}%` }} /></span>
          <strong>{(result.score * 100).toFixed(1)}%</strong>
          <small>{result.common} 共通 / {result.union} 全部品</small>
          <span className="similarity-chevron" aria-hidden="true">⌄</span>
        </button>
        {detail && <div className="similarity-details">
          <DetailSection title="共通部品" parts={detail.common} tone="common" />
          <DetailSection title={`${plLabel(base)} のみ`} parts={detail.baseOnly} tone="base" />
          <DetailSection title={`${plLabel(result.list)} のみ`} parts={detail.targetOnly} tone="target" />
        </div>}
      </article>;
    })}</div>
  </section>;
}
