import { createBreadcrumb } from '../../components/breadcrumb';
import { createLoadingSpinner, hideLoadingSpinner } from '../../components/loading-spinner';
import { getCurrentUser, enableTwoFactor, disableTwoFactor, revokeOtherSessions } from '../../services/auth.service';
import { getUser, saveUser, logout as clearLocalAuth } from '../../utils/auth.utils';
import { apiPut, apiGet, apiDelete } from '../../utils/api.utils';
import { AUTH_ENDPOINTS } from '../../config/api.config';
import { showToast } from '../../utils/toast';

type SettingsTab = 'account' | 'sessions' | 'security';

interface SessionInfo {
  id: string;
  deviceInfo: { userAgent: string; ipAddress: string };
  createdAt: string;
  expiresAt: string;
}

function describeDevice(userAgent: string): string {
  if (!userAgent) return 'Unknown device';
  const ua = userAgent.toLowerCase();
  let browser = 'Unknown browser';
  if (ua.includes('edg/')) browser = 'Edge';
  else if (ua.includes('chrome/')) browser = 'Chrome';
  else if (ua.includes('firefox/')) browser = 'Firefox';
  else if (ua.includes('safari/')) browser = 'Safari';

  let os = 'Unknown OS';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac os')) os = 'macOS';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  else if (ua.includes('linux')) os = 'Linux';

  return `${browser} on ${os}`;
}

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value;
  }
}

function injectSettingsStyles() {
  if (document.getElementById('settings-page-styles')) return;
  const style = document.createElement('style');
  style.id = 'settings-page-styles';
  style.textContent = `
    .settings-page {
      max-width: 700px;
      margin: 0 auto;
      padding: 20px 16px 60px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .settings-card {
      background: rgba(255,255,255,0.95);
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.5);
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      padding: 28px 30px;
      margin-bottom: 20px;
    }
    .settings-card-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 20px 0;
      padding-bottom: 14px;
      border-bottom: 1px solid #f0f0f0;
    }
    .settings-field { margin-bottom: 16px; }
    .settings-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #444;
      margin-bottom: 6px;
    }
    .settings-input {
      width: 100%;
      padding: 11px 14px;
      box-sizing: border-box;
      border: 1px solid #e1e1e1;
      border-radius: 8px;
      background: #f7f9fb;
      font-size: 0.95rem;
      color: #1a1a1a;
      transition: border-color 0.2s;
    }
    .settings-input:focus { outline: none; border-color: #636b2f; background: #fff; }
    .settings-input:disabled { background: #f0f0f0; color: #999; cursor: not-allowed; }
    .settings-btn {
      padding: 11px 22px;
      background: #636b2f;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }
    .settings-btn:hover { background: #4a5122; }
    .settings-btn:disabled { opacity: 0.65; cursor: not-allowed; }
    .settings-btn-danger {
      padding: 11px 22px;
      background: #fff;
      color: #dc2626;
      border: 1px solid #dc2626;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .settings-btn-danger:hover { background: #dc2626; color: #fff; }
    .settings-hint {
      font-size: 0.8rem;
      color: #888;
      margin-top: 4px;
    }
    .settings-card-danger {
      border: 1px solid #fecaca;
    }
    .settings-card-danger .settings-card-title {
      color: #dc2626;
    }
    .session-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .session-row:last-child { border-bottom: none; }
    .session-device {
      font-size: 0.92rem;
      font-weight: 600;
      color: #1a1a1a;
    }
    .session-meta {
      font-size: 0.78rem;
      color: #888;
      margin-top: 2px;
    }
    .session-revoke-btn {
      padding: 7px 14px;
      background: #fff;
      color: #dc2626;
      border: 1px solid #dc2626;
      border-radius: 7px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
    }
    .session-revoke-btn:hover { background: #dc2626; color: #fff; }
    .session-revoke-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 700;
    }
    .status-badge-on { background: #e8f5e9; color: #2e7d32; }
    .status-badge-off { background: #f0f0f0; color: #666; }

    .settings-tab-bar {
      display: flex; gap: 4px; border-bottom: 2px solid #e5e7eb; margin-bottom: 24px;
      overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none;
    }
    .settings-tab-bar::-webkit-scrollbar { display: none; }
    .settings-tab-btn {
      padding: 10px 18px; font-weight: 700; font-size: 0.9rem; color: #666;
      background: none; border: none; border-bottom: 2px solid transparent;
      margin-bottom: -2px; white-space: nowrap; cursor: pointer; transition: color 0.15s;
      font-family: inherit;
    }
    .settings-tab-btn:hover { color: #4a5122; }
    .settings-tab-btn.active { color: #636b2f; border-bottom-color: #636b2f; }
    .settings-tab-panel { display: none; }
    .settings-tab-panel.active { display: block; }

    @media (max-width: 600px) {
      .settings-tab-btn { padding: 10px 14px; font-size: 0.85rem; }
    }
  `;
  document.head.appendChild(style);
}

export function renderSettingsPage(): HTMLElement {
  injectSettingsStyles();

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'min-height:100vh; background:#f5f5f5; padding-top:72px;';

  const page = document.createElement('div');
  page.className = 'settings-page';

  const breadcrumb = createBreadcrumb([
    { label: 'Home', path: '#/dashboard' },
    { label: 'Settings' },
  ]);
  breadcrumb.style.marginBottom = '28px';
  page.appendChild(breadcrumb);

  const spinner = createLoadingSpinner();
  page.appendChild(spinner);

  wrapper.appendChild(page);

  // ---- Tab bar + panels (built once content loads) ----
  const TABS: Array<{ id: SettingsTab; label: string }> = [
    { id: 'account', label: 'Account' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'security', label: 'Security' },
  ];

  const tabBar = document.createElement('div');
  tabBar.className = 'settings-tab-bar';

  const panels: Record<SettingsTab, HTMLElement> = {
    account: document.createElement('div'),
    sessions: document.createElement('div'),
    security: document.createElement('div'),
  };

  const tabButtons: Record<SettingsTab, HTMLButtonElement> = {} as any;

  const setActiveTab = (tab: SettingsTab) => {
    (Object.keys(panels) as SettingsTab[]).forEach((id) => {
      panels[id].classList.toggle('active', id === tab);
      tabButtons[id].classList.toggle('active', id === tab);
    });
  };

  TABS.forEach(({ id, label }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'settings-tab-btn';
    btn.textContent = label;
    btn.addEventListener('click', () => setActiveTab(id));
    tabBar.appendChild(btn);
    tabButtons[id] = btn;

    panels[id].className = 'settings-tab-panel';
  });

  // Load user data then render
  (async () => {
    try {
      const response = await getCurrentUser();
      hideLoadingSpinner(spinner);

      if (!response.success) {
        const err = document.createElement('p');
        err.textContent = 'Failed to load account details.';
        err.style.color = '#dc2626';
        page.appendChild(err);
        return;
      }

      const user = response.data;

      page.appendChild(tabBar);
      (Object.keys(panels) as SettingsTab[]).forEach((id) => page.appendChild(panels[id]));
      setActiveTab('account');

      // ---- Profile card ----
      const profileCard = document.createElement('div');
      profileCard.className = 'settings-card';

      const profileTitle = document.createElement('h2');
      profileTitle.className = 'settings-card-title';
      profileTitle.textContent = 'Profile';
      profileCard.appendChild(profileTitle);

      const fnField = document.createElement('div');
      fnField.className = 'settings-field';
      const fnLabel = document.createElement('label');
      fnLabel.className = 'settings-label';
      fnLabel.textContent = 'First name';
      const fnInput = document.createElement('input');
      fnInput.className = 'settings-input';
      fnInput.type = 'text';
      fnInput.value = user.firstName || '';
      fnField.appendChild(fnLabel);
      fnField.appendChild(fnInput);
      profileCard.appendChild(fnField);

      const lnField = document.createElement('div');
      lnField.className = 'settings-field';
      const lnLabel = document.createElement('label');
      lnLabel.className = 'settings-label';
      lnLabel.textContent = 'Last name';
      const lnInput = document.createElement('input');
      lnInput.className = 'settings-input';
      lnInput.type = 'text';
      lnInput.value = user.lastName || '';
      lnField.appendChild(lnLabel);
      lnField.appendChild(lnInput);
      profileCard.appendChild(lnField);

      const emailField = document.createElement('div');
      emailField.className = 'settings-field';
      const emailLabel = document.createElement('label');
      emailLabel.className = 'settings-label';
      emailLabel.textContent = 'Email';
      const emailInput = document.createElement('input');
      emailInput.className = 'settings-input';
      emailInput.type = 'email';
      emailInput.value = user.email || '';
      emailInput.disabled = true;
      const emailHint = document.createElement('p');
      emailHint.className = 'settings-hint';
      emailHint.textContent = 'Email address cannot be changed.';
      emailField.appendChild(emailLabel);
      emailField.appendChild(emailInput);
      emailField.appendChild(emailHint);
      profileCard.appendChild(emailField);

      const saveProfileBtn = document.createElement('button');
      saveProfileBtn.className = 'settings-btn';
      saveProfileBtn.textContent = 'Save Changes';
      saveProfileBtn.addEventListener('click', async () => {
        const firstName = fnInput.value.trim();
        const lastName = lnInput.value.trim();
        if (!firstName || !lastName) {
          showToast('First name and last name are required.', 'error');
          return;
        }
        saveProfileBtn.disabled = true;
        saveProfileBtn.textContent = 'Saving...';
        try {
          const res = await apiPut(AUTH_ENDPOINTS.PROFILE, { firstName, lastName });
          if ((res as any).success) {
            // Update stored user
            const stored = getUser();
            if (stored) saveUser({ ...stored, firstName, lastName });
            showToast('Profile updated successfully.', 'success');
          } else {
            showToast((res as any).error?.message || 'Failed to save changes.', 'error');
          }
        } catch (error: any) {
          showToast(error?.message || 'Failed to save changes. Please try again.', 'error');
        } finally {
          saveProfileBtn.disabled = false;
          saveProfileBtn.textContent = 'Save Changes';
        }
      });
      profileCard.appendChild(saveProfileBtn);
      panels.account.appendChild(profileCard);

      // ---- Change password card ----
      const pwCard = document.createElement('div');
      pwCard.className = 'settings-card';

      const pwTitle = document.createElement('h2');
      pwTitle.className = 'settings-card-title';
      pwTitle.textContent = 'Change Password';
      pwCard.appendChild(pwTitle);

      const currentPwField = document.createElement('div');
      currentPwField.className = 'settings-field';
      const currentPwLabel = document.createElement('label');
      currentPwLabel.className = 'settings-label';
      currentPwLabel.textContent = 'Current password';
      const currentPwInput = document.createElement('input');
      currentPwInput.className = 'settings-input';
      currentPwInput.type = 'password';
      currentPwInput.placeholder = 'Enter current password';
      currentPwField.appendChild(currentPwLabel);
      currentPwField.appendChild(currentPwInput);
      pwCard.appendChild(currentPwField);

      const newPwField = document.createElement('div');
      newPwField.className = 'settings-field';
      const newPwLabel = document.createElement('label');
      newPwLabel.className = 'settings-label';
      newPwLabel.textContent = 'New password';
      const newPwInput = document.createElement('input');
      newPwInput.className = 'settings-input';
      newPwInput.type = 'password';
      newPwInput.placeholder = 'At least 8 characters';
      const newPwHint = document.createElement('p');
      newPwHint.className = 'settings-hint';
      newPwHint.textContent = 'Use at least one uppercase letter, number, and special character.';
      newPwField.appendChild(newPwLabel);
      newPwField.appendChild(newPwInput);
      newPwField.appendChild(newPwHint);
      pwCard.appendChild(newPwField);

      const changePwBtn = document.createElement('button');
      changePwBtn.className = 'settings-btn';
      changePwBtn.textContent = 'Change Password';
      changePwBtn.addEventListener('click', async () => {
        const currentPassword = currentPwInput.value;
        const newPassword = newPwInput.value;
        if (!currentPassword || !newPassword) {
          showToast('Both fields are required.', 'error');
          return;
        }
        if (newPassword.length < 8) {
          showToast('New password must be at least 8 characters.', 'error');
          return;
        }
        changePwBtn.disabled = true;
        changePwBtn.textContent = 'Saving...';
        try {
          const res = await apiPut(AUTH_ENDPOINTS.PASSWORD_CHANGE, { currentPassword, newPassword, confirmPassword: newPassword });
          if ((res as any).success) {
            currentPwInput.value = '';
            newPwInput.value = '';
            showToast('Password changed successfully.', 'success');
          } else {
            showToast((res as any).error?.message || 'Failed to change password.', 'error');
          }
        } catch (error: any) {
          showToast(error?.message || 'Failed to change password. Please try again.', 'error');
        } finally {
          changePwBtn.disabled = false;
          changePwBtn.textContent = 'Change Password';
        }
      });
      pwCard.appendChild(changePwBtn);
      panels.security.appendChild(pwCard);

      // ---- Two-factor authentication card ----
      const tfaCard = document.createElement('div');
      tfaCard.className = 'settings-card';

      const tfaTitle = document.createElement('h2');
      tfaTitle.className = 'settings-card-title';
      tfaTitle.textContent = 'Two-Factor Authentication';
      tfaCard.appendChild(tfaTitle);

      let twoFactorEnabled = !!user.twoFactorEnabled;

      const tfaStatusRow = document.createElement('p');
      tfaStatusRow.style.cssText = 'margin:0 0 16px 0; font-size:0.9rem; color:#444;';
      const tfaStatusBadge = document.createElement('span');
      tfaStatusBadge.className = twoFactorEnabled ? 'status-badge status-badge-on' : 'status-badge status-badge-off';
      tfaStatusBadge.textContent = twoFactorEnabled ? 'Enabled' : 'Disabled';
      tfaStatusRow.textContent = 'Status: ';
      tfaStatusRow.appendChild(tfaStatusBadge);
      tfaCard.appendChild(tfaStatusRow);

      const tfaHint = document.createElement('p');
      tfaHint.className = 'settings-hint';
      tfaHint.style.marginBottom = '16px';
      tfaHint.textContent = 'When enabled, we will email you a 6-digit code to enter every time you sign in.';
      tfaCard.appendChild(tfaHint);

      const tfaField = document.createElement('div');
      tfaField.className = 'settings-field';
      const tfaLabel = document.createElement('label');
      tfaLabel.className = 'settings-label';
      tfaLabel.textContent = 'Current password';
      const tfaPwInput = document.createElement('input');
      tfaPwInput.className = 'settings-input';
      tfaPwInput.type = 'password';
      tfaPwInput.placeholder = 'Enter current password to confirm';
      tfaField.appendChild(tfaLabel);
      tfaField.appendChild(tfaPwInput);
      tfaCard.appendChild(tfaField);

      const tfaToggleBtn = document.createElement('button');
      tfaToggleBtn.className = 'settings-btn';
      tfaToggleBtn.textContent = twoFactorEnabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication';
      tfaToggleBtn.addEventListener('click', async () => {
        const password = tfaPwInput.value;
        if (!password) {
          showToast('Please enter your password to confirm.', 'error');
          return;
        }
        tfaToggleBtn.disabled = true;
        tfaToggleBtn.textContent = 'Saving...';
        try {
          const res = twoFactorEnabled ? await disableTwoFactor(password) : await enableTwoFactor(password);
          if ((res as any).success) {
            twoFactorEnabled = !twoFactorEnabled;
            tfaPwInput.value = '';
            tfaStatusBadge.className = twoFactorEnabled ? 'status-badge status-badge-on' : 'status-badge status-badge-off';
            tfaStatusBadge.textContent = twoFactorEnabled ? 'Enabled' : 'Disabled';
            tfaToggleBtn.textContent = twoFactorEnabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication';
            showToast(twoFactorEnabled ? 'Two-factor authentication enabled.' : 'Two-factor authentication disabled.', 'success');
          } else {
            showToast((res as any).error?.message || 'Failed to update two-factor authentication.', 'error');
            tfaToggleBtn.textContent = twoFactorEnabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication';
          }
        } catch (error: any) {
          showToast(error?.message || 'Failed to update two-factor authentication. Please try again.', 'error');
          tfaToggleBtn.textContent = twoFactorEnabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication';
        } finally {
          tfaToggleBtn.disabled = false;
        }
      });
      tfaCard.appendChild(tfaToggleBtn);
      panels.security.appendChild(tfaCard);

      // ---- Active sessions card ----
      const sessionsCard = document.createElement('div');
      sessionsCard.className = 'settings-card';

      const sessionsTitleRow = document.createElement('div');
      sessionsTitleRow.style.cssText = 'display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:20px; padding-bottom:14px; border-bottom:1px solid #f0f0f0;';

      const sessionsTitle = document.createElement('h2');
      sessionsTitle.className = 'settings-card-title';
      sessionsTitle.style.cssText = 'margin:0; padding:0; border:none;';
      sessionsTitle.textContent = 'Active Sessions';
      sessionsTitleRow.appendChild(sessionsTitle);

      const revokeOthersBtn = document.createElement('button');
      revokeOthersBtn.className = 'settings-btn-danger';
      revokeOthersBtn.style.cssText = 'padding:8px 16px; font-size:0.82rem;';
      revokeOthersBtn.textContent = 'Sign out of all other devices';
      sessionsTitleRow.appendChild(revokeOthersBtn);

      sessionsCard.appendChild(sessionsTitleRow);

      const sessionsHint = document.createElement('p');
      sessionsHint.className = 'settings-hint';
      sessionsHint.style.marginBottom = '12px';
      sessionsHint.textContent = 'Every device currently signed in to your account. Sign out individual devices below, or sign out everywhere except here.';
      sessionsCard.appendChild(sessionsHint);

      const sessionsList = document.createElement('div');
      sessionsCard.appendChild(sessionsList);
      panels.sessions.appendChild(sessionsCard);

      const renderSessions = async () => {
        sessionsList.innerHTML = '';
        const loadingMsg = document.createElement('p');
        loadingMsg.className = 'settings-hint';
        loadingMsg.textContent = 'Loading sessions...';
        sessionsList.appendChild(loadingMsg);

        try {
          const sessionsRes = await apiGet<SessionInfo[]>(AUTH_ENDPOINTS.SESSIONS);
          sessionsList.innerHTML = '';

          if (!sessionsRes.success || !sessionsRes.data || sessionsRes.data.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'settings-hint';
            empty.textContent = 'No active sessions found.';
            sessionsList.appendChild(empty);
            return;
          }

          sessionsRes.data.forEach((session) => {
            const row = document.createElement('div');
            row.className = 'session-row';

            const info = document.createElement('div');
            const device = document.createElement('div');
            device.className = 'session-device';
            device.textContent = describeDevice(session.deviceInfo?.userAgent);
            const meta = document.createElement('div');
            meta.className = 'session-meta';
            meta.textContent = `${session.deviceInfo?.ipAddress || 'Unknown IP'} · Signed in ${formatDate(session.createdAt)}`;
            info.appendChild(device);
            info.appendChild(meta);
            row.appendChild(info);

            const revokeBtn = document.createElement('button');
            revokeBtn.className = 'session-revoke-btn';
            revokeBtn.textContent = 'Sign out';
            revokeBtn.addEventListener('click', async () => {
              revokeBtn.disabled = true;
              revokeBtn.textContent = 'Signing out...';
              try {
                const revokeRes = await apiDelete(AUTH_ENDPOINTS.SESSION_REVOKE(session.id));
                if ((revokeRes as any).success) {
                  showToast('Session signed out.', 'success');
                  await renderSessions();
                } else {
                  showToast((revokeRes as any).error?.message || 'Failed to sign out session.', 'error');
                  revokeBtn.disabled = false;
                  revokeBtn.textContent = 'Sign out';
                }
              } catch (error: any) {
                showToast(error?.message || 'Failed to sign out session. Please try again.', 'error');
                revokeBtn.disabled = false;
                revokeBtn.textContent = 'Sign out';
              }
            });
            row.appendChild(revokeBtn);

            sessionsList.appendChild(row);
          });
        } catch (error: any) {
          sessionsList.innerHTML = '';
          const err = document.createElement('p');
          err.className = 'settings-hint';
          err.textContent = error?.message || 'Failed to load sessions.';
          sessionsList.appendChild(err);
        }
      };

      revokeOthersBtn.addEventListener('click', async () => {
        if (!window.confirm('Sign out of every other device? This device stays signed in.')) {
          return;
        }
        revokeOthersBtn.disabled = true;
        revokeOthersBtn.textContent = 'Signing out...';
        try {
          const res = await revokeOtherSessions();
          if ((res as any).success) {
            showToast('Signed out of all other devices.', 'success');
            await renderSessions();
          } else {
            showToast((res as any).error?.message || 'Failed to sign out other devices.', 'error');
          }
        } catch (error: any) {
          showToast(error?.message || 'Failed to sign out other devices. Please try again.', 'error');
        } finally {
          revokeOthersBtn.disabled = false;
          revokeOthersBtn.textContent = 'Sign out of all other devices';
        }
      });

      await renderSessions();

      // ---- Danger zone: deactivate account ----
      const dangerCard = document.createElement('div');
      dangerCard.className = 'settings-card settings-card-danger';

      const dangerTitle = document.createElement('h2');
      dangerTitle.className = 'settings-card-title';
      dangerTitle.textContent = 'Deactivate Account';
      dangerCard.appendChild(dangerTitle);

      const dangerHint = document.createElement('p');
      dangerHint.className = 'settings-hint';
      dangerHint.style.marginBottom = '16px';
      dangerHint.textContent = 'This signs you out everywhere and deactivates your account immediately. Log back in any time within 30 days to reactivate automatically. After 30 days your account and data are permanently deleted, and this email address can no longer be used to create a new account.';
      dangerCard.appendChild(dangerHint);

      const deleteField = document.createElement('div');
      deleteField.className = 'settings-field';
      const deleteLabel = document.createElement('label');
      deleteLabel.className = 'settings-label';
      deleteLabel.textContent = 'Current password';
      const deleteInput = document.createElement('input');
      deleteInput.className = 'settings-input';
      deleteInput.type = 'password';
      deleteInput.placeholder = 'Enter current password';
      deleteField.appendChild(deleteLabel);
      deleteField.appendChild(deleteInput);
      dangerCard.appendChild(deleteField);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'settings-btn-danger';
      deleteBtn.textContent = 'Deactivate Account';
      deleteBtn.addEventListener('click', async () => {
        const password = deleteInput.value;
        if (!password) {
          showToast('Please enter your password to confirm.', 'error');
          return;
        }
        if (!window.confirm('Deactivate your account? You can reactivate by logging back in within 30 days. After that, your account is permanently deleted.')) {
          return;
        }
        deleteBtn.disabled = true;
        deleteBtn.textContent = 'Deactivating...';
        try {
          const res = await apiDelete(AUTH_ENDPOINTS.PROFILE, { body: JSON.stringify({ password }) });
          if ((res as any).success) {
            showToast('Account deactivated. Signing you out...', 'success');
            clearLocalAuth();
            setTimeout(() => { window.location.hash = '#/login'; }, 1500);
          } else {
            showToast((res as any).error?.message || 'Failed to deactivate account.', 'error');
            deleteBtn.disabled = false;
            deleteBtn.textContent = 'Deactivate Account';
          }
        } catch (error: any) {
          showToast(error?.message || 'Failed to deactivate account. Please try again.', 'error');
          deleteBtn.disabled = false;
          deleteBtn.textContent = 'Deactivate Account';
        }
      });
      dangerCard.appendChild(deleteBtn);
      panels.account.appendChild(dangerCard);

    } catch (error: any) {
      hideLoadingSpinner(spinner);
      const err = document.createElement('p');
      err.textContent = error?.message || 'Failed to load account details. Please refresh.';
      err.style.color = '#dc2626';
      page.appendChild(err);
    }
  })();

  return wrapper;
}
