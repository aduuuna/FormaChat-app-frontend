import { login } from '../../services/auth.service';
import { saveTokens, saveUser } from '../../utils/auth.utils';

function injectLoginStyles() {
   
    if (document.getElementById('login-page-styles')) return;

    const style = document.createElement('style');
    style.id = 'login-page-styles';
    style.textContent = `
        :root {
            --primary: #636b2f; /* Dark Green/Olive */
            --secondary: #bac095; /* Light Olive */
            --text-main: #1a1a1a;
            --text-muted: #666;
            --error-red: #dc3545;
            --bg-light: #f7f9fb;
        }

        /* 1. Main Container (Glassmorphism Card) */
        .login-container {
            max-width: 400px;
            margin: 60px auto; /* Slightly more top margin for breathing room */
            padding: 40px 30px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            animation: floatUp 0.6s ease-out forwards;
            opacity: 0;
            transform: translateY(20px);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        @keyframes floatUp {
            to { opacity: 1; transform: translateY(0); }
        }

        /* 2. Typography */
        .login-title {
            font-size: 2rem;
            font-weight: 800;
            color: var(--primary);
            margin: 0 0 10px 0;
            text-align: center;
            letter-spacing: -0.5px;
        }
        
        .login-subtitle {
            text-align: center;
            color: var(--text-muted);
            margin-bottom: 30px;
            font-size: 0.95rem;
        }

        /* 3. Form Fields */
        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--text-main);
            font-size: 0.9rem;
        }

        .form-input {
            width: 100%;
            padding: 12px 16px;
            box-sizing: border-box;
            border: 1px solid #e1e1e1;
            border-radius: 8px;
            background: var(--bg-light);
            transition: all 0.2s ease;
            font-size: 1rem;
            color: var(--text-main);
        }

        .form-input:focus {
            border-color: var(--primary);
            background: white;
            box-shadow: 0 0 0 4px rgba(99, 107, 47, 0.1);
            outline: none;
        }

        /* 4. Buttons */
        .btn-submit {
            width: 100%;
            padding: 14px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-top: 10px;
            box-shadow: 0 4px 6px rgba(99, 107, 47, 0.2);
        }

        .btn-submit:hover:not(:disabled) {
            background: #4f5625;
            transform: translateY(-1px);
            box-shadow: 0 6px 12px rgba(99, 107, 47, 0.3);
        }

        .btn-submit:disabled {
            opacity: 0.7;
            cursor: wait;
        }

        /* 5. Messages & Links */
        .error-message {
            background: rgba(220, 53, 69, 0.1);
            color: var(--error-red);
            padding: 12px;
            border-radius: 6px;
            font-size: 0.9rem;
            margin-bottom: 20px;
            border-left: 3px solid var(--error-red);
            line-height: 1.4;
        }

        .register-link {
            margin-top: 25px;
            text-align: center;
            font-size: 0.9rem;
            color: var(--text-muted);
        }

        .register-link a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
            transition: color 0.2s;
        }

        .register-link a:hover {
            color: #4f5625;
            text-decoration: underline;
        }

         /* Password Toggle Button */
        .password-toggle-btn {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted);
            transition: color 0.2s ease;
        }

        .password-toggle-btn:hover {
            color: var(--primary);
        }

        .password-toggle-btn:focus {
            outline: none;
        }

        .eye-icon {
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
}

export function renderLogin(): HTMLElement {
    injectLoginStyles();

    const container = document.createElement('div');
    container.className = 'login-container';

    const title = document.createElement('h1');
    title.textContent = 'Welcome Back'; 
    title.className = 'login-title';
    container.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.textContent = 'Please enter your details to sign in.';
    subtitle.className = 'login-subtitle';
    container.appendChild(subtitle);

    const form = document.createElement('form');

    // === EMAIL FIELD ===
    const emailDiv = document.createElement('div');
    emailDiv.className = 'form-group';

    const emailLabel = document.createElement('label');
    emailLabel.textContent = 'Email';
    emailLabel.className = 'form-label';
    emailDiv.appendChild(emailLabel);

    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.name = 'email';
    emailInput.required = true;
    emailInput.className = 'form-input';
    emailInput.placeholder = 'name@company.com'; 
    emailDiv.appendChild(emailInput);

    form.appendChild(emailDiv);

    // === PASSWORD FIELD WITH TOGGLE ===
    const passwordDiv = document.createElement('div');
    passwordDiv.className = 'form-group';

    const passwordLabel = document.createElement('label');
    passwordLabel.textContent = 'Password';
    passwordLabel.className = 'form-label';
    passwordDiv.appendChild(passwordLabel);

    // Create wrapper for input + toggle button
    const inputWrapper = document.createElement('div');
    inputWrapper.style.position = 'relative';

    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.name = 'password';
    passwordInput.required = true;
    passwordInput.className = 'form-input';
    passwordInput.placeholder = 'password';
    passwordInput.style.paddingRight = '45px'; // Make room for the icon

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'password-toggle-btn';
    toggleBtn.innerHTML = `
        <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
    `;

    toggleBtn.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            // Show password → use open eye
            passwordInput.type = 'text';
            toggleBtn.innerHTML = `
                <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            `;
        } else {
            // Hide password → use crossed eye
            passwordInput.type = 'password';
            toggleBtn.innerHTML = `
                <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
            `;
        }
    });

    inputWrapper.appendChild(passwordInput);
    inputWrapper.appendChild(toggleBtn);
    passwordDiv.appendChild(inputWrapper);

    form.appendChild(passwordDiv);

    // === ERROR MESSAGE ===
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.display = 'none';
    form.appendChild(errorDiv);

    // === SUBMIT BUTTON ===
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Sign In'; 
    submitBtn.className = 'btn-submit';
    form.appendChild(submitBtn);

    // === FORM SUBMISSION ===
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        errorDiv.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying...';

        try {
            const response = await login({ email, password });

            if (!response.success) {
             
                if (response.error.code === 'EMAIL_NOT_VERIFIED') {
                    errorDiv.innerHTML = '<strong>Account not verified.</strong><br/>Redirecting to verification...';
                    errorDiv.style.display = 'block';

                    sessionStorage.setItem('pendingVerificationEmail', email);

                    setTimeout(() => {
                        window.location.hash = '#/verify-email';
                    }, 1500);
                    return;
                }

                errorDiv.textContent = response.error.message || 'Invalid email or password.';
                errorDiv.style.display = 'block';
                return;
            }

            submitBtn.textContent = 'Success!';
            submitBtn.style.background = '#28a745';
            
            saveTokens(response.data.tokens);
            saveUser(response.data.user);

            setTimeout(() => {
                window.location.hash = '#/dashboard';
            }, 500);

        } catch (error: any) {
            errorDiv.textContent = 'An unexpected error occurred. Please try again.';
            errorDiv.style.display = 'block';
            console.error('Login error:', error);
        } finally {
         
            if (submitBtn.textContent !== 'Success!') {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }
        }
    });

    container.appendChild(form);

    // === REGISTER LINK ===
    const registerLink = document.createElement('p');
    registerLink.className = 'register-link';
    registerLink.innerHTML = `Don't have an account? <a href="#/register">Create one now</a>`;
    container.appendChild(registerLink);

    return container;
}