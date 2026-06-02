import { createBreadcrumb } from '../../../components/breadcrumb';
import { createLoadingSpinner, hideLoadingSpinner } from '../../../components/loading-spinner';
import { getBusinessById, updateBusiness } from '../../../services/business.service';
import type { UpdateBusinessRequest, Business } from '../../../types/business.types';
import { showModal } from '../../../components/modal';

function injectEditWizardStyles() {
  if (document.getElementById('business-wizard-styles')) return;

  const style = document.createElement('style');
  style.id = 'business-wizard-styles';
  style.textContent = `
    :root {
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
    }

    .business-edit-wizard {
      max-width: 900px;
      margin: 0 auto;
      padding-bottom: 0 20px;
      box-sizing: border-box;
    }

    /* Glass Container */
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

    /* Header & Progress */
    .page-header { text-align: center; margin-bottom: 40px; }
    
    .wizard-progress-bar {
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
      transition: all 0.3s ease;
      position: relative;
    }
    .progress-dot.active { background: var(--primary); transform: scale(1.4); }
    .progress-dot.completed { background: var(--success-green); }

    .step-counter {
      text-align: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 30px;
    }

    /* Form Sections */
    .form-section { display: none; }
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
      border-bottom: 2px solid var(--primary-dim);
      padding-bottom: 10px;
    }
    
    h3 { font-size: 1.2rem; color: var(--text-main); margin-top: 20px; }

    /* Inputs */
    .form-field { margin-bottom: 24px; }
    
    label { display: block; margin-bottom: 8px; font-weight: 600; color: #374151; }

    input, textarea, select {
      width: 100%;
      padding: 14px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: rgba(255,255,255,0.8);
      font-size: 1rem;
      font-family: inherit;
      box-sizing: border-box;
      transition: all 0.2s ease;
      color: black;
    }

    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: var(--primary);
      background: #fff;
      box-shadow: 0 0 0 4px var(--primary-dim);
    }

    /* Checkbox Tiles */
    .checkbox-group {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
    }
    .checkbox-item input { position: absolute; opacity: 0; }
    .checkbox-item label {
      display: flex; align-items: center; justify-content: center;
      background: #fff; border: 1px solid #e5e7eb; border-radius: 10px;
      padding: 15px; cursor: pointer; font-weight: 500; text-align: center;
      transition: all 0.2s;
    }
    .checkbox-item input:checked + label {
      background: var(--primary-dim); border-color: var(--primary); color: var(--primary); font-weight: 700;
    }

    /* Dynamic Arrays */
    .dynamic-array-section {
      background: rgba(255,255,255,0.5);
      border: 1px dashed var(--secondary);
      border-radius: 16px;
      padding: 25px;
      margin-bottom: 30px;
    }
    .dynamic-array-item {
      background: #fff; border-radius: 12px; padding: 20px;
      margin-bottom: 15px; border: 1px solid #f0f0f0;
      position: relative;
    }

    /* Buttons */
    .wizard-navigation {
      display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.05);
    }
    .btn-nav {
      padding: 14px 35px; border-radius: 12px; font-weight: 600; font-size: 1rem; cursor: pointer; border: none;
    }
    .btn-prev { background: #fff; border: 1px solid #e5e7eb; color: var(--text-main); }
    .btn-next { background: var(--primary); color: #fff; }
    .btn-secondary { background: #fff; color: var(--primary); border: 1px solid var(--primary); padding: 8px 16px; border-radius: 8px; cursor: pointer; }
    .btn-remove { 
      color: var(--error-red); background: #fff0f0; border: 1px solid #ffcccc; 
      padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem;
      position: absolute; top: 15px; right: 15px;
    }
    .error-message {
      background: #fef2f2; border: 1px solid #fee2e2; color: var(--error-red);
      padding: 15px; border-radius: 12px; margin-bottom: 20px; display: none;
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
      { label: 'Edit' }
    ]);
    container.appendChild(breadcrumb);
    
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
    errorMessage.textContent = 'Failed to load business. Please try again.';
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
    if (currentStep === sections.length - 1) {
      nextBtn.textContent = 'Save Changes';
      nextBtn.type = 'submit';
    } else {
      nextBtn.textContent = 'Next';
      nextBtn.type = 'button';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  updateUI();

  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      updateUI();
    }
  });

  nextBtn.addEventListener('click', (e) => {
    if (nextBtn.type === 'submit') return;

    e.preventDefault();
    if (validateStep(sections[currentStep], errorContainer)) {
        currentStep++;
        updateUI();
    }
  });


  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (validateStep(sections[currentStep], errorContainer)) {
        await handleUpdateBusiness(businessId, form, nextBtn, errorContainer);
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
    type: 'textarea', name: 'offerings', label: 'What do you offer?', required: true,
    value: business.productsServices.offerings
  }));

  s2.appendChild(createDynamicArraySection({
    title: 'Popular Items', name: 'popularItems',
    fields: [
        { type: 'text', name: 'name', label: 'Name', required: true },
        { type: 'textarea', name: 'description', label: 'Description' },
        { type: 'number', name: 'price', label: 'Price' }
    ],
    existingData: business.productsServices.popularItems
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

function createFormField(opts: { type: string, name: string, label: string, required?: boolean, value?: string }): HTMLElement {
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
            popularItems: collectArrayData(form, 'popularItems'),
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
            chatbotRestrictions: formData.get('chatbotRestrictions') as string
        },
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
    
    showModal({
      title: 'Success',
      content: '<p style="margin: 0;">Business updated successfully!</p>',
      showCloseButton: true
    });
    window.location.hash = '#/dashboard/businesses';

  } catch (error: any) {
    btn.disabled = false;
    btn.textContent = 'Save Changes';
    errorBox.textContent = error.message || 'Failed to update business';
    errorBox.style.display = 'block';
  }
}