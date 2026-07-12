import { createBreadcrumb } from '../../../components/breadcrumb';
import { createBusinessCard } from '../../../components/business-card';
import type { BusinessCardData } from '../../../components/business-card';
import { createEmptyState } from '../../../components/empty-state';
import { createLoadingSpinner, hideLoadingSpinner } from '../../../components/loading-spinner';
import { showDeleteConfirmation } from '../../../components/delete-confirmation';
import { getBusinessesPaginated, deleteBusiness } from '../../../services/business.service';
import { showToast } from '../../../utils/toast';
import { createPagination } from '../../../components/pagination';

function injectListStyles() {
  if (document.getElementById('business-list-styles')) return;

  const style = document.createElement('style');
  style.id = 'business-list-styles';
  style.textContent = `
    :root {
      --primary: #636b2f;
      --secondary-btn: #bac095;
      --text-main: #1a1a1a;
      --text-muted: #666;
      --red-danger: #dc2626;
      --bg-light: #ffffff;
      --shadow-subtle: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    
    .businesses-list {
      padding: 0 0 40px 0;
    }

    /* --- PAGE HEADER --- */
    .page-header {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 20px 0 10px 0;
    }
    
    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0;
      letter-spacing: -0.5px;
    }

    /* Primary Button Styling */
    .btn-primary {
      background: var(--primary);
      color: var(--bg-light);
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
      box-shadow: var(--shadow-subtle);
    }
    .btn-primary:hover {
      background: #4a5122;
      transform: translateY(-1px);
    }

    /* Page Description */
    .businesses-list > p {
      color: var(--text-muted);
      margin-bottom: 30px;
    }

    /* --- BUSINESS CARDS GRID --- */
    .business-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 30px;
      margin-top: 30px;
    }

    /* --- CARD ACTIONS --- */
    .business-card-wrapper {
        position: relative;
        /* The card component itself should be styled with glass properties, 
           but this wrapper manages the overall flow and interaction. */
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      flex-wrap: wrap;
      padding: 10px 20px 10px 10px; /* Padding for visual separation */
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      background: rgba(255, 255, 255, 0.5); /* Extend the glass feel */
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;

      /* CRITICAL FIX: Space between buttons */
      gap: 8px;
    }

    @media (max-width: 420px) {
      .card-actions {
        justify-content: stretch;
      }
      .card-actions button {
        flex: 1;
        padding: 8px 6px;
        font-size: 0.82rem;
      }
    }

    /* Action Button Base Style */
    .card-actions button {
        padding: 8px 15px;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    /* Edit (Secondary) Button */
    .btn-secondary {
      background: #636b2f;
      color: white;
      border: 1px solid #636b2f;
    }
    .btn-secondary:hover {
      background: var(--secondary-btn);
      color: var(--text-white);
      border-color: var(--secondary-btn);
      transform: translateY(-1px);
    }

    /* Delete (Danger) Button */
    .btn-danger {
      background: var(--red-danger);
      color: white;
      border: 1px solid var(--red-danger);
    }
    .btn-danger:hover {
      background: #e48080ff;
      color: white;
      border: #b91c1c !important;
      transform: translateY(-1px);
    }
  `;
  document.head.appendChild(style);
}


export async function renderBusinessList(): Promise<HTMLElement> {
  injectListStyles();
  
  const container = document.createElement('div');
  container.className = 'businesses-list';
 
  const breadcrumb = createBreadcrumb([
    { label: 'Home', path: '#/dashboard' },
    { label: 'Businesses' }
  ]);
  container.appendChild(breadcrumb);
  
  const header = document.createElement('div');
  header.className = 'page-header';
  
  const createButton = document.createElement('button');
  createButton.textContent = 'Add New Business';
  createButton.className = 'btn-primary';
  createButton.addEventListener('click', () => {
    window.location.hash = '#/dashboard/businesses/create';
  });

  
  container.appendChild(header);
  
  const description = document.createElement('p');
  description.textContent = 'Manage your chatbot businesses. Create, edit, or delete your business profiles.';
  container.appendChild(description);
  

  const grid = document.createElement('div');
  grid.className = 'business-cards-grid';
  container.appendChild(grid);

  const paginationContainer = document.createElement('div');
  container.appendChild(paginationContainer);

  const loadPage = async (page: number) => {
    grid.innerHTML = '';
    paginationContainer.innerHTML = '';
    const spinner = createLoadingSpinner('Loading businesses...');
    grid.appendChild(spinner);

    try {
      const { businesses, pagination } = await getBusinessesPaginated(page, 12);

      hideLoadingSpinner(spinner);
      grid.innerHTML = '';

      if (businesses.length === 0 && page === 1) {
        const emptyState = createEmptyState({
          message: 'No businesses found. Create your first chatbot to get started!',
          buttonText: 'Add New Business',
          buttonPath: '#/dashboard/businesses/create'
        });
        grid.appendChild(emptyState);
      } else {
        header.appendChild(createButton);

        businesses.forEach(business => {
          const card = createBusinessCardWithActions(business);
          grid.appendChild(card);
        });

        paginationContainer.appendChild(createPagination({
          currentPage: pagination.page,
          totalPages: pagination.pages,
          onPageChange: (newPage) => { loadPage(newPage); },
        }));
      }
    } catch (error: any) {
      hideLoadingSpinner(spinner);
      grid.innerHTML = '';

      const errorMessage = document.createElement('p');
      errorMessage.textContent = error?.message || 'Failed to load businesses. Please try again.';
      errorMessage.className = 'error-message';
      grid.appendChild(errorMessage);
    }
  };

  await loadPage(1);

  return container;
}

function createBusinessCardWithActions(business: any): HTMLElement {
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'business-card-wrapper';
  
 
  const cardData: BusinessCardData = {
    id: business._id,
    name: business.basicInfo.businessName,
    createdAt: business.createdAt,
    status: business.isActive ? 'active' : 'inactive',
    chatbotTone: business.customerSupport?.chatbotTone,
    vectorStatus: business.vectorInfo?.vectorStatus
  };
  
 
  const card = createBusinessCard(
    cardData,
  );
 
  const actions = document.createElement('div');
  actions.className = 'card-actions';
  

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Questionnaire';
  editBtn.type = 'button'
  editBtn.className = 'btn-secondary';
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    window.location.hash = `#/dashboard/businesses/${business._id}/edit`;
  });
  actions.appendChild(editBtn);

  const productsBtn = document.createElement('button');
  productsBtn.textContent = 'Products';
  productsBtn.type = 'button';
  productsBtn.className = 'btn-secondary';
  productsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    window.location.hash = `#/dashboard/businesses/${business._id}/products`;
  });
  actions.appendChild(productsBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.type = 'button';
  deleteBtn.className = 'btn-danger';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleDeleteBusiness(business._id, business.basicInfo.businessName, cardWrapper);
  });
  actions.appendChild(deleteBtn);
  
  card.appendChild(actions);
  cardWrapper.appendChild(card);
  
  return cardWrapper;
}

async function handleDeleteBusiness(
  businessId: string,
  businessName: string,
  cardElement: HTMLElement
): Promise<void> {
  showDeleteConfirmation({
    itemName: businessName,
    onConfirm: async () => {
      try {
        
        cardElement.style.opacity = '0.5';
        cardElement.style.pointerEvents = 'none';
        
        await deleteBusiness(businessId);
        
        cardElement.remove();
        showToast(`"${businessName}" deleted successfully.`, 'success');
      } catch (error: any) {
        cardElement.style.opacity = '1';
        cardElement.style.pointerEvents = 'auto';
        showToast(error?.message || 'Failed to delete business. Please try again.', 'error');
        console.error('Delete error:', error);
      }
    },
    onCancel: () => {
      console.log('Deletion cancelled');
    }
  });
}