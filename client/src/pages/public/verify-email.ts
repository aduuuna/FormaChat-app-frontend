import { verifyEmail, resendOTP } from '../../services/auth.service';
import { OTPType } from '../../types/auth.types';
import { showToast } from '../../utils/toast';

function injectVerifyEmailStyles() {

    if (document.getElementById('verify-email-page-styles')) return;

    const style = document.createElement('style');
    style.id = 'verify-email-page-styles';
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
        .verify-container {
            max-width: 420px;
            margin: 60px auto; 
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
        .verify-title {
            font-size: 1.8rem;
            font-weight: 800;
            color: var(--primary);
            margin-bottom: 5px;
            text-align: center;
        }
        
        .email-info {
            color: var(--text-muted);
            margin: 15px auto 30px auto;
            text-align: center;
            line-height: 1.5;
            padding-bottom: 10px;
            border-bottom: 1px dashed #eee;
        }

        /* 3. OTP Input Styling (The Magic!) */
        .otp-group {
            margin-bottom: 25px;
            text-align: center;
        }

        .otp-input {
            width: 100%;
            padding: 15px 10px;
            box-sizing: border-box;
            border: 2px solid var(--secondary);
            border-radius: 8px;
            background: white;
            transition: all 0.3s ease;
            color: balck;
            
            /* Specific OTP styling */
            font-size: 2rem !important; 
            font-weight: 700;
            letter-spacing: 12px !important; 
            text-align: center !important; 
            color: var(--primary);
            max-width: 300px; /* Constraints size for aesthetics */
            display: inline-block;
        }

        .otp-input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 4px rgba(99, 107, 47, 0.15);
            outline: none;
        }
        
        .form-label {
            display: block;
            margin-bottom: 10px;
            font-weight: 600;
            color: var(--text-main);
            font-size: 0.9rem;
        }


        /* 4. Buttons (Primary/Secondary consistent with Register) */
        .btn {
            width: 100%;
            padding: 14px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
            margin-bottom: 10px;
        }
        
        /* Verify Button (Primary) */
        .btn-primary {
            background: var(--primary);
            color: white;
            box-shadow: 0 4px 6px rgba(99, 107, 47, 0.2);
        }

        .btn-primary:hover:not(:disabled) {
            background: #4f5625; 
            transform: translateY(-1px);
        }
        
        /* Resend Button (Secondary/Ghost) */
        .btn-secondary {
            background: var(--bg-light);
            color: var(--primary);
            border: 1px solid var(--primary);
            box-shadow: none;
        }

        .btn-secondary:hover:not(:disabled) {
            background: #e1e4e8;
        }

        .btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            box-shadow: none;
        }
        
        /* 5. Messages and Links */
        .link-text a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
        }

        /* Error/No Pending State */
        .error-state {
            padding: 30px;
            text-align: center;
        }

    `;
    document.head.appendChild(style);
}

export function renderVerifyEmail(): HTMLElement {
    injectVerifyEmailStyles();

    const container = document.createElement('div');
    container.className = 'verify-container'; 

    const email = localStorage.getItem('pendingVerificationEmail');

    if (!email) {
       
        container.className = 'verify-container error-state';
        
        const errorTitle = document.createElement('h2');
        errorTitle.textContent = 'Verification Required';
        errorTitle.className = 'verify-title';
        container.appendChild(errorTitle);

        const errorMsg = document.createElement('p');
        errorMsg.className = 'email-info';
        errorMsg.innerHTML = 'No pending verification found. Please <a href="#/login" class="link-text">login</a> or <a href="#/register" class="link-text">register</a> first.';
        container.appendChild(errorMsg);

        const loginLink = document.createElement('a');
        loginLink.href = '#/login';
        loginLink.textContent = 'Go to Login';
        loginLink.className = 'btn btn-secondary';
        container.appendChild(loginLink);

        return container;
    }

    const title = document.createElement('h1');
    title.textContent = 'Verify Your Email';
    title.className = 'verify-title';
    container.appendChild(title);

    const emailInfo = document.createElement('p');
    emailInfo.className = 'email-info';
    emailInfo.innerHTML = `We sent a 6-digit code to:<br><strong>${email}</strong>`;
    container.appendChild(emailInfo);

    const form = document.createElement('form');

    const otpDiv = document.createElement('div');
    otpDiv.className = 'otp-group';

    const otpLabel = document.createElement('label');
    otpLabel.textContent = 'Verification Code';
    otpLabel.className = 'form-label';
    otpDiv.appendChild(otpLabel);

    const otpInput = document.createElement('input');
    otpInput.type = 'text';
    otpInput.name = 'otp';
    otpInput.required = true;
    otpInput.maxLength = 6;
    otpInput.className = 'otp-input';
    otpDiv.appendChild(otpInput);

    form.appendChild(otpDiv);

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

        if (otp.length !== 6) {
            showToast('Please enter a valid 6-digit code', 'error');
            return;
        }

        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Verifying...';

        try {
            const response = await verifyEmail({
                email,
                otp,
                type: OTPType.EMAIL_VERIFICATION
            });

            if (!response.success) {
                showToast(response.error.message || 'Invalid code', 'error');
                return;
            }

            localStorage.removeItem('pendingVerificationEmail');

            showToast('Email verified! Redirecting to login...', 'success');

            setTimeout(() => {
                window.location.hash = '#/login';
            }, 2000);

        } catch (error) {
            showToast('Verification failed', 'error');
            console.error('Verification error:', error);
        } finally {
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify Email';
        }
    });

    resendBtn.addEventListener('click', async () => {
        resendBtn.disabled = true;
        resendBtn.textContent = 'Sending...';

        try {
            const response = await resendOTP(email);

            if (!response.success) {
                showToast(response.error?.message || 'Failed to resend code', 'error');
                return;
            }

            showToast('Code resent! Check your email.', 'success');

        } catch (error: any) {
            showToast(error?.message || 'Failed to resend code', 'error');
        } finally {
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend Code';
        }
    });

    container.appendChild(form);

    const helperText = document.createElement('p');
    helperText.style.cssText = 'margin-top: 25px; text-align: center; font-size: 0.85rem; color: var(--text-muted);';
    helperText.textContent = 'Check your spam or junk folder if you don\'t see the email within 2 minutes.';
    container.appendChild(helperText);

    const loginLink = document.createElement('p');
    loginLink.className = 'link-text';
    loginLink.style.cssText = 'margin-top: 20px; text-align: center;';
    loginLink.innerHTML = '<a href="#/login">Back to Login</a>';
    container.appendChild(loginLink);

    return container;
}