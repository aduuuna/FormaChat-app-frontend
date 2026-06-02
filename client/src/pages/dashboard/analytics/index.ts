import { createBusinessCard } from '../../../components/business-card';
import type { BusinessCardData } from '../../../components/business-card';
import { createEmptyState } from '../../../components/empty-state';
import { createLoadingSpinner, hideLoadingSpinner } from '../../../components/loading-spinner';
import { createBreadcrumb } from '../../../components/breadcrumb';
import { getBusinesses } from '../../../services/business.service';

function injectAnalyticsIndexStyles() {
  if (document.getElementById('analytics-index-styles')) return;

  const style = document.createElement('style');
  style.id = 'analytics-index-styles';
  style.textContent = `
    :root {
      --primary: #636b2f;
      --text-main: #1a1a1a;
      --text-muted: #666;
    }
    
    .analytics-index {
      padding: 0 0 40px 0;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* --- PAGE HEADER --- */
    .page-header {
      margin: 20px 0 10px 0;
    }
    
    .page-header h1 {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-main);
      margin: 0 0 10px 0;
      letter-spacing: -0.5px;
    }

    .page-description {
      color: var(--text-muted);
      font-size: 1rem;
      margin-bottom: 30px;
      max-width: 600px;
      line-height: 1.5;
    }

    /* --- BUSINESS CARDS GRID --- */
    .business-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 30px;
      margin-top: 30px;
    }

    .error-message {
      color: #dc2626;
      background: rgba(220, 38, 38, 0.1);
      padding: 15px;
      border-radius: 8px;
    }
  `;
  document.head.appendChild(style);
}

export async function renderAnalyticsIndex(): Promise<HTMLElement> {
  injectAnalyticsIndexStyles();

  const container = document.createElement('div');
  container.className = 'analytics-index';
  
  const breadcrumb = createBreadcrumb([
    { label: 'Home', path: '#/dashboard' },
    { label: 'Analytics' }
  ]);
  container.appendChild(breadcrumb);
  
  const header = document.createElement('div');
  header.className = 'page-header';
  
  const description = document.createElement('p');
  description.className = 'page-description';
  description.textContent = 'Select a business to view detailed performance metrics, track leads, and analyze conversation history.';
  header.appendChild(description);

  container.appendChild(header);
  
  const grid = document.createElement('div');
  grid.className = 'business-cards-grid';
  container.appendChild(grid);
  
  const spinner = createLoadingSpinner('Loading businesses...');
  grid.appendChild(spinner);
  
  try {
    const businesses = await getBusinesses();
    
    hideLoadingSpinner(spinner);
    
    if (businesses.length === 0) {
      const emptyState = createEmptyState({
        message: 'No businesses found. Create your first bot to start tracking data!',
        buttonText: 'Create Business Bot',
        buttonPath: '#/dashboard/businesses/create'
      });
      grid.appendChild(emptyState);
    } else {
      businesses.forEach(business => {
        const cardData: BusinessCardData = {
          id: business._id,
          name: business.basicInfo.businessName,
          createdAt: business.createdAt,
          status: business.isActive ? 'active' : 'inactive'
        };
        
        const card = createBusinessCard(
          cardData,
          `#/dashboard/analytics/${business._id}`
        );
        grid.appendChild(card);
      });
    }
  } catch (error) {
    hideLoadingSpinner(spinner);
    
    const errorMessage = document.createElement('p');
    errorMessage.textContent = 'Failed to load businesses. Please try again.';
    errorMessage.className = 'error-message';
    grid.appendChild(errorMessage);
    
    console.error('Failed to fetch businesses:', error);
  }
  
  return container;
}