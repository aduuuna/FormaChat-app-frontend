import { createBreadcrumb } from '../../../components/breadcrumb';
import { createLoadingSpinner, hideLoadingSpinner } from '../../../components/loading-spinner';
import { showSessionDetailsModal } from '../../../components/session-details-modal'; 
import { getBusinessById } from '../../../services/business.service';
import { showLeadDetailsModal } from '../../../components/lead-details-modal';
import { getDashboardSummary} from '../../../services/chat.service';
import { showModal } from '../../../components/modal';

function formatDateTime(dateString: string | Date): string {
    const date = new Date(dateString);

    return date.toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', 
        hour: 'numeric', minute: '2-digit', 
    });
}

function injectAnalyticsDetailStyles() {
    if (document.getElementById('analytics-detail-styles')) return;

    const style = document.createElement('style');
    style.id = 'analytics-detail-styles';
    style.textContent = `
        :root {
            --primary: #636b2f;
            --primary-light: #bac095;
            --text-main: #1a1a1a;
            --text-muted: #666;
            --bg-glass: rgba(255, 255, 255, 0.85);
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
        }
        
        body {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .analytics-detail {
            max-width: 1200px;
            width: 95%;
            margin: 0 auto;
            padding-bottom: 60px;
            font-family: 'Inter', system-ui, sans-serif;
            animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .page-header {
            display: flex;
            flex-direction: Column;
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: linear-gradient(to bottom, transparent, rgba(99, 107, 47, 0.05));
            border-radius: 12px;
        }
        .page-header h1 {
            font-size: 1.8rem;
            color: var(--primary);
            margin: 0 0 10px 0;
            font-weight: 800;
        }
        .page-header p {
            color: var(--text-muted);
            font-size: 1rem;
            margin: 0;
            max-width: 600px;
            margin: 0 auto;
        }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .stat-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: transform 0.2s;
        }
        
        .stat-label {
            font-size: 0.95rem;
            color: var(--text-muted);
            margin-bottom: 5px;
            font-weight: 500;
        }
        .stat-value {
            font-size: 2.5rem;
            font-weight: 800;
            color: var(--primary);
            margin: 0 0 5px 0;
            line-height: 1.1;
        }
        .stat-change {
            font-size: 0.85rem;
            color: var(--text-main);
            font-weight: 600;
        }

        /* Layout */
        .main-content-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 30px;
        }
        
        @media (min-width: 1024px) {
            .main-content-grid {
                grid-template-columns: 1fr 1fr;
            }
        }

        /* Section Styling */
        .sessions-section, .leads-section {
            background: var(--bg-glass);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.6);
            border-radius: 16px;
            padding: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        
        .sessions-section h2, .leads-section h2 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-top: 0;
            margin-bottom: 20px;
            color: var(--text-main);
            border-bottom: 2px solid var(--primary-light);
            padding-bottom: 10px;
        }

        /* ========== TABLE STYLING ========== */
        .sessions-table, .leads-table {
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #eee;
            margin-bottom: 15px;
        }

        .table-row {
            display: grid;
            padding: 14px 10px;
            align-items: center;
            border-bottom: 1px solid #eee;
            gap: 10px;
            font-size: 0.9rem;
        }

        /* MAIN PAGE: Sessions = 3 columns (ID, Status, Contact) */
        .sessions-section .sessions-table .table-row {
            grid-template-columns: 1.5fr 1.5fr 1.5fr;
            text-align: left;
        }

        /* MAIN PAGE: Leads = 3 columns (Session ID, Email, Date) */
        .leads-section .leads-table .table-row {
            grid-template-columns: 1.5fr 1.5fr 1.5fr;
            text-align: left;
        }

        /* MODAL: All Sessions with checkboxes = 4 columns */
        .modal-content .sessions-table .table-row {
            grid-template-columns: 40px 100px 110px 1fr !important;
            text-align: left;
        }

        /* MODAL: All Leads = 3 columns (same as main page) */
        .modal-content .leads-table .table-row {
            grid-template-columns: 120px 1fr 150px !important;
            text-align: left;
        }

        .table-header {
            background: #636b2f;
            color: white;
            font-weight: 700;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            position: sticky;
            top: 0;
            z-index: 10;
            border-radius: 8px 8px 0 0;
        }

        .table-cell {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: var(--text-main);
            font-size: 0.9rem;
        }

        /* Cell Styling */
        .contact-captured { color: var(--success); font-weight: 600; }
        .contact-not-captured { color: var(--text-muted); font-style: italic; }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: capitalize;
        }
        .status-active, .status-completed { background: var(--success); color: white; }
        .status-error { background: var(--danger); color: white; }
        .status-pending { background: var(--warning); color: white; }

        /* Buttons */
        .btn-secondary {
            background: white; 
            border: 1px solid var(--primary-light); 
            color: var(--primary);
            padding: 10px 15px; 
            border-radius: 8px; 
            font-weight: 600; 
            cursor: pointer;
            transition: background 0.2s;
        }
        .btn-secondary:hover {
            background: #f0f0f0;
        }

        /* Delete Button in Modal Header */
        .header-delete-btn {
            margin-right: auto;
            margin-left: 15px;
            background: #dc2626;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            display: none;
            align-items: center;
            gap: 6px;
        }

        .header-delete-btn.visible {
            display: flex;
        }

        .row-checkbox {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: var(--primary);
        }
    `;
    document.head.appendChild(style);
}

export async function renderAnalyticsDetail(businessId: string): Promise<HTMLElement> {
    injectAnalyticsDetailStyles();

    const container = document.createElement('div');
    container.className = 'analytics-detail';
    
    const spinner = createLoadingSpinner('Loading analytics...');
    container.appendChild(spinner);
    
    try {
        const business = await getBusinessById(businessId);

        const { sessions: recentSessions, leads: recentLeads, analytics: analyticsSummary } = 
            await getDashboardSummary(businessId);
        
        hideLoadingSpinner(spinner);
        
        const breadcrumb = createBreadcrumb([
            { label: 'Analytics', path: '#/dashboard/analytics' },
            { label: business.basicInfo.businessName }
        ]);
        container.appendChild(breadcrumb);
        
        const header = document.createElement('div');
        header.className = 'page-header';
        header.innerHTML = `
            <h1>Dashboard Analytics</h1>
            <p>View your bot's performance, manage captured leads, and monitor active session messages.</p>
        `;
        container.appendChild(header);
        
        const statsSection = document.createElement('section');
        statsSection.className = 'stats-section';
        
        const statsGrid = document.createElement('div');
        statsGrid.className = 'stats-grid';
        
        statsGrid.appendChild(createStatCard(
            'Total Sessions', 
            analyticsSummary.totalSessions.toString(),
            `${analyticsSummary.activeSessions} Active Now`
        ));
        
        statsGrid.appendChild(createStatCard(
            'Total Leads', 
            analyticsSummary.totalLeads.toString(),
            'Captured contacts'
        ));
        
        statsGrid.appendChild(createStatCard(
            'Total Messages', 
            analyticsSummary.totalMessages.toString(),
            'Bot & User Count'
        ));
        
        statsGrid.appendChild(createStatCard(
            'Conversion Rate', 
            `${analyticsSummary.conversionRate}%`,
            'Sessions to Leads'
        ));
        
        statsSection.appendChild(statsGrid);
        container.appendChild(statsSection);

        const mainContentGrid = document.createElement('div');
        mainContentGrid.className = 'main-content-grid';

        // ========== SESSIONS TABLE (3 columns: ID, Status, Contact) ==========
        if (recentSessions.length > 0) {
            const sessionsSection = document.createElement('section');
            sessionsSection.className = 'sessions-section';
            
            const sessionsHeading = document.createElement('h2');
            sessionsHeading.textContent = 'Recent Sessions';
            sessionsSection.appendChild(sessionsHeading);
            
            const sessionsTable = document.createElement('div');
            sessionsTable.className = 'sessions-table';
            
            // HEADER: Only 3 columns
            const tableHeader = document.createElement('div');
            tableHeader.className = 'table-row table-header';
            tableHeader.innerHTML = `
                <div class="table-cell">Session ID</div>
                <div class="table-cell">Status</div>
                <div class="table-cell">Contact</div>
            `;
            sessionsTable.appendChild(tableHeader);
            
            recentSessions.forEach(session => {
                const row = document.createElement('div');
                row.className = 'table-row';
                row.style.cursor = 'pointer';
                
                const contact = session.contact;
                let contactDisplay = '-';
                let contactClass = 'contact-not-captured';
                
                if (contact?.email) {
                    contactDisplay = contact.email;
                    contactClass = 'contact-captured';
                } else if (contact?.phone) {
                    contactDisplay = contact.phone;
                    contactClass = 'contact-captured';
                }
                
                // ROW: Only 3 columns (removed msgs and date)
                row.innerHTML = `
                    <div class="table-cell" title="${session.sessionId}">${session.sessionId.substring(0, 10)}...</div>
                    <div class="table-cell"><span class="status-badge status-${session.status}">${session.status}</span></div>
                    <div class="table-cell ${contactClass}">${contactDisplay}</div>
                `;
                
                row.addEventListener('click', async () => {
                    await showSessionDetailsModal(businessId, session.sessionId);
                });
                
                sessionsTable.appendChild(row);
            });
            
            sessionsSection.appendChild(sessionsTable);
            
            const viewAllBtn = document.createElement('button');
            viewAllBtn.textContent = 'View All Sessions';
            viewAllBtn.className = 'btn-secondary';
            viewAllBtn.addEventListener('click', async () => {
                await showAllSessionsModal(businessId);
            });
            sessionsSection.appendChild(viewAllBtn);
            
            mainContentGrid.appendChild(sessionsSection);
        }
        
        // ========== LEADS TABLE (3 columns: Session ID, Email, Captured At) ==========
        if (recentLeads.length > 0) {
            const leadsSection = document.createElement('section');
            leadsSection.className = 'leads-section';
            
            const leadsHeading = document.createElement('h2');
            leadsHeading.textContent = 'Recent Leads';
            leadsSection.appendChild(leadsHeading);
            
            const leadsTable = document.createElement('div');
            leadsTable.className = 'leads-table';
            
            // HEADER: Only 3 columns
            const tableHeader = document.createElement('div');
            tableHeader.className = 'table-row table-header';
            tableHeader.innerHTML = `
                <div class="table-cell">Session ID</div>
                <div class="table-cell">Contact</div>
                <div class="table-cell">Captured At</div>
            `;
            leadsTable.appendChild(tableHeader);
            
            recentLeads.forEach(lead => {
                const row = document.createElement('div');
                row.className = 'table-row';
                row.style.cursor = 'pointer';
                
                const contactDisplay = lead.email || lead.phone || '-';
               

                // ROW: Only 3 columns (removed name and phone)
                row.innerHTML = `
                    <div class="table-cell" title="${lead.firstSessionId}">${lead.firstSessionId.substring(0, 10)}...</div>
                    <div class="table-cell contact-captured">${contactDisplay}</div>
                    <div class="table-cell">${formatDateTime(lead.firstContactDate)}</div>
                `;
                
                row.addEventListener('click', () => {
                    showLeadDetailsModal(lead, businessId);
                });
                
                leadsTable.appendChild(row);
            });
            
            leadsSection.appendChild(leadsTable);
            
            const viewAllBtn = document.createElement('button');
            viewAllBtn.textContent = 'View All Leads';
            viewAllBtn.className = 'btn-secondary';
            viewAllBtn.addEventListener('click', async () => {
                await showAllLeadsModal(businessId);
            });
            leadsSection.appendChild(viewAllBtn);
            
            mainContentGrid.appendChild(leadsSection);
        }

        container.appendChild(mainContentGrid);
        
        if (recentSessions.length === 0 && recentLeads.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.style.padding = '50px';
            emptyState.style.textAlign = 'center';
            emptyState.style.fontSize = '1.1rem';
            emptyState.style.color = 'var(--text-muted)';
            emptyState.innerHTML = `
                <p>📊 No chat activity yet for this business.</p>
                <p>Share your bot URL to start receiving conversations and tracking data!</p>
            `;
            container.appendChild(emptyState);
        }
        
    } catch (error) {
        hideLoadingSpinner(spinner);
        
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Failed to load analytics. Please try again.';
        errorMessage.className = 'error-message';
        container.appendChild(errorMessage);
        
        console.error('Failed to fetch analytics:', error);
    }
    
    return container;
}

function createStatCard(label: string, value: string, change: string): HTMLElement {
    const card = document.createElement('div');
    card.className = 'stat-card';
    
    const labelElement = document.createElement('p');
    labelElement.className = 'stat-label';
    labelElement.textContent = label;
    card.appendChild(labelElement);
    
    const valueElement = document.createElement('h3');
    valueElement.className = 'stat-value';
    valueElement.textContent = value;
    card.appendChild(valueElement);
    
    const changeElement = document.createElement('p');
    changeElement.className = 'stat-change';
    
    if (label.includes('Sessions') && change.includes('Active')) {
        changeElement.style.color = 'var(--success)';
    }
    
    changeElement.textContent = change;
    card.appendChild(changeElement);
    
    return card;
}

async function showAllSessionsModal(businessId: string): Promise<void> {
    
    const { getBusinessSessions, deleteSession } = await import('../../../services/chat.service');
    const { createLoadingSpinner } = await import('../../../components/loading-spinner');
    
    // 1. IMPORT CUSTOM CONFIRMATION
    const { showDeleteConfirmation } = await import('../../../components/delete-confirmation'); 

    // 2. STATE MANAGEMENT & FLAG
    let hasDeletedItems = false; // <--- The flag to track if we need a reload
    const selectedSessionIds = new Set<string>();

    const loadingContent = document.createElement('div');
    loadingContent.style.padding = '40px';
    loadingContent.style.textAlign = 'center';
    const spinner = createLoadingSpinner('Loading all sessions...');
    loadingContent.appendChild(spinner);

    // 3. MODAL CONFIGURATION WITH RELOAD LOGIC
    const modalOverlay = showModal({
        title: 'All Sessions',
        content: loadingContent,
        showCloseButton: true,
        onClose: () => {
            // If the user deleted anything, refresh the entire dashboard when they close the modal
            if (hasDeletedItems) {
                window.location.reload();
            }
        }
    });

    // INJECT DELETE BUTTON INTO HEADER
    const modalHeader = modalOverlay.querySelector('.modal-header');
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'header-delete-btn';
    deleteBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        Delete Selected
    `;
    
    const titleEl = modalHeader?.querySelector('h2');
    if (titleEl && titleEl.nextSibling) {
        modalHeader?.insertBefore(deleteBtn, titleEl.nextSibling);
    } else {
        modalHeader?.appendChild(deleteBtn);
    }

    const refreshList = async () => {
        const modalContent = modalOverlay.querySelector('.modal-content');
        if (modalContent) {
            modalContent.innerHTML = '';
            modalContent.appendChild(createLoadingSpinner('Refreshing...'));
        }
        await loadSessions();
    };

    // --- DELETE LOGIC ---
    deleteBtn.addEventListener('click', async () => {
        const count = selectedSessionIds.size;
        if (count === 0) return;

        showDeleteConfirmation({
            itemName: `${count} Selected Sessions`,
            onConfirm: async () => {
                try {
                    deleteBtn.textContent = 'Deleting...';
                    deleteBtn.disabled = true;

                    // Execute all deletions and track results
                    const deleteResults = await Promise.allSettled(
                        Array.from(selectedSessionIds).map(id => deleteSession(businessId, id))
                    );

                    // Count successes and failures
                    let successCount = 0;
                    let skippedWithLeads = 0;
                    let otherFailures = 0;

                    deleteResults.forEach((result) => {
                        if (result.status === 'fulfilled') {
                            if (result.value.success) {
                                successCount++;
                            } else if (result.value.error?.code === 'SESSION_HAS_LEADS') {
                                skippedWithLeads++;
                            } else {
                                otherFailures++;
                            }
                        } else {
                            otherFailures++;
                        }
                    });

                    // Update the flag if anything was deleted
                    if (successCount > 0) {
                        hasDeletedItems = true;
                    }

                    // Clear selection and refresh list
                    selectedSessionIds.clear();
                    deleteBtn.classList.remove('visible');
                    deleteBtn.innerHTML = `Delete Selected`;
                    deleteBtn.disabled = false;
                    
                    await refreshList();

                    // Show summary message
                    let message = '';
                    if (successCount > 0) {
                        message += `✓ ${successCount} session(s) deleted successfully.\n`;
                    }
                    if (skippedWithLeads > 0) {
                        message += ` * ${skippedWithLeads} session(s) skipped (contain leads).\n`;
                    }
                    if (otherFailures > 0) {
                        message += `✗ ${otherFailures} session(s) failed to delete.`;
                    }

                    showModal({
                        title: 'Deletion Summary',
                        content: `<p style="margin: 0; white-space: pre-line;">${message.trim()}</p>`,
                        showCloseButton: true
                    });

                } catch (error) {
                    console.error(error);
                    showModal({
                        title: 'Error',
                        content: '<p style="margin: 0;">An unexpected error occurred during deletion.</p>',
                        showCloseButton: true
                    });
                    deleteBtn.textContent = 'Delete Selected';
                    deleteBtn.disabled = false;
                }
            },
            onCancel: () => {
                console.log('Bulk delete cancelled');
            }
        });
    });

    // DATA LOADER
    const loadSessions = async () => {
        try {
            selectedSessionIds.clear();
            deleteBtn.classList.remove('visible');

            const sessions = await getBusinessSessions(businessId, undefined, 1, 100);

            const tableContainer = document.createElement('div');
            tableContainer.className = 'sessions-table';
            
            const tableHeader = document.createElement('div');
            tableHeader.className = 'table-row table-header';
            tableHeader.innerHTML = `
                <div class="table-cell"></div>
                <div class="table-cell">Session ID</div>
                <div class="table-cell">Status</div>
                <div class="table-cell">Contact</div>

            `;
            tableContainer.appendChild(tableHeader);

            if (sessions.length === 0) {
                 tableContainer.innerHTML = '<div style="padding:20px; text-align:center;">No sessions found.</div>';
            }

            sessions.forEach(session => {
                const row = document.createElement('div');
                row.className = 'table-row';
                row.style.cursor = 'pointer';

                const contact = session.contact;
                let contactDisplay = '-';
                let contactClass = 'contact-not-captured';
                
                if (contact?.email) {
                    contactDisplay = contact.email;
                    contactClass = 'contact-captured';
                } else if (contact?.phone) {
                    contactDisplay = contact.phone;
                    contactClass = 'contact-captured';
                }

                row.innerHTML = `
                    <div class="table-cell">
                        <input type="checkbox" class="row-checkbox" value="${session.sessionId}">
                    </div>
                    <div class="table-cell" title="${session.sessionId}">${session.sessionId.substring(0, 10)}...</div>
                    <div class="table-cell"><span class="status-badge status-${session.status}">${session.status}</span></div>
                 
                    <div class="table-cell ${contactClass}">${contactDisplay}</div>
                  
                `;

                const checkbox = row.querySelector('.row-checkbox') as HTMLInputElement;
                
                // Prevent row click when clicking checkbox
                checkbox.addEventListener('click', (e) => e.stopPropagation());

                checkbox.addEventListener('change', (e) => {
                    const checked = (e.target as HTMLInputElement).checked;
                    if (checked) {
                        selectedSessionIds.add(session.sessionId);
                    } else {
                        selectedSessionIds.delete(session.sessionId);
                    }

                    if (selectedSessionIds.size > 0) {
                        deleteBtn.classList.add('visible');
                        deleteBtn.innerHTML = `Delete (${selectedSessionIds.size})`;
                    } else {
                        deleteBtn.classList.remove('visible');
                    }
                });

                row.addEventListener('click', async () => {
                    // Note: We don't check hasDeletedItems here because single session deletion 
                    // handles its own reload inside session-details-modal if you updated that too.
                    // If not, simply closing this main modal will trigger the reload anyway.
                    await showSessionDetailsModal(businessId, session.sessionId);
                });

                tableContainer.appendChild(row);
            });

            const modalContent = modalOverlay.querySelector('.modal-content');
            if (modalContent) {
                modalContent.innerHTML = '';
                modalContent.appendChild(tableContainer);
            }
        } catch (error) {
            console.error('Failed to load sessions:', error);
            const modalContent = modalOverlay.querySelector('.modal-content');
            if (modalContent) {
                modalContent.innerHTML = '<p class="error-message">Failed to load sessions.</p>';
            }
        }
    };

    await loadSessions();
}

async function showAllLeadsModal(businessId: string): Promise<void> {
    const { showModal } = await import('../../../components/modal');
    const { getBusinessLeads } = await import('../../../services/chat.service');
    const { createLoadingSpinner } = await import('../../../components/loading-spinner');

    const loadingContent = document.createElement('div');
    loadingContent.style.padding = '40px';
    loadingContent.style.textAlign = 'center';
    const spinner = createLoadingSpinner('Loading all leads...');
    loadingContent.appendChild(spinner);

    const modal = showModal({
        title: 'All Leads',
        content: loadingContent,
        showCloseButton: true
    });

    try {
        const leads = await getBusinessLeads(businessId, undefined, 1, 100);

        const wrapper = document.createElement('div');

        const exportBtn = document.createElement('button');
        exportBtn.textContent = 'Export All to CSV 📥';
        exportBtn.className = 'btn-secondary';
        exportBtn.style.marginBottom = '15px';
        exportBtn.addEventListener('click', () => {
            exportLeadsToCSV(leads);
        });
        wrapper.appendChild(exportBtn);

        const tableContainer = document.createElement('div');
        tableContainer.className = 'leads-table';

        const tableHeader = document.createElement('div');
        tableHeader.className = 'table-row table-header';
        tableHeader.innerHTML = `
            <div class="table-cell">Session ID</div>
            <div class="table-cell">Contact</div>
            <div class="table-cell">Captured At</div>
        `;
        tableContainer.appendChild(tableHeader);

        leads.forEach(lead => {
            const row = document.createElement('div');
            row.className = 'table-row';
            row.style.cursor = 'pointer';

            row.innerHTML = `
                <div class="table-cell" title="${lead.firstSessionId}">${lead.firstSessionId.substring(0, 10)}...</div>
                <div class="table-cell">${lead.email || '-'}</div>
                <div class="table-cell">${formatDateTime(lead.firstContactDate)}</div>
            `;

            row.addEventListener('click', () => {
                showLeadDetailsModal(lead, businessId);
            });

            tableContainer.appendChild(row);
        });

        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.innerHTML = '';
            modalContent.appendChild(wrapper); 
            modalContent.appendChild(tableContainer);
        }
    } catch (error) {
        console.error('Failed to load leads:', error);
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.innerHTML = '<p class="error-message">Failed to load leads.</p>';
        }
    }
}

function exportLeadsToCSV(leads: any[]): void {
    const headers = ['Session ID', 'Name', 'Email', 'Phone', 'Captured At'];
    
    const rows = leads.map(lead => [
        lead.firstSessionId,
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        formatDateTime(lead.firstContactDate)
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `leads-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}