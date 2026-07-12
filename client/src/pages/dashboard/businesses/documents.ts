import { createBreadcrumb } from '../../../components/breadcrumb';
import { createLoadingSpinner, hideLoadingSpinner } from '../../../components/loading-spinner';
import { createEmptyState } from '../../../components/empty-state';
import { renderBusinessSectionHeader } from '../../../components/business-tabs';
import { getBusinessById } from '../../../services/business.service';
import { uploadDocument, deleteDocument } from '../../../services/document.service';
import type { FileDocument } from '../../../types/business.types';
import { showToast } from '../../../utils/toast';

function injectDocumentsStyles() {
  if (document.getElementById('documents-page-styles')) return;

  const style = document.createElement('style');
  style.id = 'documents-page-styles';
  style.textContent = `
    :root { --primary: #636b2f; --primary-hover: #4a5122; --text-main: #1a1a1a; --text-muted: #666; }

    .documents-page { padding: 0 20px 60px; max-width: 900px; margin: 0 auto; }

    .documents-intro { color: var(--text-muted); font-size: 0.9rem; margin: 0 0 20px 0; max-width: 600px; }

    .upload-zone {
      border: 2px dashed #d1d5db; border-radius: 14px; padding: 30px 20px; text-align: center;
      background: rgba(255,255,255,0.6); margin-bottom: 24px;
    }
    .upload-zone p { color: var(--text-muted); font-size: 0.85rem; margin: 8px 0 0; }

    .btn-primary {
      background: var(--primary); color: white; border: none; padding: 11px 20px;
      border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-primary:hover:not(:disabled) { background: var(--primary-hover); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .document-row {
      display: flex; align-items: center; gap: 12px; padding: 14px 16px;
      background: rgba(255,255,255,0.85); border: 1px solid rgba(0,0,0,0.06); border-radius: 10px;
      margin-bottom: 10px; flex-wrap: wrap;
    }
    .document-icon {
      width: 36px; height: 36px; border-radius: 8px; background: #f4f6ea; color: #636b2f;
      display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.7rem; flex-shrink: 0;
    }
    .document-info { flex: 1; min-width: 0; }
    .document-name { font-weight: 600; font-size: 0.9rem; color: var(--text-main); word-break: break-word; }
    .document-meta { font-size: 0.78rem; color: #999; margin-top: 2px; }
    .document-delete-btn {
      background: white; border: 1px solid #fecaca; color: #dc2626; border-radius: 8px;
      padding: 7px 12px; font-size: 0.8rem; font-weight: 600; cursor: pointer; flex-shrink: 0;
    }
    .document-delete-btn:hover:not(:disabled) { background: #fef2f2; }

    @media (max-width: 500px) {
      .document-row { padding: 12px; }
    }
  `;
  document.head.appendChild(style);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function renderDocumentsPage(businessId: string): Promise<HTMLElement> {
  injectDocumentsStyles();

  const container = document.createElement('div');
  container.className = 'documents-page';

  const spinner = createLoadingSpinner('Loading documents...');
  container.appendChild(spinner);

  try {
    const business = await getBusinessById(businessId);
    hideLoadingSpinner(spinner);

    const breadcrumb = createBreadcrumb([
      { label: 'Businesses', path: '#/dashboard/businesses' },
      { label: business.basicInfo.businessName, path: `#/dashboard/businesses/${businessId}/edit` },
      { label: 'Documents' },
    ]);
    container.appendChild(breadcrumb);

    container.appendChild(
      await renderBusinessSectionHeader(business._id, business.basicInfo.businessName, 'documents')
    );

    const intro = document.createElement('p');
    intro.className = 'documents-intro';
    intro.textContent = 'Upload PDFs or Word documents (menus, policies, catalogs, FAQs) and your chatbot will read them to answer customer questions - alongside everything from the Questionnaire and Products tabs.';
    container.appendChild(intro);

    const uploadZone = document.createElement('div');
    uploadZone.className = 'upload-zone';
    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'btn-primary';
    uploadBtn.textContent = '+ Upload Document';
    uploadZone.appendChild(uploadBtn);
    const uploadHint = document.createElement('p');
    uploadHint.textContent = 'PDF or DOCX, up to 15MB';
    uploadZone.appendChild(uploadHint);
    container.appendChild(uploadZone);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    fileInput.style.display = 'none';
    container.appendChild(fileInput);

    const list = document.createElement('div');
    container.appendChild(list);

    const renderList = (documents: FileDocument[]) => {
      list.innerHTML = '';

      if (documents.length === 0) {
        list.appendChild(
          createEmptyState({ message: 'No documents yet. Upload a PDF or Word doc to add it to your chatbot\'s knowledge base.' })
        );
        return;
      }

      documents.forEach(doc => {
        const row = document.createElement('div');
        row.className = 'document-row';

        const icon = document.createElement('div');
        icon.className = 'document-icon';
        icon.textContent = doc.fileName.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOC';
        row.appendChild(icon);

        const info = document.createElement('div');
        info.className = 'document-info';
        const name = document.createElement('div');
        name.className = 'document-name';
        name.textContent = doc.fileName;
        info.appendChild(name);
        const meta = document.createElement('div');
        meta.className = 'document-meta';
        meta.textContent = `${formatFileSize(doc.fileSize)} · uploaded ${new Date(doc.uploadDate).toLocaleDateString()}`;
        info.appendChild(meta);
        row.appendChild(info);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'document-delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', async () => {
          if (!window.confirm(`Delete "${doc.fileName}"? Your chatbot will stop referencing it.`)) return;
          deleteBtn.disabled = true;
          try {
            await deleteDocument(businessId, doc.fileName);
            showToast('Document deleted.', 'success');
            currentDocuments = currentDocuments.filter(d => d.fileName !== doc.fileName);
            renderList(currentDocuments);
          } catch (error: any) {
            showToast(error?.message || 'Failed to delete document.', 'error');
            deleteBtn.disabled = false;
          }
        });
        row.appendChild(deleteBtn);

        list.appendChild(row);
      });
    };

    let currentDocuments: FileDocument[] = business.files?.documents || [];
    renderList(currentDocuments);

    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Uploading...';

      try {
        const doc = await uploadDocument(businessId, file);
        currentDocuments = [...currentDocuments, doc];
        renderList(currentDocuments);
        showToast('Document uploaded - your chatbot will start using it shortly.', 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to upload document.', 'error');
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = '+ Upload Document';
        fileInput.value = '';
      }
    });
  } catch (error: any) {
    hideLoadingSpinner(spinner);
    const err = document.createElement('p');
    err.style.cssText = 'text-align:center; padding:40px 20px; color:var(--text-main);';
    err.textContent = error?.message || 'Failed to load business. Please try again.';
    container.appendChild(err);
    console.error(error);
  }

  return container;
}
