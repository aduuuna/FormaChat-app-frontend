export interface ChartPoint {
  date: string;
  count: number;
}

const OLIVE_PRIMARY = '#636b2f';
const OLIVE_SECONDARY = '#bac095';
const OLIVE_FILL = 'rgba(99, 107, 47, 0.12)';
const TEXT_MUTED = '#888';
const GRID_LINE = '#e8e8e0';

function injectChartStyles() {
  if (document.getElementById('charts-styles')) return;
  const style = document.createElement('style');
  style.id = 'charts-styles';
  style.textContent = `
    .chart-card {
      background: rgba(255,255,255,0.9);
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 14px;
      padding: 18px 20px;
    }
    .chart-card-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 4px 0;
    }
    .chart-card-total {
      font-size: 1.6rem;
      font-weight: 900;
      color: #636b2f;
      margin: 0 0 12px 0;
    }
    .chart-svg-wrapper {
      width: 100%;
      overflow-x: auto;
    }
    .chart-svg-wrapper svg {
      width: 100%;
      height: auto;
      display: block;
    }
    .chart-point:hover circle {
      r: 5;
    }
    .chart-bar:hover rect {
      opacity: 0.85;
    }
    @media (max-width: 600px) {
      .chart-card { padding: 14px; }
    }
  `;
  document.head.appendChild(style);
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function buildAxis(points: ChartPoint[], width: number, height: number, padding: { top: number; right: number; bottom: number; left: number }) {
  const max = Math.max(1, ...points.map(p => p.count));
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const stepX = points.length > 1 ? innerWidth / (points.length - 1) : 0;

  const xFor = (i: number) => padding.left + i * stepX;
  const yFor = (count: number) => padding.top + innerHeight - (count / max) * innerHeight;

  return { max, innerWidth, innerHeight, xFor, yFor };
}

export function renderLineChart(title: string, points: ChartPoint[]): HTMLElement {
  injectChartStyles();

  const card = document.createElement('div');
  card.className = 'chart-card';

  const titleEl = document.createElement('p');
  titleEl.className = 'chart-card-title';
  titleEl.textContent = title;
  card.appendChild(titleEl);

  const total = points.reduce((sum, p) => sum + p.count, 0);
  const totalEl = document.createElement('p');
  totalEl.className = 'chart-card-total';
  totalEl.textContent = String(total);
  card.appendChild(totalEl);

  const width = 560;
  const height = 180;
  const padding = { top: 12, right: 12, bottom: 24, left: 12 };
  const { yFor, xFor } = buildAxis(points, width, height, padding);

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.count)}`).join(' ');
  const areaPath = `${linePath} L ${xFor(points.length - 1)} ${height - padding.bottom} L ${xFor(0)} ${height - padding.bottom} Z`;

  const gridLines = [0, 0.5, 1].map(fraction => {
    const y = padding.top + (height - padding.top - padding.bottom) * (1 - fraction);
    return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="${GRID_LINE}" stroke-width="1" />`;
  }).join('');

  const dots = points.map((p, i) => `
    <g class="chart-point">
      <circle cx="${xFor(i)}" cy="${yFor(p.count)}" r="3.5" fill="${OLIVE_PRIMARY}" />
      <title>${formatShortDate(p.date)}: ${p.count}</title>
    </g>
  `).join('');

  const labelStep = points.length > 7 ? Math.ceil(points.length / 7) : 1;
  const labels = points.map((p, i) => {
    if (i % labelStep !== 0 && i !== points.length - 1) return '';
    return `<text x="${xFor(i)}" y="${height - 6}" font-size="10" fill="${TEXT_MUTED}" text-anchor="middle">${formatShortDate(p.date)}</text>`;
  }).join('');

  const wrapper = document.createElement('div');
  wrapper.className = 'chart-svg-wrapper';
  wrapper.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${title} chart">
      ${gridLines}
      <path d="${areaPath}" fill="${OLIVE_FILL}" stroke="none" />
      <path d="${linePath}" fill="none" stroke="${OLIVE_PRIMARY}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
      ${dots}
      ${labels}
    </svg>
  `;
  card.appendChild(wrapper);

  return card;
}

export function renderBarChart(title: string, points: ChartPoint[]): HTMLElement {
  injectChartStyles();

  const card = document.createElement('div');
  card.className = 'chart-card';

  const titleEl = document.createElement('p');
  titleEl.className = 'chart-card-title';
  titleEl.textContent = title;
  card.appendChild(titleEl);

  const total = points.reduce((sum, p) => sum + p.count, 0);
  const totalEl = document.createElement('p');
  totalEl.className = 'chart-card-total';
  totalEl.textContent = String(total);
  card.appendChild(totalEl);

  const width = 560;
  const height = 180;
  const padding = { top: 12, right: 12, bottom: 24, left: 12 };
  const max = Math.max(1, ...points.map(p => p.count));
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const barGap = 6;
  const barWidth = points.length > 0 ? (innerWidth / points.length) - barGap : 0;

  const gridLines = [0, 0.5, 1].map(fraction => {
    const y = padding.top + innerHeight * (1 - fraction);
    return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="${GRID_LINE}" stroke-width="1" />`;
  }).join('');

  const bars = points.map((p, i) => {
    const barHeight = (p.count / max) * innerHeight;
    const x = padding.left + i * (barWidth + barGap);
    const y = padding.top + innerHeight - barHeight;
    return `
      <g class="chart-bar">
        <rect x="${x}" y="${y}" width="${Math.max(barWidth, 2)}" height="${Math.max(barHeight, barHeight > 0 ? barHeight : 0)}" fill="${OLIVE_SECONDARY}" rx="2" />
        <title>${formatShortDate(p.date)}: ${p.count}</title>
      </g>
    `;
  }).join('');

  const labelStep = points.length > 7 ? Math.ceil(points.length / 7) : 1;
  const labels = points.map((p, i) => {
    if (i % labelStep !== 0 && i !== points.length - 1) return '';
    const x = padding.left + i * (barWidth + barGap) + barWidth / 2;
    return `<text x="${x}" y="${height - 6}" font-size="10" fill="${TEXT_MUTED}" text-anchor="middle">${formatShortDate(p.date)}</text>`;
  }).join('');

  const wrapper = document.createElement('div');
  wrapper.className = 'chart-svg-wrapper';
  wrapper.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${title} chart">
      ${gridLines}
      ${bars}
      ${labels}
    </svg>
  `;
  card.appendChild(wrapper);

  return card;
}
