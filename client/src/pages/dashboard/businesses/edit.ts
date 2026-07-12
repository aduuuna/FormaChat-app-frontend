import { createBreadcrumb } from '../../../components/breadcrumb';
import { renderBusinessSectionHeader } from '../../../components/business-tabs';
import { createLoadingSpinner, hideLoadingSpinner } from '../../../components/loading-spinner';
import { getBusinessById, updateBusiness } from '../../../services/business.service';
import type { UpdateBusinessRequest, Business } from '../../../types/business.types';
import { showToast } from '../../../utils/toast';

function injectEditWizardStyles() {
  if (document.getElementById('business-edit-wizard-styles')) return;

  const style = document.createElement('style');
  style.id = 'business-edit-wizard-styles';
  style.textContent = `
    /* Outer wrapper — constrained and centered.
       Every rule below is scoped under .business-edit-wizard so this
       stylesheet can never bleed into (or be shadowed by) the Create
       wizard's stylesheet - both pages used to share one <style> id,
       so whichever page loaded first in the SPA silently won and the
       other page's CSS never applied at all. */
    .business-edit-wizard {
      --primary: #636b2f;
      --primary-dim: rgba(99, 107, 47, 0.1);
      --secondary: #bac095;
      --text-main: #1a1a1a;
      --text-muted: #666;
      --error-red: #dc2626;
      --success-green: #059669;
      --bg-glass: rgba(255, 255, 255, 0.7);
      --border-glass: rgba(255, 255, 255, 0.6);
      --shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.07);

      max-width: 900px;
      width: 100%;
      margin: 0 auto;
      padding: 0 16px 60px;
      box-sizing: border-box;
      overflow-x: hidden;
    }

    /* Glass Container */
    .business-edit-wizard .wizard-container {
      background: var(--bg-glass);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--border-glass);
      border-radius: 20px;
      box-shadow: var(--shadow-glass);
      padding: 44px 48px;
      margin-top: 24px;
      animation: editWizardFloatUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
      box-sizing: border-box;
      width: 100%;
    }

    @keyframes editWizardFloatUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Progress */
    .business-edit-wizard .wizard-progress-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 14px;
      margin: 24px 0;
      flex-wrap: wrap;
    }

    .business-edit-wizard .progress-dot {
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: #e5e7eb;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }
    .business-edit-wizard .progress-dot.active    { background: var(--primary); transform: scale(1.4); }
    .business-edit-wizard .progress-dot.completed { background: var(--success-green); }

    .business-edit-wizard .step-counter {
      text-align: center;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 28px;
    }

    /* Form Sections */
    .business-edit-wizard .form-section { display: none; }
    .business-edit-wizard .form-section.active {
      display: block;
      animation: editWizardSlideIn 0.35s ease-out;
    }

    @keyframes editWizardSlideIn {
      from { opacity: 0; transform: translateX(12px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    /* Section headings */
    .business-edit-wizard .form-section h2 {
      font-size: 1.5rem;
      color: var(--text-main);
      margin: 0 0 22px 0;
      font-weight: 800;
      border-bottom: 2px solid var(--primary-dim);
      padding-bottom: 10px;
    }
    .business-edit-wizard .form-section h3 {
      font-size: 1.05rem;
      color: var(--text-main);
      margin: 20px 0 8px;
    }

    /* Inputs */
    .business-edit-wizard .form-field { margin-bottom: 20px; }

    .business-edit-wizard label {
      display: block;
      margin-bottom: 7px;
      font-weight: 600;
      color: #374151;
      font-size: 0.9rem;
    }

    .business-edit-wizard input,
    .business-edit-wizard textarea,
    .business-edit-wizard select {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      background: rgba(255,255,255,0.85);
      font-size: 0.95rem;
      font-family: inherit;
      box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s;
      color: #1a1a1a;
    }

    .business-edit-wizard input:focus,
    .business-edit-wizard textarea:focus,
    .business-edit-wizard select:focus {
      outline: none;
      border-color: var(--primary);
      background: #fff;
      box-shadow: 0 0 0 3px var(--primary-dim);
    }

    /* Checkbox tiles — 2 columns on mobile */
    .business-edit-wizard .checkbox-group {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 10px;
    }
    .business-edit-wizard .checkbox-item { position: relative; }
    .business-edit-wizard .checkbox-item input { position: absolute; opacity: 0; width: 0; height: 0; }
    .business-edit-wizard .checkbox-item label {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 12px 8px;
      cursor: pointer;
      font-weight: 500;
      text-align: center;
      font-size: 0.88rem;
      transition: all 0.2s;
      min-height: 48px;
      margin: 0;
    }
    .business-edit-wizard .checkbox-item input:checked + label {
      background: var(--primary-dim);
      border-color: var(--primary);
      color: var(--primary);
      font-weight: 700;
    }

    /* Single checkbox toggle (e.g. "Allow chatbot to discuss pricing") */
    .business-edit-wizard .checkbox-field .checkbox-item {
      display: flex;
      align-items: center;
    }
    .business-edit-wizard .checkbox-field input {
      position: static;
      opacity: 1;
      width: 20px;
      height: 20px;
      accent-color: var(--primary);
      margin-right: 10px;
    }
    .business-edit-wizard .checkbox-field label {
      border: none;
      background: none;
      box-shadow: none;
      padding: 0;
      text-align: left;
      justify-content: flex-start;
      min-height: 0;
    }

    /* Dynamic array sections */
    .business-edit-wizard .dynamic-array-section {
      background: rgba(255,255,255,0.5);
      border: 1px dashed var(--secondary);
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 24px;
      box-sizing: border-box;
    }
    .business-edit-wizard .dynamic-array-item {
      background: #fff;
      border-radius: 10px;
      padding: 16px;
      padding-right: 52px;
      margin-bottom: 12px;
      border: 1px solid #f0f0f0;
      position: relative;
      box-sizing: border-box;
    }
    .business-edit-wizard .dynamic-array-item:last-child { margin-bottom: 0; }

    /* Navigation buttons */
    .business-edit-wizard .wizard-navigation {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px solid rgba(0,0,0,0.05);
    }
    .business-edit-wizard .btn-nav {
      padding: 13px 28px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      border: none;
      flex: 1;
      max-width: 200px;
      transition: all 0.2s;
    }
    .business-edit-wizard .btn-prev { background: #fff; border: 1px solid #e5e7eb; color: var(--text-main); }
    .business-edit-wizard .btn-prev:hover:not(:disabled) { background: #f9fafb; }
    .business-edit-wizard .btn-prev:disabled { opacity: 0.5; cursor: not-allowed; }
    .business-edit-wizard .btn-next { background: var(--primary); color: #fff; }
    .business-edit-wizard .btn-next:hover { background: #505726; }

    .business-edit-wizard .btn-secondary {
      background: #fff;
      color: var(--primary);
      border: 1px solid var(--primary);
      padding: 8px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      margin-top: 4px;
    }
    .business-edit-wizard .btn-secondary:hover { background: var(--primary-dim); }
    .business-edit-wizard .btn-remove {
      color: var(--error-red);
      background: #fff0f0;
      border: 1px solid #ffcccc;
      padding: 5px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.78rem;
      font-weight: 600;
      position: absolute;
      top: 12px;
      right: 12px;
    }

    .business-edit-wizard .error-message {
      background: #fef2f2;
      border: 1px solid #fee2e2;
      color: var(--error-red);
      padding: 13px 16px;
      border-radius: 10px;
      margin-bottom: 18px;
      display: none;
      font-size: 0.9rem;
      font-weight: 500;
    }

    /* ── Mobile ── */
    @media (max-width: 600px) {
      .business-edit-wizard {
        padding: 0 12px 48px;
      }

      .business-edit-wizard .wizard-container {
        padding: 24px 18px;
        border-radius: 14px;
        margin-top: 16px;
      }

      .business-edit-wizard .wizard-progress-bar {
        gap: 10px;
      }

      .business-edit-wizard .form-section h2 {
        font-size: 1.2rem;
        margin-bottom: 18px;
      }

      .business-edit-wizard .form-section h3 {
        font-size: 0.95rem;
      }

      .business-edit-wizard input,
      .business-edit-wizard textarea,
      .business-edit-wizard select {
        padding: 11px 12px;
        font-size: 0.9rem;
        border-radius: 8px;
      }

      .business-edit-wizard .checkbox-group {
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .business-edit-wizard .checkbox-item label {
        padding: 10px 6px;
        font-size: 0.82rem;
        min-height: 44px;
      }

      .business-edit-wizard .dynamic-array-section {
        padding: 14px 12px;
        border-radius: 10px;
      }

      .business-edit-wizard .dynamic-array-item {
        padding: 12px;
        padding-right: 46px;
        border-radius: 8px;
      }

      .business-edit-wizard .btn-remove {
        top: 10px;
        right: 10px;
        padding: 4px 8px;
        font-size: 0.75rem;
      }

      .business-edit-wizard .wizard-navigation {
        margin-top: 28px;
        gap: 10px;
      }

      .business-edit-wizard .btn-nav {
        padding: 12px 16px;
        font-size: 0.88rem;
        max-width: none;
      }

      .business-edit-wizard .step-counter {
        font-size: 0.75rem;
        letter-spacing: 0.5px;
        margin-bottom: 20px;
      }

      .business-edit-wizard .form-field {
        margin-bottom: 16px;
      }
    }
  `;
  document.head.appendChild(style);
}

const WIZARD_STEPS = [
  'Basic Information',
  'Products & Services',
  'Customer Support',
  'Contact & Escalation'
];

export async function renderBusinessEdit(businessId: string): Promise<HTMLElement> {
  injectEditWizardStyles();

  const container = document.createElement('div');
  container.className = 'business-edit-wizard';
  
  const spinner = createLoadingSpinner('Loading business data...');
  container.appendChild(spinner);
  
  try {
   
    const business = await getBusinessById(businessId);
    hideLoadingSpinner(spinner);
    
    const breadcrumb = createBreadcrumb([
      { label: 'Businesses', path: '#/dashboard/businesses' },
      { label: business.basicInfo.businessName },
      { label: 'Questionnaire' }
    ]);
    container.appendChild(breadcrumb);

    container.appendChild(
      await renderBusinessSectionHeader(business._id, business.basicInfo.businessName, 'questionnaire')
    );

    const wizardContainer = document.createElement('div');
    wizardContainer.className = 'wizard-container';
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'wizard-progress-bar';
    WIZARD_STEPS.forEach(() => {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        progressContainer.appendChild(dot);
    });
    wizardContainer.appendChild(progressContainer);

    const stepCounter = document.createElement('div');
    stepCounter.className = 'step-counter';
    wizardContainer.appendChild(stepCounter);

    const form = createEditForm(business);
    wizardContainer.appendChild(form);
    
    initializeWizardLogic(form, progressContainer, stepCounter, business._id);

    container.appendChild(wizardContainer);
    
  } catch (error: any) {
    hideLoadingSpinner(spinner);
    const errorMessage = document.createElement('p');
    errorMessage.textContent = error?.message || 'Failed to load business. Please try again.';
    errorMessage.className = 'error-message';
    errorMessage.style.display = 'block';
    container.appendChild(errorMessage);
    console.error('Failed to fetch business:', error);
  }
  
  return container;
}


function initializeWizardLogic(
  form: HTMLFormElement, 
  progressContainer: HTMLElement, 
  stepCounter: HTMLElement,
  businessId: string
) {
  const sections = Array.from(form.querySelectorAll('.form-section')) as HTMLElement[];
  const dots = Array.from(progressContainer.querySelectorAll('.progress-dot')) as HTMLElement[];
  const prevBtn = form.querySelector('.btn-prev') as HTMLButtonElement;
  const nextBtn = form.querySelector('.btn-next') as HTMLButtonElement;
  const errorContainer = form.querySelector('.error-box') as HTMLElement;

  let currentStep = 0;

  const updateUI = () => {
  
    sections.forEach((section, index) => {
      section.classList.toggle('active', index === currentStep);
    });

    dots.forEach((dot, index) => {
      dot.classList.remove('active', 'completed');
      if (index < currentStep) dot.classList.add('completed');
      else if (index === currentStep) dot.classList.add('active');
    });

  
    stepCounter.textContent = `Step ${currentStep + 1}: ${WIZARD_STEPS[currentStep]}`;

  
    prevBtn.disabled = currentStep === 0;
    nextBtn.textContent = currentStep === sections.length - 1 ? 'Save Changes' : 'Next';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  updateUI();

  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentStep > 0) {
      currentStep--;
      updateUI();
    }
  });

  nextBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!validateStep(sections[currentStep], errorContainer)) return;

    if (currentStep === sections.length - 1) {
      // Last step — save
      await handleUpdateBusiness(businessId, form, nextBtn, errorContainer);
    } else {
      currentStep++;
      updateUI();
    }
  });
}

function validateStep(section: HTMLElement, errorContainer: HTMLElement): boolean {
    const requiredInputs = section.querySelectorAll('[required]') as NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
    errorContainer.style.display = 'none';

    for (const input of requiredInputs) {
       
        if (input.offsetParent === null) continue;

        if (!input.value.trim()) {
            input.focus();
            errorContainer.textContent = 'Please fill in all required fields.';
            errorContainer.style.display = 'block';
            return false;
        }
    }
    return true;
}



function createEditForm(business: Business): HTMLFormElement {
  const form = document.createElement('form');
  form.className = 'business-form';

  const s1 = createSection('1. Basic Information');
  
  s1.appendChild(createFormField({
    type: 'text', name: 'businessName', label: 'Business Name', required: true,
    value: business.basicInfo.businessName
  }));

  s1.appendChild(createFormField({
    type: 'textarea', name: 'businessDescription', label: 'Business Description', required: true,
    value: business.basicInfo.businessDescription
  }));

  const knownTypes = ['E-commerce', 'Real Estate', 'Restaurant', 'Hotel', 'Service-based', 'Tech/SaaS', 'Healthcare', 'Education'];
  const isOther = !knownTypes.includes(business.basicInfo.businessType);
  
  const typeWrapper = document.createElement('div');
  const typeSelect = createSelectField({
    name: 'businessType', label: 'Business Type', required: true,
    options: [...knownTypes, 'Other'],
    selectedValue: isOther ? 'Other' : business.basicInfo.businessType
  });
  
  const otherTypeInput = createFormField({
    type: 'text', name: 'businessTypeOther', label: 'Specify Type',
    value: isOther ? business.basicInfo.businessType : ''
  });
  otherTypeInput.style.display = isOther ? 'block' : 'none';
  const otherInputEl = otherTypeInput.querySelector('input') as HTMLInputElement;
  if(isOther) otherInputEl.required = true;

  typeSelect.querySelector('select')?.addEventListener('change', (e: Event) => {
    const val = (e.target as HTMLSelectElement).value;
    if (val === 'Other') {
        otherTypeInput.style.display = 'block';
        otherInputEl.required = true;
    } else {
        otherTypeInput.style.display = 'none';
        otherInputEl.required = false;
    }
  });

  typeWrapper.appendChild(typeSelect);
  typeWrapper.appendChild(otherTypeInput);
  s1.appendChild(typeWrapper);

  s1.appendChild(createFormField({
    type: 'text', name: 'operatingHours', label: 'Operating Hours', required: true,
    value: business.basicInfo.operatingHours
  }));

  s1.appendChild(createFormField({
    type: 'text', name: 'location', label: 'Location', required: true,
    value: business.basicInfo.location
  }));

  s1.appendChild(createFormField({
    type: 'text', name: 'timezone', label: 'Timezone (Optional)', 
    value: business.basicInfo.timezone || ''
  }));

  form.appendChild(s1);

  const s2 = createSection('2. Products & Services');
  
  s2.appendChild(createFormField({
    type: 'textarea', name: 'offerings', label: 'What do you offer? (for individual products with photos/price/stock, use the Products tab above)', required: true,
    value: business.productsServices.offerings
  }));

  s2.appendChild(createCheckboxGroup({
    name: 'serviceDelivery', label: 'Delivery Options',
    options: ['Delivery', 'Pickup', 'In-person', 'Online/Virtual'],
    checkedValues: business.productsServices.serviceDelivery
  }));

  const pricingDiv = document.createElement('div');
  const canDiscuss = business.productsServices.pricingDisplay?.canDiscussPricing ?? true;
  
  const pricingToggle = createCheckboxField({
    name: 'canDiscussPricing', label: 'Allow chatbot to discuss pricing',
    defaultChecked: canDiscuss
  });
  
  const pricingNote = createFormField({
    type: 'textarea', name: 'pricingNote', label: 'Pricing Note',
    value: business.productsServices.pricingDisplay?.pricingNote || ''
  });
  pricingNote.style.display = canDiscuss ? 'block' : 'none';

  pricingToggle.querySelector('input')?.addEventListener('change', (e) => {
    pricingNote.style.display = (e.target as HTMLInputElement).checked ? 'block' : 'none';
  });

  pricingDiv.appendChild(pricingToggle);
  pricingDiv.appendChild(pricingNote);
  s2.appendChild(pricingDiv);

  form.appendChild(s2);

  const s3 = createSection('3. Customer Support');

  s3.appendChild(createDynamicArraySection({
    title: 'FAQs', name: 'faqs',
    fields: [
        { type: 'text', name: 'question', label: 'Question', required: true },
        { type: 'textarea', name: 'answer', label: 'Answer', required: true }
    ],
    existingData: business.customerSupport.faqs
  }));

  s3.appendChild(createFormField({
    type: 'textarea', name: 'refundPolicy', label: 'Refund Policy', required: true,
    value: business.customerSupport.policies.refundPolicy
  }));

  s3.appendChild(createFormField({
    type: 'textarea', name: 'cancellationPolicy', label: 'Cancellation Policy',
    value: business.customerSupport.policies.cancellationPolicy || ''
  }));

  s3.appendChild(createSelectField({
    name: 'chatbotTone', label: 'Chatbot Tone', required: true,
    options: ['Friendly', 'Professional', 'Casual', 'Formal', 'Playful'],
    selectedValue: business.customerSupport.chatbotTone
  }));

  s3.appendChild(createFormField({
    type: 'textarea', name: 'chatbotGreeting', label: 'Custom Greeting',
    value: business.customerSupport.chatbotGreeting || ''
  }));

  s3.appendChild(createFormField({
    type: 'textarea', name: 'chatbotRestrictions', label: 'Chatbot Restrictions (Optional)',
    value: business.customerSupport.chatbotRestrictions || '',
    placeholder: 'e.g., Do not make guarantees about delivery times...'
  }));

  s3.appendChild(createFormField({
    type: 'textarea', name: 'chatbotCustomInstructions', label: 'Additional AI Instructions (Optional)',
    value: (business.customerSupport as any).chatbotCustomInstructions || '',
    placeholder: 'e.g., Always respond in French. End every message with our tagline.'
  }));

  form.appendChild(s3);

  const s4 = createSection('4. Contact & Escalation');

  s4.appendChild(createDynamicArraySection({
    title: 'Contact Methods', name: 'contactMethods', minItems: 1,
    fields: [
        { type: 'select', name: 'method', label: 'Method', required: true, options: ['Email', 'Phone', 'WhatsApp'] },
        { type: 'text', name: 'value', label: 'Details', required: true }
    ],
    existingData: business.contactEscalation.contactMethods
  }));

  s4.appendChild(document.createElement('h3')).textContent = 'Escalation Contact';

  s4.appendChild(createFormField({
    type: 'text', name: 'escalationName', label: 'Contact Name', required: true,
    value: business.contactEscalation.escalationContact.name
  }));

  s4.appendChild(createFormField({
    type: 'email', name: 'escalationEmail', label: 'Contact Email', required: true,
    value: business.contactEscalation.escalationContact.email
  }));

  s4.appendChild(createCheckboxGroup({
    name: 'chatbotCapabilities', label: 'Capabilities',
    options: ['Answer FAQs', 'Generate leads', 'Handle Complaints', 'Provide product info'],
    checkedValues: business.contactEscalation.chatbotCapabilities
  }));

  s4.appendChild(createFormField({
    type: 'url', name: 'webhookUrl', label: 'Webhook URL (Optional)',
    value: (business as any).webhookUrl || '',
    placeholder: 'https://your-site.com/webhooks/formachat'
  }));

  form.appendChild(s4);


  const errorBox = document.createElement('div');
  errorBox.className = 'error-message error-box';
  form.appendChild(errorBox);

  const navDiv = document.createElement('div');
  navDiv.className = 'wizard-navigation';
  
  const btnPrev = document.createElement('button');
  btnPrev.type = 'button';
  btnPrev.className = 'btn-nav btn-prev';
  btnPrev.textContent = 'Previous';
  navDiv.appendChild(btnPrev);

  const btnNext = document.createElement('button');
  btnNext.type = 'button'; 
  btnNext.className = 'btn-nav btn-next';
  btnNext.textContent = 'Next';
  navDiv.appendChild(btnNext);

  form.appendChild(navDiv);

  return form;
}

function createSection(title: string): HTMLElement {
  const s = document.createElement('section');
  s.className = 'form-section';
  const h = document.createElement('h2');
  h.textContent = title;
  s.appendChild(h);
  return s;
}

function createFormField(opts: { type: string, name: string, label: string, required?: boolean, value?: string, placeholder?: string }): HTMLElement {
  const div = document.createElement('div');
  div.className = 'form-field';
  
  const label = document.createElement('label');
  label.innerHTML = opts.label + (opts.required ? ' <span style="color: #dc2626; font-weight: 700;">*</span>' : '');
  div.appendChild(label);

  let input: HTMLElement;
  if (opts.type === 'textarea') {
    input = document.createElement('textarea');
    (input as HTMLTextAreaElement).rows = 4;
    (input as HTMLTextAreaElement).value = opts.value || '';
  } else {
    input = document.createElement('input');
    (input as HTMLInputElement).type = opts.type;
    (input as HTMLInputElement).value = opts.value || '';
  }
  
  (input as any).name = opts.name;
  if (opts.required) (input as any).required = true;
  if (opts.placeholder) (input as any).placeholder = opts.placeholder;

  div.appendChild(input);
  return div;
}

function createSelectField(opts: { name: string, label: string, options: string[], selectedValue?: string, required?: boolean }): HTMLElement {
  const div = document.createElement('div');
  div.className = 'form-field';
  
  const label = document.createElement('label');
 label.innerHTML = opts.label + (opts.required ? ' <span style="color: #dc2626; font-weight: 700;">*</span>' : '');
  div.appendChild(label);

  const select = document.createElement('select');
  select.name = opts.name;
  if (opts.required) select.required = true;

  opts.options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    if (opt === opts.selectedValue) option.selected = true;
    select.appendChild(option);
  });

  div.appendChild(select);
  return div;
}

function createCheckboxGroup(opts: { name: string, label: string, options: string[], checkedValues?: string[] }): HTMLElement {
  const div = document.createElement('div');
  div.className = 'form-field';
  
  const label = document.createElement('label');
  label.textContent = opts.label;
  div.appendChild(label);

  const group = document.createElement('div');
  group.className = 'checkbox-group';

  opts.options.forEach(opt => {
    const wrap = document.createElement('div');
    wrap.className = 'checkbox-item';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = opts.name;
    input.value = opt;
    input.id = `${opts.name}_${opt.replace(/\s/g, '')}`;
    if (opts.checkedValues?.includes(opt)) input.checked = true;

    const lbl = document.createElement('label');
    lbl.htmlFor = input.id;
    lbl.textContent = opt;

    wrap.appendChild(input);
    wrap.appendChild(lbl);
    group.appendChild(wrap);
  });

  div.appendChild(group);
  return div;
}

function createCheckboxField(opts: { name: string, label: string, defaultChecked?: boolean }): HTMLElement {
  const div = document.createElement('div');
  div.className = 'form-field checkbox-field';
  
  const wrap = document.createElement('div');
  wrap.className = 'checkbox-item';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.name = opts.name;
  input.id = opts.name;
  if (opts.defaultChecked) input.checked = true;

  const lbl = document.createElement('label');
  lbl.htmlFor = opts.name;
  lbl.textContent = opts.label;

  wrap.appendChild(input);
  wrap.appendChild(lbl);
  div.appendChild(wrap);
  return div;
}

function createDynamicArraySection(opts: { title: string, name: string, fields: any[], existingData?: any[], minItems?: number }): HTMLElement {
  const section = document.createElement('div');
  section.className = 'dynamic-array-section';
  section.dataset.arrayName = opts.name; 

  const h3 = document.createElement('h3');
  h3.textContent = opts.title;
  section.appendChild(h3);

  const container = document.createElement('div');
  container.className = 'dynamic-array-items';
  section.appendChild(container);

  if (opts.existingData && opts.existingData.length > 0) {
    opts.existingData.forEach(data => {
        container.appendChild(createDynamicItem(opts.name, opts.fields, container, data));
    });
  } else if (opts.minItems) {
    for(let i=0; i<opts.minItems; i++) {
        container.appendChild(createDynamicItem(opts.name, opts.fields, container));
    }
  }

  const btnAdd = document.createElement('button');
  btnAdd.type = 'button';
  btnAdd.className = 'btn-secondary';
  btnAdd.textContent = '+ Add Item';
  btnAdd.addEventListener('click', () => {
    container.appendChild(createDynamicItem(opts.name, opts.fields, container));
  });
  section.appendChild(btnAdd);

  return section;
}

function createDynamicItem(arrayName: string, fields: any[], container: HTMLElement, data?: any): HTMLElement {
  const item = document.createElement('div');
  item.className = 'dynamic-array-item';
  
  const index = container.children.length; 

  fields.forEach(f => {
    const fieldName = `${arrayName}[${index}][${f.name}]`;
    const val = data ? data[f.name] : '';

    if (f.type === 'select') {
      item.appendChild(createSelectField({ name: fieldName, label: f.label, options: f.options, required: f.required, selectedValue: val }));
    } else {
      item.appendChild(createFormField({ type: f.type, name: fieldName, label: f.label, required: f.required, value: val }));
    }
  });

  const btnRemove = document.createElement('button');
  btnRemove.type = 'button';
  btnRemove.className = 'btn-remove';
  btnRemove.textContent = 'Remove';
  btnRemove.addEventListener('click', () => {
    item.remove();
    
  });
  item.appendChild(btnRemove);

  return item;
}

function collectArrayData(form: HTMLFormElement, arrayName: string): any[] {
    const results: any[] = [];
    
    const itemDivs = form.querySelectorAll(`.dynamic-array-section[data-array-name="${arrayName}"] .dynamic-array-item`);
    
    itemDivs.forEach((div) => {
        const itemObj: any = {};
        const inputs = div.querySelectorAll('input, select, textarea');
        let hasData = false;

        inputs.forEach((input) => {
            const name = (input as any).name; 
            
            const keyMatch = name.match(/\[([^\]]+)\]$/); 
            if (keyMatch) {
                const key = keyMatch[1];
                let val = (input as any).value;
                if ((input as any).type === 'number') val = parseFloat(val);
                itemObj[key] = val;
                if(val) hasData = true;
            }
        });

        if (hasData) results.push(itemObj);
    });

    return results;
}

async function handleUpdateBusiness(
  businessId: string, 
  form: HTMLFormElement, 
  btn: HTMLButtonElement, 
  errorBox: HTMLElement
) {
  try {
    btn.disabled = true;
    btn.textContent = 'Saving...';
    errorBox.style.display = 'none';

    const formData = new FormData(form);
    

    let bType = formData.get('businessType') as string;
    if (bType === 'Other') bType = formData.get('businessTypeOther') as string;

    const updateData: UpdateBusinessRequest = {
        basicInfo: {
            businessName: formData.get('businessName') as string,
            businessDescription: formData.get('businessDescription') as string,
            businessType: bType as any,
            operatingHours: formData.get('operatingHours') as string,
            location: formData.get('location') as string,
            timezone: formData.get('timezone') as string
        },
        productsServices: {
            offerings: formData.get('offerings') as string,
            popularItems: [], // individual products now live in the Products tab, not this free-text list
            serviceDelivery: formData.getAll('serviceDelivery') as any[],
            pricingDisplay: {
                canDiscussPricing: !!formData.get('canDiscussPricing'),
                pricingNote: formData.get('pricingNote') as string
            }
        },
        customerSupport: {
            faqs: collectArrayData(form, 'faqs'),
            policies: {
                refundPolicy: formData.get('refundPolicy') as string,
                cancellationPolicy: formData.get('cancellationPolicy') as string,
                importantPolicies: formData.get('importantPolicies') as string
            },
            chatbotTone: formData.get('chatbotTone') as any,
            chatbotGreeting: formData.get('chatbotGreeting') as string,
            chatbotRestrictions: formData.get('chatbotRestrictions') as string,
            chatbotCustomInstructions: (formData.get('chatbotCustomInstructions') as string) || undefined
        },
        webhookUrl: (formData.get('webhookUrl') as string) || undefined,
        contactEscalation: {
            contactMethods: collectArrayData(form, 'contactMethods'),
            escalationContact: {
                name: formData.get('escalationName') as string,
                email: formData.get('escalationEmail') as string,
                phone: formData.get('escalationPhone') as string
            },
            chatbotCapabilities: formData.getAll('chatbotCapabilities') as any[]
        }
    };

    await updateBusiness(businessId, updateData);
    showToast('Business updated successfully.', 'success');
    window.location.hash = '#/dashboard/businesses';

  } catch (error: any) {
    btn.disabled = false;
    btn.textContent = 'Save Changes';
    errorBox.textContent = error.message || 'Failed to update business';
    errorBox.style.display = 'block';
  }
}