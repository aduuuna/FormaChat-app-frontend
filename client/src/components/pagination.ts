export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function injectPaginationStyles() {
  if (document.getElementById('pagination-styles')) return;
  const style = document.createElement('style');
  style.id = 'pagination-styles';
  style.textContent = `
    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 24px;
      flex-wrap: wrap;
    }
    .pagination-btn {
      min-width: 34px;
      height: 34px;
      padding: 0 8px;
      border: 1px solid #e2e8f0;
      background: white;
      color: #444;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .pagination-btn:hover:not(:disabled):not(.active) {
      border-color: #636b2f;
      color: #636b2f;
    }
    .pagination-btn.active {
      background: #636b2f;
      border-color: #636b2f;
      color: white;
      cursor: default;
    }
    .pagination-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .pagination-ellipsis {
      padding: 0 4px;
      color: #999;
      font-size: 0.85rem;
    }
  `;
  document.head.appendChild(style);
}

function pageNumbersToShow(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | 'ellipsis')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('ellipsis');
    result.push(p);
  });
  return result;
}

export function createPagination(config: PaginationConfig): HTMLElement {
  injectPaginationStyles();

  const { currentPage, totalPages, onPageChange } = config;

  const bar = document.createElement('div');
  bar.className = 'pagination-bar';

  if (totalPages <= 1) return bar;

  const prevBtn = document.createElement('button');
  prevBtn.className = 'pagination-btn';
  prevBtn.textContent = '‹';
  prevBtn.disabled = currentPage <= 1;
  prevBtn.setAttribute('aria-label', 'Previous page');
  prevBtn.addEventListener('click', () => onPageChange(currentPage - 1));
  bar.appendChild(prevBtn);

  pageNumbersToShow(currentPage, totalPages).forEach(p => {
    if (p === 'ellipsis') {
      const span = document.createElement('span');
      span.className = 'pagination-ellipsis';
      span.textContent = '…';
      bar.appendChild(span);
      return;
    }

    const btn = document.createElement('button');
    btn.className = `pagination-btn${p === currentPage ? ' active' : ''}`;
    btn.textContent = String(p);
    if (p !== currentPage) {
      btn.addEventListener('click', () => onPageChange(p));
    }
    bar.appendChild(btn);
  });

  const nextBtn = document.createElement('button');
  nextBtn.className = 'pagination-btn';
  nextBtn.textContent = '›';
  nextBtn.disabled = currentPage >= totalPages;
  nextBtn.setAttribute('aria-label', 'Next page');
  nextBtn.addEventListener('click', () => onPageChange(currentPage + 1));
  bar.appendChild(nextBtn);

  return bar;
}
