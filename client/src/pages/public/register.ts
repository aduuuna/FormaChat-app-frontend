import { register } from '../../services/auth.service';
import { showToast } from '../../utils/toast';
import { attachPasswordToggle } from '../../utils/password-field.utils';

function injectRegisterStyles() {
    const style = document.createElement('style');
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
        .register-container {
            max-width: 400px;
            margin: 10px auto;
            padding: 30px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(8px);
            border-radius: 16px;
            border: 1px solid rgba(220, 220, 220, 0.5);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            animation: fadeIn 0.5s ease-out;
            color: var(--text-main);
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* 2. Typography */
        .register-title {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 20px;
            text-align: center;
        }

        /* 3. Form Fields & Inputs */
        .form-field {
            margin-bottom: 10px;
        }

        .form-label {
            display: block;
            margin-bottom: 6px;
            font-weight: 600;
            font-size: 0.9rem;
        }

        .form-input {
            width: 100%;
            padding: 12px;
            box-sizing: border-box;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: var(--bg-light);
            transition: all 0.3s ease;
            font-size: 1rem;
            color: black;
        }

        .form-input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99, 107, 47, 0.15); /* Primary color glow */
            outline: none;
            background: white;
        }

        /* 4. Buttons */
        .btn {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 10px;
        }
        
        /* Register Button */
        .btn-primary {
            background: var(--primary);
            color: white;
        }

        .btn-primary:hover:not(:disabled) {
            background: #4f5625; /* Darker shade of primary */
            box-shadow: 0 6px 10px rgba(99, 107, 47, 0.3);
        }
        
        /* Resend Button (Secondary/Ghost) */
        .btn-secondary {
            background: white;
            color: var(--primary);
            border: 1px solid var(--primary);
            box-shadow: none;
        }

        .btn-secondary:hover:not(:disabled) {
            background: var(--bg-light);
            color: #4f5625;
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            box-shadow: none;
        }

        /* 5. Messages and Links */
        .login-link a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
        }

        .login-link a:hover {
            text-decoration: underline;
        }

    `;
    document.head.appendChild(style);
}

export function renderRegister(): HTMLElement {

    if (!document.head.querySelector('style[data-register-styles]')) {
        injectRegisterStyles();
    }

    const container = document.createElement('div');
    container.className = 'register-container'; 

    const title = document.createElement('h1');
    title.className = 'register-title'; 
    title.textContent = 'Create Your Account';
    container.appendChild(title);

    const registerForm = createRegisterForm();
    container.appendChild(registerForm);

    const loginLink = document.createElement('p');
    loginLink.className = 'login-link'; 
    loginLink.style.cssText = 'margin-top: 20px; text-align: center;';
    loginLink.innerHTML = `Already have an account? <a href="#/login">Login</a>`;
    container.appendChild(loginLink);

    return container;
}

function createRegisterForm(): HTMLElement {
    const form = document.createElement('form');

    const firstNameDiv = createFormField('text', 'firstName', 'First Name', true);
    form.appendChild(firstNameDiv);

    const lastNameDiv = createFormField('text', 'lastName', 'Last Name', true);
    form.appendChild(lastNameDiv);

 
    const emailDiv = createFormField('email', 'email', 'Email', true);
    form.appendChild(emailDiv);

    const passwordDiv = createFormField('password', 'password', 'Password', true);
    const passwordInput = passwordDiv.querySelector('input') as HTMLInputElement;
    passwordInput.minLength = 8;
    
    const passwordHint = document.createElement('small');
    passwordHint.innerHTML = 'Use at least one uppercase, lowercase, number, and special character';
    passwordHint.style.cssText = 'color: var(--text-muted); display: block; margin-top: 5px;';
    passwordDiv.appendChild(passwordHint);
    
    form.appendChild(passwordDiv);

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Create Free Account';
    submitBtn.className = 'btn btn-primary';
    form.appendChild(submitBtn);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;

        if (password.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';

        try {
            const response = await register({ email, password, firstName, lastName });

            if (!response.success) {
                showToast(response.error.message || 'Registration failed', 'error');
                return;
            }

            form.style.display = 'none';
            showToast('Account created! Check your email for a verification code.', 'success');

            // Single source of truth for "enter your OTP" is verify-email.ts -
            // same localStorage handoff login.ts uses for EMAIL_NOT_VERIFIED,
            // so there's one verification flow instead of two that can drift apart.
            localStorage.setItem('pendingVerificationEmail', email);
            setTimeout(() => {
                window.location.hash = '#/verify-email';
            }, 800);

        } catch (error) {
            showToast('An unexpected error occurred', 'error');
            console.error('Register error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Free Account';
        }
    });

    return form;
}

function createFormField(type: string, name: string, label: string, required: boolean): HTMLElement {
    const div = document.createElement('div');
    div.className = 'form-field'; 

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.className = 'form-label'; 
    div.appendChild(labelEl);

    // If it's a password field, create a wrapper with toggle button
    if (type === 'password') {
        const inputWrapper = document.createElement('div');
        inputWrapper.style.position = 'relative';

        const input = document.createElement('input');
        input.type = type;
        input.name = name;
        input.required = required;
        input.className = 'form-input';

        inputWrapper.appendChild(input);
        attachPasswordToggle(input);
        div.appendChild(inputWrapper);

        return div;
    }

    // For non-password fields, keep the original logic
    const input = document.createElement('input');
    input.type = type;
    input.name = name;
    input.required = required;
    input.className = 'form-input'; 
    div.appendChild(input);

    return div;
}