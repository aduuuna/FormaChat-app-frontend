import { createBreadcrumb } from '../../components/breadcrumb';
import { createLoadingSpinner, hideLoadingSpinner } from '../../components/loading-spinner';
import { getCurrentUser } from '../../services/auth.service';
import { getUser, saveUser } from '../../utils/auth.utils';
import { apiPut } from '../../utils/api.utils';
import { AUTH_ENDPOINTS } from '../../config/api.config';
import { showToast } from '../../utils/toast';

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
        } catch {
          showToast('Failed to save changes. Please try again.', 'error');
        } finally {
          saveProfileBtn.disabled = false;
          saveProfileBtn.textContent = 'Save Changes';
        }
      });
      profileCard.appendChild(saveProfileBtn);
      page.appendChild(profileCard);

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
          const res = await apiPut(AUTH_ENDPOINTS.PASSWORD_CHANGE, { currentPassword, newPassword });
          if ((res as any).success) {
            currentPwInput.value = '';
            newPwInput.value = '';
            showToast('Password changed successfully.', 'success');
          } else {
            showToast((res as any).error?.message || 'Failed to change password.', 'error');
          }
        } catch {
          showToast('Failed to change password. Please try again.', 'error');
        } finally {
          changePwBtn.disabled = false;
          changePwBtn.textContent = 'Change Password';
        }
      });
      pwCard.appendChild(changePwBtn);
      page.appendChild(pwCard);

    } catch {
      hideLoadingSpinner(spinner);
      const err = document.createElement('p');
      err.textContent = 'Failed to load account details. Please refresh.';
      err.style.color = '#dc2626';
      page.appendChild(err);
    }
  })();

  return wrapper;
}
