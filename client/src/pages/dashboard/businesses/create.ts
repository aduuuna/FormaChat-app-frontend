import { createBreadcrumb } from '../../../components/breadcrumb';
import { createBusiness } from '../../../services/business.service';
import type { CreateBusinessRequest } from '../../../types/business.types';
import { showModal } from '../../../components/modal';

function injectWizardStyles() {
  if (document.getElementById('business-wizard-styles')) return;

  const style = document.createElement('style');
  style.id = 'business-wizard-styles';
  style.textContent = `
    :root {
      --primary: #636b2f;       /* Olive */
      --primary-dim: rgba(99, 107, 47, 0.1);
      --secondary: #bac095;     /* Light Olive */
      --text-main: #1a1a1a;
      --text-muted: #666;
      --error-red: #dc2626;
      --success-green: #059669;
      --bg-glass: rgba(255, 255, 255, 0.7);
      --border-glass: rgba(255, 255, 255, 0.6);
      --shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
    }

    .business-create {
      max-width: 900px;
      margin: 0 auto;
      padding-bottom: 80px;
      padding: 0 20px;
      box-sizing: border-box;
    }

    /* --- 1. GLASS CONTAINER --- */
    .wizard-container {
      background: var(--bg-glass);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--border-glass);
      border-radius: 24px;
      box-shadow: var(--shadow-glass);
      padding: 50px;
      margin-top: 30px;
      animation: floatUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
      box-sizing: border-box; 
      width: 100%;
    }

    @media (max-width: 768px) {
      .wizard-container {
        padding: 30px 20px;
      }
    }

    @keyframes floatUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* --- 2. HEADER & PROGRESS --- */
    .page-header {
      text-align: center;
      margin-bottom: 40px;
    }
    .page-description {
      color: var(--text-muted);
      font-size: 1.1rem;
    }

    /* Styled Progress Bar */
    .progress-dots {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin: 30px 0;
    }
    .progress-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #e5e7eb;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
    }
    .progress-dot::after {
      content: '';
      position: absolute;
      top: 50%; left: 100%;
      width: 15px; height: 2px;
      background: #e5e7eb;
      transform: translateY(-50%);
      z-index: -1;
    }
    .progress-dot:last-child::after { display: none; }
    
    .progress-dot.active {
      background: var(--primary);
      transform: scale(1.4);
      box-shadow: 0 0 0 4px var(--primary-dim);
    }
    .progress-dot.completed {
      background: var(--success-green);
    }

    .step-counter {
      text-align: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 30px;
    }

    /* --- 3. FORM SECTIONS --- */
    .form-section {
      display: none;
    }
    .form-section.active {
      display: block;
      animation: slideInRight 0.4s ease-out;
    }

    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(15px); }
      to { opacity: 1; transform: translateX(0); }
    }

    h2 {
      font-size: 1.8rem;
      color: var(--text-main);
      margin-bottom: 25px;
      font-weight: 800;
      letter-spacing: -0.5px;
      border-bottom: 2px solid var(--primary-dim);
      padding-bottom: 10px;
    }
    
    h3 {
      font-size: 1.2rem;
      color: var(--text-main);
      margin-top: 20px;
      margin-bottom: 10px;
    }

    /* --- 4. INPUTS & FIELDS --- */
    .form-field { margin-bottom: 24px; }
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      font-size: 0.95rem;
      color: #374151;
    }

    input[type="text"],
    input[type="email"],
    input[type="number"],
    input[type="tel"],
    textarea,
    select {
      width: 100%;
      padding: 14px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: rgba(255,255,255,0.8);
      font-size: 1rem;
      font-family: inherit;
      transition: all 0.2s ease;
      box-sizing: border-box;
      color: black;
    }

    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: var(--primary);
      background: #fff;
      box-shadow: 0 0 0 4px var(--primary-dim);
    }

    .help-text {
      font-size: 0.85rem;
      color: black;
      margin-top: 6px;
      display: block;
    }

    /* --- 5. TILE/CARD CHECKBOXES (The "Modern" Look) --- */
    .checkbox-group {
      margin-top: 10px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
    }

    .checkbox-item {
      position: relative;
    }

    /* Hidden checkbox/radio but accessible */
    .checkbox-item input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }

    /* The visual label acts as the card */
    .checkbox-item label {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 15px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      height: 100%;
      margin: 0;
      font-weight: 500;
      box-shadow: 0 2px 5px rgba(0,0,0,0.02);
    }

    /* Selected State */
    .checkbox-item input:checked + label {
      background: var(--primary-dim);
      border-color: var(--primary);
      color: var(--primary);
      font-weight: 700;
      box-shadow: 0 4px 10px rgba(99, 107, 47, 0.15);
    }

    /* Single Checkbox toggle (Switch style) */
    .checkbox-field .checkbox-item {
      display: flex;
      align-items: center;
    }
    .checkbox-field input {
      position: static;
      opacity: 1;
      width: 20px;
      height: 20px;
      accent-color: var(--primary);
      margin-right: 10px;
    }
    .checkbox-field label {
      border: none;
      background: none;
      box-shadow: none;
      padding: 0;
      text-align: left;
      justify-content: flex-start;
    }

    /* --- 6. DYNAMIC ARRAYS (Cards inside Cards) --- */
    .dynamic-array-section {
      background: rgba(255,255,255,0.5);
      border: 1px dashed var(--secondary);
      border-radius: 16px;
      padding: 25px;
      margin-bottom: 30px;
    }
    
    .dynamic-array-item {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
      border: 1px solid #f0f0f0;
      box-shadow: 0 4px 15px rgba(0,0,0,0.03);
      position: relative;
      animation: fadeIn 0.3s;
    }
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    /* --- 7. BUTTONS --- */
    .wizard-navigation {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid rgba(0,0,0,0.05);
    }

    .btn-nav {
      padding: 14px 35px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-prev {
      background: #fff;
      border: 1px solid #e5e7eb;
      color: var(--text-main);
    }
    .btn-prev:hover:not(:disabled) {
      background: #f9fafb;
      transform: translateX(-3px);
    }

    .btn-next {
      background: var(--primary);
      color: #fff;
      box-shadow: 0 4px 15px var(--primary-dim);
    }
    .btn-next:hover:not(:disabled) {
      background: #505726; /* Darker olive */
      transform: translateX(3px);
      box-shadow: 0 6px 20px var(--primary-dim);
    }

    .btn-secondary {
      background: #fff;
      color: var(--primary);
      border: 1px solid var(--primary);
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.9rem;
      transition: 0.2s;
    }
    .btn-secondary:hover {
      background: var(--primary-dim);
    }

    .btn-remove {
      color: var(--error-red);
      background: #fff0f0;
      border: 1px solid #ffcccc;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      position: absolute;
      top: 15px;
      right: 15px;
    }

    .error-message {
      background: #fef2f2;
      border: 1px solid #fee2e2;
      color: var(--error-red);
      padding: 15px;
      border-radius: 12px;
      margin-bottom: 20px;
      font-weight: 500;
    }
  `;
  document.head.appendChild(style);
}

export async function renderBusinessCreate(): Promise<HTMLElement> {
  injectWizardStyles();

  const container = document.createElement('div');
  container.className = 'business-create';
  
  const breadcrumb = createBreadcrumb([
    { label: 'Businesses', path: '#/dashboard/businesses' },
    { label: 'Create New Business' }
  ]);
  container.appendChild(breadcrumb);
  
  const wizardContainer = document.createElement('div');
  wizardContainer.className = 'wizard-container';
  
  const progressDots = createProgressDots(4);
  wizardContainer.appendChild(progressDots);
  
  const stepCounter = document.createElement('div');
  stepCounter.className = 'step-counter';
  stepCounter.textContent = 'Step 1 of 4';
  wizardContainer.appendChild(stepCounter);
  
 
  const form = document.createElement('form');
  form.className = 'business-form';
  
  const section1 = createSection1();
  const section2 = createSection2();
  const section3 = createSection3();
  const section4 = createSection4();
  
  form.appendChild(section1);
  form.appendChild(section2);
  form.appendChild(section3);
  form.appendChild(section4);
  
  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-message';
  errorContainer.style.display = 'none';
  form.appendChild(errorContainer);
  
  const navigation = createNavigation();
  form.appendChild(navigation);
  
  wizardContainer.appendChild(form);
  container.appendChild(wizardContainer);
  
  initializeWizard(form, progressDots, stepCounter, navigation, errorContainer);
  
  return container;
}

function createProgressDots(totalSteps: number): HTMLElement {
  const container = document.createElement('div');
  container.className = 'progress-dots';
  
  for (let i = 0; i < totalSteps; i++) {
    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    if (i === 0) dot.classList.add('active');
    dot.dataset.step = String(i + 1);
    container.appendChild(dot);
  }
  
  return container;
}

function createNavigation(): HTMLElement {
  const nav = document.createElement('div');
  nav.className = 'wizard-navigation';
  
  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'btn-nav btn-prev';
  prevBtn.textContent = 'Previous';
  prevBtn.disabled = true;
  nav.appendChild(prevBtn);
  
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'btn-nav btn-next';
  nextBtn.textContent = 'Next';
  nav.appendChild(nextBtn);
  
  return nav;
}

function initializeWizard(
  form: HTMLFormElement,
  progressDots: HTMLElement,
  stepCounter: HTMLElement,
  navigation: HTMLElement,
  errorContainer: HTMLElement
): void {
  const sections = Array.from(form.querySelectorAll('.form-section')) as HTMLElement[];
  const dots = Array.from(progressDots.querySelectorAll('.progress-dot')) as HTMLElement[];
  const prevBtn = navigation.querySelector('.btn-prev') as HTMLButtonElement;
  const nextBtn = navigation.querySelector('.btn-next') as HTMLButtonElement;
  
  let currentStep = 0;
  
  sections[0].classList.add('active');
  
  const updateUI = () => {
  
    sections.forEach((section, index) => {
      section.classList.toggle('active', index === currentStep);
    });
    
    dots.forEach((dot, index) => {
      dot.classList.remove('active', 'completed');
      if (index < currentStep) {
        dot.classList.add('completed');
      } else if (index === currentStep) {
        dot.classList.add('active');
      }
    });
    
    stepCounter.textContent = `Step ${currentStep + 1} of ${sections.length}`;
    
    prevBtn.disabled = currentStep === 0;
    
    if (currentStep === sections.length - 1) {
      nextBtn.textContent = 'Create Business Bot';
      nextBtn.className = 'btn-nav btn-next';
    } else {
      nextBtn.textContent = 'Next';
      nextBtn.className = 'btn-nav btn-next';
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const validateCurrentSection = (): boolean => {
    const currentSection = sections[currentStep];
    const requiredFields = currentSection.querySelectorAll('[required]');
    
    errorContainer.style.display = 'none';
    
    for (const field of requiredFields) {
      const input = field as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      
      if (!input.value.trim()) {
        const label = currentSection.querySelector(`label[for="${input.id}"]`)?.textContent || 'This field';
        errorContainer.textContent = `${label.replace(' *', '')} is required`;
        errorContainer.style.display = 'block';
        input.focus();
        return false;
      }
    }
    
    return true;
  };
  
  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      updateUI();
    }
  });
  
  nextBtn.addEventListener('click', async () => {
    if (!validateCurrentSection()) {
      return;
    }
    
    if (currentStep < sections.length - 1) {
      currentStep++;
      updateUI();
    } else {
      
      await handleCreateBusiness(form, nextBtn, errorContainer);
    }
  });
}

function createSection1(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'form-section';
  
  const title = document.createElement('h2');
  title.textContent = '1. Basic Information';
  section.appendChild(title);
  
  section.appendChild(createFormField({
    type: 'text',
    name: 'businessName',
    label: 'Business Name',
    required: true,
    maxLength: 100,
    helpText: 'The official name of your business'
  }));
  
  
  section.appendChild(createFormField({
    type: 'textarea',
    name: 'businessDescription',
    label: 'Business Description',
    required: true,
    maxLength: 500,
    placeholder: 'Tell us about your business...',
    helpText: 'A brief overview of what your business does'
  }));
  
  const typeWrapper = document.createElement('div');
  typeWrapper.className = 'form-field-group';
  
  const typeField = createSelectField({
    name: 'businessType',
    label: 'Business Type',
    options: ['E-commerce', 'Real Estate', 'Restaurant', 'Hotel', 'Service-based', 'Tech/SaaS', 'Healthcare', 'Education', 'Other'],
    required: true
  });
  typeWrapper.appendChild(typeField);
  
  const otherTypeField = createFormField({
    type: 'text',
    name: 'businessTypeOther',
    label: 'Please specify',
    placeholder: 'Enter your business type'
  });
  otherTypeField.style.display = 'none';
  
  const typeSelect = typeField.querySelector('select') as HTMLSelectElement;
  typeSelect.addEventListener('change', () => {
    if (typeSelect.value === 'Other') {
      otherTypeField.style.display = 'block';
      (otherTypeField.querySelector('input') as HTMLInputElement).required = true;
    } else {
      otherTypeField.style.display = 'none';
      (otherTypeField.querySelector('input') as HTMLInputElement).required = false;
    }
  });
  
  typeWrapper.appendChild(otherTypeField);
  section.appendChild(typeWrapper);
  
  section.appendChild(createFormField({
    type: 'text',
    name: 'operatingHours',
    label: 'Operating Hours',
    required: true,
    placeholder: 'e.g., Mon-Fri 9AM-5PM',
    helpText: 'When is your business available?'
  }));
  
  
  section.appendChild(createFormField({
    type: 'text',
    name: 'location',
    label: 'Location',
    required: true,
    placeholder: 'City, Country',
    helpText: 'Primary business location'
  }));
  
  section.appendChild(createFormField({
    type: 'text',
    name: 'timezone',
    label: 'Timezone (Optional)',
    placeholder: 'e.g., America/New_York, Europe/London, Asia/Tokyo',
    helpText: 'Enter your timezone identifier'
  }));
  
  return section;
}

function createSection2(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'form-section';
  
  const title = document.createElement('h2');
  title.textContent = '2. Products & Services';
  section.appendChild(title);
  
  section.appendChild(createFormField({
    type: 'textarea',
    name: 'offerings',
    label: 'What do you offer?',
    required: true,
    maxLength: 1000,
    placeholder: 'Describe your products or services...',
    helpText: 'Detailed description of your offerings'
  }));
  

  section.appendChild(createDynamicArraySection({
    title: 'Popular Items (Optional)',
    name: 'popularItems',
    fields: [
      { type: 'text', name: 'name', label: 'Item Name', required: true },
      { type: 'textarea', name: 'description', label: 'Description', required: false },
      { type: 'number', name: 'price', label: 'Price', required: false, placeholder: '0.00' }
    ],
    helpText: 'Add your most popular products or services'
  }));
  
  section.appendChild(createCheckboxGroup({
    name: 'serviceDelivery',
    label: 'Service Delivery Options',
    options: ['Delivery', 'Pickup', 'In-person', 'Online/Virtual'],
    helpText: 'How do customers receive your products/services?'
  }));
  

  const pricingWrapper = document.createElement('div');
  pricingWrapper.className = 'form-field-group';
  
  const pricingToggle = createCheckboxField({
    name: 'canDiscussPricing',
    label: 'Allow chatbot to discuss pricing',
    defaultChecked: true,
    helpText: 'Enable if you want the chatbot to share pricing information'
  });
  pricingWrapper.appendChild(pricingToggle);
  
  const pricingNoteField = createFormField({
    type: 'textarea',
    name: 'pricingNote',
    label: 'Pricing Note (Optional)',
    placeholder: 'e.g., Bulk discounts available, Custom quotes for enterprise...'
  });
  
  const pricingCheckbox = pricingToggle.querySelector('input') as HTMLInputElement;
  pricingCheckbox.addEventListener('change', () => {
    pricingNoteField.style.display = pricingCheckbox.checked ? 'block' : 'none';
  });
  
  pricingWrapper.appendChild(pricingNoteField);
  section.appendChild(pricingWrapper);
  
  return section;
}

function createSection3(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'form-section';
  
  const title = document.createElement('h2');
  title.textContent = '3. Customer Support';
  section.appendChild(title);
  
  section.appendChild(createDynamicArraySection({
    title: 'Frequently Asked Questions (Optional)',
    name: 'faqs',
    fields: [
      { type: 'text', name: 'question', label: 'Question', required: true },
      { type: 'textarea', name: 'answer', label: 'Answer', required: true }
    ],
    helpText: 'Add common questions your customers ask'
  }));
  
  section.appendChild(createFormField({
    type: 'textarea',
    name: 'refundPolicy',
    label: 'Refund Policy',
    required: true,
    placeholder: 'Describe your refund policy...',
    helpText: 'How do you handle refunds?'
  }));
  
  section.appendChild(createFormField({
    type: 'textarea',
    name: 'cancellationPolicy',
    label: 'Cancellation Policy (Optional)',
    placeholder: 'Describe your cancellation policy...'
  }));
  
  section.appendChild(createFormField({
    type: 'textarea',
    name: 'importantPolicies',
    label: 'Other Important Policies (Optional)',
    placeholder: 'Any other policies customers should know...'
  }));
  
  section.appendChild(createSelectField({
    name: 'chatbotTone',
    label: 'Chatbot Tone',
    options: ['Friendly', 'Professional', 'Casual', 'Formal', 'Playful'],
    required: true,
    helpText: 'How should your chatbot communicate?'
  }));
  
  section.appendChild(createFormField({
    type: 'textarea',
    name: 'chatbotGreeting',
    label: 'Custom Greeting (Optional)',
    placeholder: 'e.g., Hi! Welcome to [Business]. How can I help you today?',
    helpText: 'Customize the first message customers see'
  }));
  
  section.appendChild(createFormField({
    type: 'textarea',
    name: 'chatbotRestrictions',
    label: 'Chatbot Restrictions (Optional)',
    placeholder: 'e.g., Do not make guarantees about delivery times...',
    helpText: 'What should the chatbot NOT do or promise?'
  }));
  
  return section;
}

function createSection4(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'form-section';
  
  const title = document.createElement('h2');
  title.textContent = '4. Contact & Escalation';
  section.appendChild(title);
  

  section.appendChild(createDynamicArraySection({
    title: 'Contact Methods',
    name: 'contactMethods',
    fields: [
      { 
        type: 'select', 
        name: 'method', 
        label: 'Method', 
        required: true,
        options: ['Email', 'Phone', 'WhatsApp', 'Live Chat', 'Social Media']
      },
      { type: 'text', name: 'value', label: 'Contact Details', required: true, placeholder: 'Enter email, phone, etc.' }
    ],
    helpText: 'How can customers reach you?',
    minItems: 1
  }));
  
  const escalationTitle = document.createElement('h3');
  escalationTitle.textContent = 'Escalation Contact';
  section.appendChild(escalationTitle);
  
  const escalationHelp = document.createElement('p');
  escalationHelp.className = 'help-text';
  escalationHelp.textContent = 'Who should be contacted for complex issues the chatbot cannot handle?';
  section.appendChild(escalationHelp);
  
  section.appendChild(createFormField({
    type: 'text',
    name: 'escalationName',
    label: 'Contact Name',
    required: true,
    placeholder: 'John Doe'
  }));
  
  section.appendChild(createFormField({
    type: 'email',
    name: 'escalationEmail',
    label: 'Contact Email',
    required: true,
    placeholder: 'john@example.com'
  }));
  
  section.appendChild(createFormField({
    type: 'tel',
    name: 'escalationPhone',
    label: 'Contact Phone (Optional)',
    placeholder: '+1-555-123-4567'
  }));
  
  section.appendChild(createCheckboxGroup({
    name: 'chatbotCapabilities',
    label: 'Chatbot Capabilities',
    options: ['Answer FAQs', 'Generate leads', 'Handle Complaints', 'Provide product info'],
    helpText: 'What should your chatbot be able to do?'
  }));
  
  return section;
}

interface FormFieldOptions {
  type: string;
  name: string;
  label: string;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  helpText?: string;
  value?: string;
}

function createFormField(options: FormFieldOptions): HTMLElement {
  const { type, name, label, required = false, maxLength, placeholder = '', helpText, value = '' } = options;
  
  const fieldWrapper = document.createElement('div');
  fieldWrapper.className = 'form-field';
  
  const labelElement = document.createElement('label');
  labelElement.innerHTML = label + (required ? ' <span style="color: #dc2626; font-weight: 700;">*</span>' : '');
  labelElement.htmlFor = name;
  fieldWrapper.appendChild(labelElement);
  
  let inputElement: HTMLInputElement | HTMLTextAreaElement;
  
  if (type === 'textarea') {
    inputElement = document.createElement('textarea');
    inputElement.rows = 4;
  } else {
    inputElement = document.createElement('input');
    inputElement.type = type;
  }
  
  inputElement.name = name;
  inputElement.id = name;
  inputElement.placeholder = placeholder;
  inputElement.required = required;
  inputElement.value = value;
  
  fieldWrapper.appendChild(inputElement);

  if (maxLength) {
    inputElement.maxLength = maxLength;
    const counter = document.createElement('span');
    counter.className = 'char-counter';
    counter.style.cssText = "display: block; text-align: right; font-size: 0.8rem; color: #666; margin-top: 5px;"
    counter.textContent = `0/${maxLength}`;
    inputElement.addEventListener('input', () => {
      counter.textContent = `${inputElement.value.length}/${maxLength}`;
    });
    fieldWrapper.appendChild(counter);
  }
  
  if (helpText) {
    const helpElement = document.createElement('span');
    helpElement.className = 'help-text';
    helpElement.textContent = helpText;
    fieldWrapper.appendChild(helpElement);
  }
  
  return fieldWrapper;
}

interface SelectFieldOptions {
  name: string;
  label: string;
  options: string[];
  required?: boolean;
  helpText?: string;
  selectedValue?: string;
}

function createSelectField(options: SelectFieldOptions): HTMLElement {
  const { name, label, options: selectOptions, required = false, helpText, selectedValue = '' } = options;
  
  const fieldWrapper = document.createElement('div');
  fieldWrapper.className = 'form-field';
  
  const labelElement = document.createElement('label');
  labelElement.textContent = label + (required ? ' *' : '');
  labelElement.htmlFor = name;
  fieldWrapper.appendChild(labelElement);
  
  const select = document.createElement('select');
  select.name = name;
  select.id = name;
  select.required = required;
  
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '-- Select --';
  select.appendChild(defaultOption);
  
  selectOptions.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    optionElement.textContent = option;
    optionElement.selected = option === selectedValue;
    select.appendChild(optionElement);
  });
  
  fieldWrapper.appendChild(select);
  
  if (helpText) {
    const helpElement = document.createElement('span');
    helpElement.className = 'help-text';
    helpElement.textContent = helpText;
    fieldWrapper.appendChild(helpElement);
  }
  
  return fieldWrapper;
}

interface CheckboxGroupOptions {
  name: string;
  label: string;
  options: string[];
  helpText?: string;
  checkedValues?: string[];
}

function createCheckboxGroup(options: CheckboxGroupOptions): HTMLElement {
  const { name, label, options: checkboxOptions, helpText, checkedValues = [] } = options;
  
  const fieldWrapper = document.createElement('div');
  fieldWrapper.className = 'form-field';
  
  const labelElement = document.createElement('label');
  labelElement.textContent = label;
  fieldWrapper.appendChild(labelElement);
  
  if (helpText) {
    const helpElement = document.createElement('span');
    helpElement.className = 'help-text';
    helpElement.style.marginBottom = "10px";
    helpElement.textContent = helpText;
    fieldWrapper.appendChild(helpElement);
  }
  
  const checkboxContainer = document.createElement('div');
  checkboxContainer.className = 'checkbox-group';
  
  checkboxOptions.forEach(option => {
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.className = 'checkbox-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = name;
    checkbox.value = option;
    checkbox.id = `${name}_${option.replace(/\s+/g, '_')}`;
    checkbox.checked = checkedValues.includes(option);
    
    const checkboxLabel = document.createElement('label');
    checkboxLabel.textContent = option;
    checkboxLabel.htmlFor = checkbox.id;
    
    checkboxWrapper.appendChild(checkbox);
    checkboxWrapper.appendChild(checkboxLabel);
    checkboxContainer.appendChild(checkboxWrapper);
  });
  
  fieldWrapper.appendChild(checkboxContainer);
  
  return fieldWrapper;
}

function createCheckboxField(options: { name: string; label: string; defaultChecked?: boolean; helpText?: string }): HTMLElement {
  const { name, label, defaultChecked = false, helpText } = options;
  
  const fieldWrapper = document.createElement('div');
  fieldWrapper.className = 'form-field checkbox-field';
  
  const checkboxWrapper = document.createElement('div');
  checkboxWrapper.className = 'checkbox-item';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = name;
  checkbox.id = name;
  checkbox.checked = defaultChecked;
  
  const checkboxLabel = document.createElement('label');
  checkboxLabel.textContent = label;
  checkboxLabel.htmlFor = name;
  
  checkboxWrapper.appendChild(checkbox);
  checkboxWrapper.appendChild(checkboxLabel);
  fieldWrapper.appendChild(checkboxWrapper);
  
  if (helpText) {
    const helpElement = document.createElement('span');
    helpElement.className = 'help-text';
    helpElement.textContent = helpText;
    fieldWrapper.appendChild(helpElement);
  }
  
  return fieldWrapper;
}

interface DynamicArrayField {
  type: string;
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

interface DynamicArrayOptions {
  title: string;
  name: string;
  fields: DynamicArrayField[];
  helpText?: string;
  minItems?: number;
}

function createDynamicArraySection(options: DynamicArrayOptions): HTMLElement {
  const { title, name, fields, helpText, minItems = 0 } = options;
  
  const section = document.createElement('div');
  section.className = 'dynamic-array-section';
  section.dataset.arrayName = name;
  
  const header = document.createElement('div');
  header.className = 'dynamic-array-header';
  
  const titleElement = document.createElement('h3');
  titleElement.textContent = title;
  header.appendChild(titleElement);
  
  if (helpText) {
    const helpElement = document.createElement('p');
    helpElement.className = 'help-text';
    helpElement.textContent = helpText;
    header.appendChild(helpElement);
  }
  
  section.appendChild(header);
  
  const itemsContainer = document.createElement('div');
  itemsContainer.className = 'dynamic-array-items';
  section.appendChild(itemsContainer);
  
  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'btn-secondary';
  addButton.textContent = `+ Add ${title.replace(/\s*\(Optional\)/, '')}`;
  
  addButton.addEventListener('click', () => {
    const item = createDynamicArrayItem(name, fields, itemsContainer, minItems);
    itemsContainer.appendChild(item);
  });
  
  section.appendChild(addButton);
  
  if (minItems > 0) {
    for (let i = 0; i < minItems; i++) {
      const item = createDynamicArrayItem(name, fields, itemsContainer, minItems);
      itemsContainer.appendChild(item);
    }
  }
  
  return section;
}

function createDynamicArrayItem(
  arrayName: string,
  fields: DynamicArrayField[],
  container: HTMLElement,
  minItems: number
): HTMLElement {
  const item = document.createElement('div');
  item.className = 'dynamic-array-item';
  
  const index = container.children.length;
  
  fields.forEach(field => {
    const fieldName = `${arrayName}[${index}][${field.name}]`;
    
    if (field.type === 'select' && field.options) {
      const selectField = createSelectField({
        name: fieldName,
        label: field.label,
        options: field.options,
        required: field.required
      });
      item.appendChild(selectField);
    } else {
      const formField = createFormField({
        type: field.type,
        name: fieldName,
        label: field.label,
        required: field.required,
        placeholder: field.placeholder
      });
      item.appendChild(formField);
    }
  });
  
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'btn-remove';
  removeButton.textContent = 'Remove';
  
  removeButton.addEventListener('click', () => {
    if (container.children.length > minItems) {
      item.remove();
      reindexArrayItems(container, arrayName);
    }
  });
  
  if (minItems === 0 || container.children.length >= minItems) {
    item.appendChild(removeButton);
  }
  
  return item;
}

function reindexArrayItems(container: HTMLElement, arrayName: string): void {
  Array.from(container.children).forEach((item, newIndex) => {
    const inputs = item.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const nameAttr = (input as HTMLInputElement).name;
      const fieldName = nameAttr.match(/\[([^\]]+)\]$/)?.[1];
      if (fieldName) {
        (input as HTMLInputElement).name = `${arrayName}[${newIndex}][${fieldName}]`;
      }
    });
  });
}

function collectArrayData(form: HTMLFormElement, arrayName: string): any[] {
  const items: any[] = [];
  const formData = new FormData(form);
  
  let maxIndex = -1;
  for (const key of formData.keys()) {
    if (key.startsWith(`${arrayName}[`)) {
      const match = key.match(/\[(\d+)\]/);
      if (match) {
        const index = parseInt(match[1]);
        if (index > maxIndex) maxIndex = index;
      }
    }
  }
  
  for (let i = 0; i <= maxIndex; i++) {
    const item: any = {};
    let hasData = false;
    
    for (const key of formData.keys()) {
      if (key.startsWith(`${arrayName}[${i}]`)) {
        const fieldMatch = key.match(/\[([^\]]+)\]$/);
        if (fieldMatch) {
          const fieldName = fieldMatch[1];
          const value = formData.get(key);
          if (value) {
            item[fieldName] = fieldName === 'price' ? parseFloat(value as string) : value;
            hasData = true;
          }
        }
      }
    }
    
    if (hasData) {
      items.push(item);
    }
  }
  
  return items;
}

async function handleCreateBusiness(
  form: HTMLFormElement,
  submitButton: HTMLButtonElement,
  errorContainer: HTMLElement
): Promise<void> {
  try {
    submitButton.disabled = true;
    submitButton.textContent = 'Creating...';
    errorContainer.style.display = 'none';
    
    const formData = new FormData(form);
    
    let businessType = formData.get('businessType') as string;
    if (businessType === 'Other') {
      businessType = formData.get('businessTypeOther') as string;
    }
    
    const businessData: CreateBusinessRequest = {
      basicInfo: {
        businessName: formData.get('businessName') as string,
        businessDescription: formData.get('businessDescription') as string,
        businessType: businessType as any,
        operatingHours: formData.get('operatingHours') as string,
        location: formData.get('location') as string,
        timezone: (formData.get('timezone') as string) || undefined
      },
      productsServices: {
        offerings: formData.get('offerings') as string,
        popularItems: collectArrayData(form, 'popularItems'),
        serviceDelivery: formData.getAll('serviceDelivery') as any[],
        pricingDisplay: {
          canDiscussPricing: formData.get('canDiscussPricing') === 'on',
          pricingNote: (formData.get('pricingNote') as string) || undefined
        }
      },
      customerSupport: {
        faqs: collectArrayData(form, 'faqs'),
        policies: {
          refundPolicy: formData.get('refundPolicy') as string,
          cancellationPolicy: (formData.get('cancellationPolicy') as string) || undefined,
          importantPolicies: (formData.get('importantPolicies') as string) || undefined
        },
        chatbotTone: formData.get('chatbotTone') as any,
        chatbotGreeting: (formData.get('chatbotGreeting') as string) || undefined,
        chatbotRestrictions: (formData.get('chatbotRestrictions') as string) || undefined
      },
      contactEscalation: {
        contactMethods: collectArrayData(form, 'contactMethods'),
        escalationContact: {
          name: formData.get('escalationName') as string,
          email: formData.get('escalationEmail') as string,
          phone: (formData.get('escalationPhone') as string) || undefined
        },
        chatbotCapabilities: formData.getAll('chatbotCapabilities') as any[]
      }
    };
    
    await createBusiness(businessData);
    
    showModal({
      title: 'Success',
      content: '<p style="margin: 0;">Business created successfully!</p>',
      showCloseButton: true
    });
        window.location.hash = '#/dashboard/businesses';
    
  } catch (error: any) {
    errorContainer.textContent = error.message || 'Failed to create business';
    errorContainer.style.display = 'block';
    submitButton.disabled = false;
    submitButton.textContent = 'Create Business Bot';
    console.error('Create business error:', error);
  }
}