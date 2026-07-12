import { getBusinessHealthScore } from '../services/business.service';

export type BusinessTab = 'questionnaire' | 'products' | 'documents';

function injectBusinessTabsStyles() {
  if (document.getElementById('business-tabs-styles')) return;

  const style = document.createElement('style');
  style.id = 'business-tabs-styles';
  style.textContent = `
    .business-section-header { margin-bottom: 20px; }
    .business-section-header h1 {
      font-size: 1.5rem; font-weight: 800; color: #1a1a1a; margin: 0 0 14px 0;
    }

    .health-strip {
      display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
      background: rgba(255,255,255,0.85); border-radius: 12px; padding: 14px 18px;
      margin-bottom: 16px; border: 1px solid rgba(0,0,0,0.05);
    }
    .health-strip-score { font-size: 1.6rem; font-weight: 900; line-height: 1; flex-shrink: 0; }
    .health-strip-mid { flex: 1; min-width: 160px; }
    .health-strip-tier { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
    .health-strip-bar-bg { background: #e5e7eb; border-radius: 999px; height: 6px; margin-top: 6px; overflow: hidden; }
    .health-strip-bar-fill { height: 100%; border-radius: 999px; transition: width 0.6s ease; }
    .health-strip-checks { display: flex; flex-wrap: wrap; gap: 6px; }
    .health-strip-check {
      background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 3px 8px;
      font-size: 0.76rem; color: #856404; white-space: nowrap;
    }

    .business-tab-bar {
      display: flex; gap: 4px; border-bottom: 2px solid #e5e7eb; margin-bottom: 24px;
      overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none;
    }
    .business-tab-bar::-webkit-scrollbar { display: none; }
    .business-tab-link {
      padding: 10px 18px; font-weight: 700; font-size: 0.9rem; color: #666; text-decoration: none;
      border-bottom: 2px solid transparent; margin-bottom: -2px; white-space: nowrap; transition: color 0.15s;
    }
    .business-tab-link:hover { color: #4a5122; }
    .business-tab-link.active { color: #636b2f; border-bottom-color: #636b2f; }

    @media (max-width: 600px) {
      .health-strip { padding: 12px 14px; }
      .business-tab-link { padding: 10px 14px; font-size: 0.85rem; }
    }
  `;
  document.head.appendChild(style);
}

const TIER_COLORS: Record<string, string> = {
  excellent: '#16a34a',
  good: '#636b2f',
  fair: '#d97706',
  incomplete: '#dc2626',
};

const TABS: Array<{ id: BusinessTab; label: string; path: (id: string) => string }> = [
  { id: 'questionnaire', label: 'Questionnaire', path: id => `#/dashboard/businesses/${id}/edit` },
  { id: 'products', label: 'Products', path: id => `#/dashboard/businesses/${id}/products` },
  { id: 'documents', label: 'Documents', path: id => `#/dashboard/businesses/${id}/documents` },
];

export async function renderBusinessSectionHeader(
  businessId: string,
  businessName: string,
  activeTab: BusinessTab
): Promise<HTMLElement> {
  injectBusinessTabsStyles();

  const wrapper = document.createElement('div');
  wrapper.className = 'business-section-header';

  const title = document.createElement('h1');
  title.textContent = businessName;
  wrapper.appendChild(title);

  // Health strip — best-effort, don't break the page if it fails
  try {
    const hs = await getBusinessHealthScore(businessId);
    const color = TIER_COLORS[hs.tier] || '#636b2f';
    const passedChecks = hs.checks.filter(c => c.achieved).length;

    const strip = document.createElement('div');
    strip.className = 'health-strip';

    const score = document.createElement('div');
    score.className = 'health-strip-score';
    score.style.color = color;
    score.textContent = `${hs.score}%`;
    strip.appendChild(score);

    const mid = document.createElement('div');
    mid.className = 'health-strip-mid';
    const tier = document.createElement('div');
    tier.className = 'health-strip-tier';
    tier.style.color = color;
    tier.textContent = `${hs.tier} · ${passedChecks}/${hs.checks.length} checks passed`;
    mid.appendChild(tier);
    const barBg = document.createElement('div');
    barBg.className = 'health-strip-bar-bg';
    const barFill = document.createElement('div');
    barFill.className = 'health-strip-bar-fill';
    barFill.style.cssText = `width:${hs.score}%; background:${color};`;
    barBg.appendChild(barFill);
    mid.appendChild(barBg);
    strip.appendChild(mid);

    const failing = hs.checks.filter(c => !c.achieved);
    if (failing.length > 0) {
      const checks = document.createElement('div');
      checks.className = 'health-strip-checks';
      failing.slice(0, 4).forEach(c => {
        const chip = document.createElement('span');
        chip.className = 'health-strip-check';
        chip.textContent = c.label;
        checks.appendChild(chip);
      });
      strip.appendChild(checks);
    }

    wrapper.appendChild(strip);
  } catch { /* health score is non-critical */ }

  const tabBar = document.createElement('div');
  tabBar.className = 'business-tab-bar';
  TABS.forEach(tab => {
    const link = document.createElement('a');
    link.href = tab.path(businessId);
    link.className = `business-tab-link${tab.id === activeTab ? ' active' : ''}`;
    link.textContent = tab.label;
    tabBar.appendChild(link);
  });
  wrapper.appendChild(tabBar);

  return wrapper;
}
