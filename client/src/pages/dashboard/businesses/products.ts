import { createBreadcrumb } from '../../../components/breadcrumb';
import { createLoadingSpinner, hideLoadingSpinner } from '../../../components/loading-spinner';
import { createEmptyState } from '../../../components/empty-state';
import { getBusinessById } from '../../../services/business.service';
import {
  listProducts,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  uploadProductImage,
  type Product,
} from '../../../services/product.service';
import { showModal, closeAllModals } from '../../../components/modal';
import { showToast } from '../../../utils/toast';

function injectProductsStyles() {
  if (document.getElementById('products-page-styles')) return;

  const style = document.createElement('style');
  style.id = 'products-page-styles';
  style.textContent = `
    :root {
      --primary: #636b2f;
      --primary-hover: #4a5122;
      --text-main: #1a1a1a;
      --text-muted: #666;
    }

    .products-page { padding: 0 20px 60px; max-width: 1100px; margin: 0 auto; }

    .products-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
    }
    .products-header h1 { font-size: 1.6rem; font-weight: 800; color: var(--text-main); margin: 0 0 4px 0; }
    .products-header p { color: var(--text-muted); font-size: 0.9rem; margin: 0; max-width: 560px; }

    .btn-primary {
      background: var(--primary); color: white; border: none; padding: 11px 20px;
      border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .btn-secondary {
      background: white; border: 1px solid #e2e8f0; color: var(--text-main);
      padding: 9px 14px; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-secondary:hover:not(:disabled) { background: #f8fafc; border-color: var(--primary); }

    .products-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 18px;
    }

    .product-card {
      background: rgba(255,255,255,0.9); border: 1px solid rgba(0,0,0,0.06); border-radius: 14px;
      overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05); display: flex; flex-direction: column;
    }
    .product-card.inactive { opacity: 0.55; }
    .product-image {
      width: 100%; height: 150px; object-fit: cover; background: #f4f6ea;
    }
    .product-image-placeholder {
      width: 100%; height: 150px; background: #f4f6ea; display: flex; align-items: center;
      justify-content: center; color: #aab08a; font-size: 0.8rem;
    }
    .product-body { padding: 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .product-name { font-weight: 700; font-size: 0.98rem; color: var(--text-main); margin: 0; }
    .product-category { font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 0.4px; }
    .product-price { font-weight: 700; color: var(--primary); font-size: 1rem; }
    .product-desc { font-size: 0.82rem; color: var(--text-muted); line-height: 1.4; margin: 0; }

    .stock-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
    .stock-row label { font-size: 0.78rem; color: #888; font-weight: 600; }
    .stock-input {
      width: 64px; padding: 5px 8px; border: 1px solid #e1e1e1; border-radius: 6px; font-size: 0.85rem;
    }
    .stock-save-btn {
      background: #f4f6ea; border: 1px solid #dde2c8; color: #3a4014; border-radius: 6px;
      padding: 5px 10px; font-size: 0.78rem; font-weight: 700; cursor: pointer;
    }
    .stock-save-btn:hover { background: #e8ecd8; }

    .product-actions { display: flex; gap: 8px; margin-top: 10px; }
    .product-actions button { flex: 1; padding: 7px 10px; font-size: 0.78rem; }
    .btn-danger-text { color: #dc2626; border-color: #fecaca; }

    .modal-form label { display: block; font-weight: 600; font-size: 0.85rem; margin: 12px 0 6px; color: #1a1a1a; }
    .modal-form label:first-child { margin-top: 0; }
    .modal-form input, .modal-form textarea {
      width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid #e1e1e1;
      border-radius: 8px; font-size: 0.9rem; font-family: inherit;
    }
    .modal-form textarea { resize: vertical; min-height: 70px; }
    .image-preview { width: 100%; height: 140px; object-fit: cover; border-radius: 8px; margin-top: 10px; display: none; }
  `;
  document.head.appendChild(style);
}

export async function renderProductsPage(businessId: string): Promise<HTMLElement> {
  injectProductsStyles();

  const container = document.createElement('div');
  container.className = 'products-page';

  const spinner = createLoadingSpinner('Loading products...');
  container.appendChild(spinner);

  try {
    const business = await getBusinessById(businessId);
    hideLoadingSpinner(spinner);

    const breadcrumb = createBreadcrumb([
      { label: 'Businesses', path: '#/dashboard/businesses' },
      { label: business.basicInfo.businessName, path: `#/dashboard/businesses/${businessId}/edit` },
      { label: 'Products' },
    ]);
    container.appendChild(breadcrumb);

    const header = document.createElement('div');
    header.className = 'products-header';
    header.innerHTML = `
      <div>
        <h1>Products</h1>
        <p>Add products with a photo, price, and stock count. Your chatbot answers questions about these directly, and stock updates show up immediately - no need to resync anything.</p>
      </div>
    `;
    const addBtn = document.createElement('button');
    addBtn.className = 'btn-primary';
    addBtn.textContent = '+ Add Product';
    header.appendChild(addBtn);
    container.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'products-grid';
    container.appendChild(grid);

    const refresh = async () => {
      grid.innerHTML = '<p style="color:#999;">Loading...</p>';
      try {
        const products = await listProducts(businessId);
        grid.innerHTML = '';

        if (products.length === 0) {
          const empty = createEmptyState({
            message: 'No products yet. Add your first product so the chatbot can answer questions about it.',
          });
          empty.style.gridColumn = '1 / -1';
          grid.appendChild(empty);
          return;
        }

        products.forEach(p => grid.appendChild(renderProductCard(businessId, p, refresh)));
      } catch {
        grid.innerHTML = '<p style="color:#dc2626;">Failed to load products.</p>';
      }
    };

    addBtn.addEventListener('click', () => openProductModal(businessId, null, refresh));

    await refresh();
  } catch (error) {
    hideLoadingSpinner(spinner);
    const err = document.createElement('p');
    err.style.cssText = 'text-align:center; padding:40px 20px; color:var(--text-main);';
    err.textContent = 'Failed to load business. Please try again.';
    container.appendChild(err);
    console.error(error);
  }

  return container;
}

function renderProductCard(businessId: string, product: Product, onChange: () => void): HTMLElement {
  const card = document.createElement('div');
  card.className = `product-card${product.isActive ? '' : ' inactive'}`;

  if (product.imageUrl) {
    const img = document.createElement('img');
    img.className = 'product-image';
    img.src = product.imageUrl;
    img.alt = product.name;
    card.appendChild(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'product-image-placeholder';
    placeholder.textContent = 'No image';
    card.appendChild(placeholder);
  }

  const body = document.createElement('div');
  body.className = 'product-body';

  if (product.category) {
    const cat = document.createElement('span');
    cat.className = 'product-category';
    cat.textContent = product.category;
    body.appendChild(cat);
  }

  const name = document.createElement('h3');
  name.className = 'product-name';
  name.textContent = product.name;
  body.appendChild(name);

  const price = document.createElement('div');
  price.className = 'product-price';
  price.textContent = `$${product.price.toFixed(2)}`;
  body.appendChild(price);

  const desc = document.createElement('p');
  desc.className = 'product-desc';
  desc.textContent = product.description;
  body.appendChild(desc);

  const stockRow = document.createElement('div');
  stockRow.className = 'stock-row';
  const stockLabel = document.createElement('label');
  stockLabel.textContent = 'Stock:';
  const stockInput = document.createElement('input');
  stockInput.type = 'number';
  stockInput.min = '0';
  stockInput.className = 'stock-input';
  stockInput.value = String(product.stockQuantity);
  const stockSaveBtn = document.createElement('button');
  stockSaveBtn.className = 'stock-save-btn';
  stockSaveBtn.textContent = 'Save';
  stockSaveBtn.addEventListener('click', async () => {
    const value = Number(stockInput.value);
    if (Number.isNaN(value) || value < 0) {
      showToast('Enter a valid stock number.', 'error');
      return;
    }
    stockSaveBtn.disabled = true;
    try {
      await updateProductStock(businessId, product._id, value);
      showToast('Stock updated.', 'success');
    } catch {
      showToast('Failed to update stock.', 'error');
    } finally {
      stockSaveBtn.disabled = false;
    }
  });
  stockRow.appendChild(stockLabel);
  stockRow.appendChild(stockInput);
  stockRow.appendChild(stockSaveBtn);
  body.appendChild(stockRow);

  const actions = document.createElement('div');
  actions.className = 'product-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'btn-secondary';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => openProductModal(businessId, product, onChange));
  actions.appendChild(editBtn);

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'btn-secondary';
  toggleBtn.textContent = product.isActive ? 'Hide' : 'Unhide';
  toggleBtn.addEventListener('click', async () => {
    toggleBtn.disabled = true;
    try {
      await updateProduct(businessId, product._id, { isActive: !product.isActive });
      onChange();
    } catch {
      showToast('Failed to update product.', 'error');
      toggleBtn.disabled = false;
    }
  });
  actions.appendChild(toggleBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-secondary btn-danger-text';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', async () => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    deleteBtn.disabled = true;
    try {
      await deleteProduct(businessId, product._id);
      showToast('Product deleted.', 'success');
      onChange();
    } catch {
      showToast('Failed to delete product.', 'error');
      deleteBtn.disabled = false;
    }
  });
  actions.appendChild(deleteBtn);

  body.appendChild(actions);
  card.appendChild(body);

  return card;
}

function openProductModal(businessId: string, product: Product | null, onSaved: () => void) {
  const isEdit = !!product;
  const content = document.createElement('div');
  content.className = 'modal-form';

  const imageLabel = document.createElement('label');
  imageLabel.textContent = 'Product Photo';
  content.appendChild(imageLabel);

  const imageInput = document.createElement('input');
  imageInput.type = 'file';
  imageInput.accept = 'image/*';
  content.appendChild(imageInput);

  const imagePreview = document.createElement('img');
  imagePreview.className = 'image-preview';
  if (product?.imageUrl) {
    imagePreview.src = product.imageUrl;
    imagePreview.style.display = 'block';
  }
  content.appendChild(imagePreview);

  let uploadedImageUrl = product?.imageUrl || '';

  imageInput.addEventListener('change', async () => {
    const file = imageInput.files?.[0];
    if (!file) return;

    imagePreview.src = URL.createObjectURL(file);
    imagePreview.style.display = 'block';

    try {
      uploadedImageUrl = await uploadProductImage(businessId, file);
    } catch {
      showToast('Image upload failed - you can still save without it.', 'error');
    }
  });

  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Product Name';
  content.appendChild(nameLabel);
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.value = product?.name || '';
  content.appendChild(nameInput);

  const categoryLabel = document.createElement('label');
  categoryLabel.textContent = 'Category (optional)';
  content.appendChild(categoryLabel);
  const categoryInput = document.createElement('input');
  categoryInput.type = 'text';
  categoryInput.value = product?.category || '';
  content.appendChild(categoryInput);

  const priceLabel = document.createElement('label');
  priceLabel.textContent = 'Price ($)';
  content.appendChild(priceLabel);
  const priceInput = document.createElement('input');
  priceInput.type = 'number';
  priceInput.min = '0';
  priceInput.step = '0.01';
  priceInput.value = product ? String(product.price) : '';
  content.appendChild(priceInput);

  const stockLabel = document.createElement('label');
  stockLabel.textContent = 'Stock Quantity';
  content.appendChild(stockLabel);
  const stockInput = document.createElement('input');
  stockInput.type = 'number';
  stockInput.min = '0';
  stockInput.value = product ? String(product.stockQuantity) : '0';
  content.appendChild(stockInput);

  const descLabel = document.createElement('label');
  descLabel.textContent = 'Description';
  content.appendChild(descLabel);
  const descInput = document.createElement('textarea');
  descInput.value = product?.description || '';
  descInput.placeholder = 'What is it, what\'s it made of, who is it for - this is what the chatbot reads to answer customer questions.';
  content.appendChild(descInput);

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn-primary';
  saveBtn.textContent = isEdit ? 'Save Changes' : 'Add Product';
  saveBtn.style.cssText = 'width:100%; margin-top:18px;';
  content.appendChild(saveBtn);

  saveBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    const price = Number(priceInput.value);
    const stockQuantity = Number(stockInput.value);

    if (!name || !description) {
      showToast('Name and description are required.', 'error');
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      showToast('Enter a valid price.', 'error');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
      const payload = {
        name,
        description,
        price,
        stockQuantity: Number.isNaN(stockQuantity) ? 0 : stockQuantity,
        category: categoryInput.value.trim() || undefined,
        imageUrl: uploadedImageUrl || undefined,
      };

      if (isEdit && product) {
        await updateProduct(businessId, product._id, payload);
        showToast('Product updated.', 'success');
      } else {
        await createProduct(businessId, payload);
        showToast('Product added.', 'success');
      }

      closeAllModals();
      onSaved();
    } catch (err: any) {
      showToast(err.message || 'Failed to save product.', 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = isEdit ? 'Save Changes' : 'Add Product';
    }
  });

  showModal({ title: isEdit ? 'Edit Product' : 'Add Product', content });
}
