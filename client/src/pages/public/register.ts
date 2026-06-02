import { register, verifyEmail, resendOTP } from '../../services/auth.service';
import { OTPType } from '../../types/auth.types';

let registeredEmail = '';

function injectRegisterStyles() {
    const style = document.createElement('style');
    style.textContent = `
        :root {
            --primary: #636b2f; /* Dark Green/Olive */
            --secondary: #bac095; /* Light Olive */
            --text-main: #1a1a1a;
            --text-muted: #666;
            --error-red: #dc3545;
            --success-green: #28a745;
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
        .error-message {
            color: var(--error-red);
            margin-bottom: 15px;
            padding: 8px;
            border-left: 3px solid var(--error-red);
            background: rgba(220, 53, 69, 0.05);
            border-radius: 4px;
        }
        
        .success-message {
            color: var(--success-green);
            margin-bottom: 15px;
            padding: 5px;
            border-left: 3px solid var(--success-green);
            background: rgba(40, 167, 69, 0.05);
            border-radius: 4px;
        }
        
        .login-link a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
        }

        .login-link a:hover {
            text-decoration: underline;
        }

        /* OTP Specific Styling */
        .otp-input {
            text-align: center;
            letter-spacing: 15px !important;
            font-weight: bold;
            font-size: 1.5rem !important;
            padding: 15px !important;
            color: black;
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

    const registerForm = createRegisterForm(container);
    container.appendChild(registerForm);

    const otpSection = createOTPSection();
    otpSection.style.display = 'none';
    container.appendChild(otpSection);

    const loginLink = document.createElement('p');
    loginLink.className = 'login-link'; 
    loginLink.style.cssText = 'margin-top: 20px; text-align: center;';
    loginLink.innerHTML = `Already have an account? <a href="#/login">Login</a>`;
    container.appendChild(loginLink);

    return container;
}

function createRegisterForm(container: HTMLElement): HTMLElement {
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

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message'; 
    errorDiv.style.display = 'none';
    form.appendChild(errorDiv);

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

        errorDiv.style.display = 'none';

        if (password.length < 8) {
            errorDiv.textContent = 'Password must be at least 8 characters';
            errorDiv.style.display = 'block';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';

        try {
            const response = await register({ email, password, firstName, lastName });

            if (!response.success) {
                errorDiv.textContent = response.error.message || 'Registration failed';
                errorDiv.style.display = 'block';
                return;
            }

            registeredEmail = email;
            form.style.display = 'none';
            
            const otpSection = container.querySelector('#otpSection') as HTMLElement;
            if (otpSection) {
                otpSection.style.display = 'block';
            }

        } catch (error) {
            errorDiv.textContent = 'An unexpected error occurred';
            errorDiv.style.display = 'block';
            console.error('Register error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Start Free Beta Access';
        }
    });

    return form;
}

function createOTPSection(): HTMLElement {
    const section = document.createElement('div');
    section.id = 'otpSection';

    const successMsg = document.createElement('p');
    successMsg.className = 'success-message'; 
    successMsg.textContent = 'Success! Check your inbox or spam folder for your 6-digit verification code.';
    section.appendChild(successMsg);

    const form = document.createElement('form');

    const otpDiv = document.createElement('div');
    otpDiv.className = 'form-field';
    otpDiv.style.marginBottom = '25px';

    const otpLabel = document.createElement('label');
    otpLabel.textContent = 'Verification Code (OTP)';
    otpLabel.className = 'form-label';
    otpDiv.appendChild(otpLabel);

    const otpInput = document.createElement('input');
    otpInput.type = 'text';
    otpInput.name = 'otp';
    otpInput.required = true;
    otpInput.maxLength = 6;
    otpInput.className = 'form-input otp-input'; 
    otpDiv.appendChild(otpInput);

    form.appendChild(otpDiv);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.display = 'none';
    form.appendChild(errorDiv);

    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.display = 'none';
    form.appendChild(successDiv);

    const verifyBtn = document.createElement('button');
    verifyBtn.type = 'submit';
    verifyBtn.textContent = 'Verify Email';
    verifyBtn.className = 'btn btn-primary';
    form.appendChild(verifyBtn);

    const resendBtn = document.createElement('button');
    resendBtn.type = 'button';
    resendBtn.textContent = 'Resend Code';
    resendBtn.className = 'btn btn-secondary'; 
    form.appendChild(resendBtn);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otp = otpInput.value;
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        if (otp.length !== 6) {
            errorDiv.textContent = 'Please enter a valid 6-digit code';
            errorDiv.style.display = 'block';
            return;
        }

        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Verifying...';

        try {
            const response = await verifyEmail({
                email: registeredEmail,
                otp,
                type: OTPType.EMAIL_VERIFICATION
            });

            if (!response.success) {
                errorDiv.textContent = response.error.message || 'Invalid code';
                errorDiv.style.display = 'block';
                return;
            }

            successDiv.textContent = 'Email verified! Redirecting to login...';
            successDiv.style.display = 'block';

            setTimeout(() => {
                window.location.hash = '#/login';
            }, 2000);

        } catch (error) {
            errorDiv.textContent = 'Verification failed';
            errorDiv.style.display = 'block';
            console.error('OTP verification error:', error);
        } finally {
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify Email';
        }
    });


    resendBtn.addEventListener('click', async () => {
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        resendBtn.disabled = true;
        resendBtn.textContent = 'Sending...';

        try {
            const response = await resendOTP(registeredEmail);

            if (!response.success) {
                errorDiv.textContent = 'Failed to resend code';
                errorDiv.style.display = 'block';
                return;
            }

            successDiv.textContent = 'Code resent! Check your email.';
            successDiv.style.display = 'block';

        } catch (error) {
            errorDiv.textContent = 'Failed to resend code';
            errorDiv.style.display = 'block';
        } finally {
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend Code';
        }
    });

    section.appendChild(form);
    return section;
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
        input.style.paddingRight = '45px'; // Make room for the icon
        
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
            if (input.type === 'password') {
                // Password is hidden, show it → use CROSSED eye (password visible)
                input.type = 'text';
                toggleBtn.innerHTML = `
                    
                    <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                `;
            } else {
                // Password is visible, hide it → use OPEN eye (password hidden)
                input.type = 'password';
                toggleBtn.innerHTML = `
                    <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                `;
            }
        });
                
        inputWrapper.appendChild(input);
        inputWrapper.appendChild(toggleBtn);
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