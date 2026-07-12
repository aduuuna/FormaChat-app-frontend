import { createBreadcrumb } from '../../../components/breadcrumb';
import { createBusiness, prefillBusiness } from '../../../services/business.service';
import type { PrefillResult } from '../../../services/business.service';
import type { CreateBusinessRequest } from '../../../types/business.types';
import { showToast } from '../../../utils/toast';

function injectWizardStyles() {
  if (document.getElementById('business-create-wizard-styles')) return;

  const style = document.createElement('style');
  style.id = 'business-create-wizard-styles';
  style.textContent = `
    /* Every rule below is scoped under .business-create so this stylesheet
       can never bleed into (or be shadowed by) the Edit wizard's stylesheet -
       both pages used to share one <style> id, so whichever page loaded
       first in the SPA silently won and the other page's CSS never
       applied at all. */
    .business-create {
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

      max-width: 900px;
      margin: 0 auto;
      padding-bottom: 80px;
      padding: 0 20px;
      box-sizing: border-box;
    }

    /* --- 1. GLASS CONTAINER --- */
    .business-create .wizard-container {
      background: var(--bg-glass);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--border-glass);
      border-radius: 24px;
      box-shadow: var(--shadow-glass);
      padding: 50px;
      margin-top: 30px;
      animation: createWizardFloatUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
      box-sizing: border-box;
      width: 100%;
    }

    @media (max-width: 768px) {
      .business-create .wizard-container {
        padding: 30px 20px;
      }
    }

    @keyframes createWizardFloatUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* --- 2. HEADER & PROGRESS --- */
    .business-create .page-header {
      text-align: center;
      margin-bottom: 40px;
    }
    .business-create .page-description {
      color: var(--text-muted);
      font-size: 1.1rem;
    }

    /* Styled Progress Bar */
    .business-create .progress-dots {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      margin: 30px 0;
      flex-wrap: wrap;
    }
    .business-create .progress-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #e5e7eb;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
      flex-shrink: 0;
    }
    .business-create .progress-dot::after {
      content: '';
      position: absolute;
      top: 50%; left: 100%;
      width: 15px; height: 2px;
      background: #e5e7eb;
      transform: translateY(-50%);
      z-index: -1;
    }
    .business-create .progress-dot:last-child::after { display: none; }

    .business-create .progress-dot.active {
      background: var(--primary);
      transform: scale(1.4);
      box-shadow: 0 0 0 4px var(--primary-dim);
    }
    .business-create .progress-dot.completed {
      background: var(--success-green);
    }

    .business-create .step-counter {
      text-align: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 30px;
    }

    /* --- 3. FORM SECTIONS --- */
    .business-create .form-section {
      display: none;
    }
    .business-create .form-section.active {
      display: block;
      animation: createWizardSlideInRight 0.4s ease-out;
    }

    @keyframes createWizardSlideInRight {
      from { opacity: 0; transform: translateX(15px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .business-create h2 {
      font-size: 1.8rem;
      color: var(--text-main);
      margin-bottom: 25px;
      font-weight: 800;
      letter-spacing: -0.5px;
      border-bottom: 2px solid var(--primary-dim);
      padding-bottom: 10px;
    }

    .business-create h3 {
      font-size: 1.2rem;
      color: var(--text-main);
      margin-top: 20px;
      margin-bottom: 10px;
    }

    /* --- 4. INPUTS & FIELDS --- */
    .business-create .form-field { margin-bottom: 24px; }

    .business-create label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      font-size: 0.95rem;
      color: #374151;
    }

    .business-create input[type="text"],
    .business-create input[type="email"],
    .business-create input[type="number"],
    .business-create input[type="tel"],
    .business-create input[type="url"],
    .business-create textarea,
    .business-create select {
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

    .business-create input:focus,
    .business-create textarea:focus,
    .business-create select:focus {
      outline: none;
      border-color: var(--primary);
      background: #fff;
      box-shadow: 0 0 0 4px var(--primary-dim);
    }

    .business-create .help-text {
      font-size: 0.85rem;
      color: black;
      margin-top: 6px;
      display: block;
    }

    /* --- 5. TILE/CARD CHECKBOXES (The "Modern" Look) --- */
    .business-create .checkbox-group {
      margin-top: 10px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
    }

    .business-create .checkbox-item {
      position: relative;
    }

    /* Hidden checkbox/radio but accessible */
    .business-create .checkbox-item input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }

    /* The visual label acts as the card */
    .business-create .checkbox-item label {
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
    .business-create .checkbox-item input:checked + label {
      background: var(--primary-dim);
      border-color: var(--primary);
      color: var(--primary);
      font-weight: 700;
      box-shadow: 0 4px 10px rgba(99, 107, 47, 0.15);
    }

    /* Single Checkbox toggle (Switch style) */
    .business-create .checkbox-field .checkbox-item {
      display: flex;
      align-items: center;
    }
    .business-create .checkbox-field input {
      position: static;
      opacity: 1;
      width: 20px;
      height: 20px;
      accent-color: var(--primary);
      margin-right: 10px;
    }
    .business-create .checkbox-field label {
      border: none;
      background: none;
      box-shadow: none;
      padding: 0;
      text-align: left;
      justify-content: flex-start;
    }

    /* --- 6. DYNAMIC ARRAYS (Cards inside Cards) --- */
    .business-create .dynamic-array-section {
      background: rgba(255,255,255,0.5);
      border: 1px dashed var(--secondary);
      border-radius: 16px;
      padding: 25px;
      margin-bottom: 30px;
    }

    .business-create .dynamic-array-item {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
      border: 1px solid #f0f0f0;
      box-shadow: 0 4px 15px rgba(0,0,0,0.03);
      position: relative;
      animation: createWizardFadeIn 0.3s;
    }
    .business-create .dynamic-array-item:last-child { margin-bottom: 0; }

    @keyframes createWizardFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    /* --- 7. BUTTONS --- */
    .business-create .wizard-navigation {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid rgba(0,0,0,0.05);
    }

    .business-create .btn-nav {
      padding: 14px 35px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .business-create .btn-prev {
      background: #fff;
      border: 1px solid #e5e7eb;
      color: var(--text-main);
    }
    .business-create .btn-prev:hover:not(:disabled) {
      background: #f9fafb;
      transform: translateX(-3px);
    }

    .business-create .btn-next {
      background: var(--primary);
      color: #fff;
      box-shadow: 0 4px 15px var(--primary-dim);
    }
    .business-create .btn-next:hover:not(:disabled) {
      background: #505726; /* Darker olive */
      transform: translateX(3px);
      box-shadow: 0 6px 20px var(--primary-dim);
    }

    .business-create .btn-secondary {
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
    .business-create .btn-secondary:hover {
      background: var(--primary-dim);
    }

    .business-create .btn-remove {
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

    .business-create .error-message {
      background: #fef2f2;
      border: 1px solid #fee2e2;
      color: var(--error-red);
      padding: 15px;
      border-radius: 12px;
      margin-bottom: 20px;
      font-weight: 500;
    }

    /* --- 8. QUICK START (AI PRE-FILL) --- */
    .business-create .quickstart-intro {
      color: var(--text-muted);
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .business-create .quickstart-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 24px 0;
      color: var(--text-muted);
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .business-create .quickstart-divider::before,
    .business-create .quickstart-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e5e7eb;
    }
    .business-create .quickstart-upload-zone {
      border: 2px dashed var(--secondary);
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      background: rgba(255,255,255,0.5);
      margin-bottom: 20px;
    }
    .business-create .quickstart-upload-zone p {
      color: var(--text-muted);
      font-size: 0.85rem;
      margin: 8px 0 0;
    }
    .business-create .quickstart-filename {
      font-weight: 600;
      color: var(--primary);
      margin-top: 10px;
      font-size: 0.9rem;
    }
    .business-create .quickstart-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
      margin-top: 24px;
    }
    .business-create .btn-quickstart-skip {
      background: transparent;
      color: var(--text-muted);
      border: none;
      cursor: pointer;
      font-size: 0.9rem;
      text-decoration: underline;
      padding: 14px 10px;
    }
    .business-create .quickstart-summary {
      background: rgba(5, 150, 105, 0.08);
      border: 1px solid rgba(5, 150, 105, 0.3);
      color: var(--success-green);
      padding: 14px 18px;
      border-radius: 12px;
      margin-top: 20px;
      font-weight: 600;
      font-size: 0.9rem;
      display: none;
    }

    /* ── Mobile ── */
    @media (max-width: 600px) {
      .business-create {
        padding: 0 12px 60px;
      }
      .business-create .wizard-container {
        padding: 24px 18px;
        border-radius: 16px;
      }
      .business-create h2 {
        font-size: 1.3rem;
        margin-bottom: 18px;
      }
      .business-create .wizard-navigation {
        margin-top: 28px;
      }
      .business-create .btn-nav {
        padding: 12px 20px;
        font-size: 0.9rem;
      }
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
  
  const progressDots = createProgressDots(5);
  wizardContainer.appendChild(progressDots);

  const stepCounter = document.createElement('div');
  stepCounter.className = 'step-counter';
  stepCounter.textContent = 'Step 1 of 5';
  wizardContainer.appendChild(stepCounter);


  const form = document.createElement('form');
  form.className = 'business-form';

  const section1 = createSection1();
  const section2 = createSection2();
  const section3 = createSection3();
  const section4 = createSection4();
  const section0 = createSection0({ section1, section2, section3, section4 });

  form.appendChild(section0);
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

function createSection0(otherSections: { section1: HTMLElement; section2: HTMLElement; section3: HTMLElement; section4: HTMLElement }): HTMLElement {
  const section = document.createElement('section');
  section.className = 'form-section';

  const title = document.createElement('h2');
  title.textContent = 'Quick Start';
  section.appendChild(title);

  const intro = document.createElement('p');
  intro.className = 'quickstart-intro';
  intro.textContent = "Paste your website copy or a brochure, or upload a PDF/Word document (menu, catalog, FAQ sheet - whatever you've already got). We'll draft your business description, offerings, and FAQs so you're editing instead of starting from a blank page. Totally optional - skip it and fill everything in yourself if you'd rather.";
  section.appendChild(intro);

  const textareaField = createFormField({
    type: 'textarea',
    name: 'quickstartText',
    label: 'Paste text about your business (optional)',
    placeholder: 'Paste your website\'s About page, a product description, anything...',
  });
  (textareaField.querySelector('textarea') as HTMLTextAreaElement).rows = 6;
  section.appendChild(textareaField);

  const divider = document.createElement('div');
  divider.className = 'quickstart-divider';
  divider.textContent = 'and / or';
  section.appendChild(divider);

  const uploadZone = document.createElement('div');
  uploadZone.className = 'quickstart-upload-zone';
  const uploadBtn = document.createElement('button');
  uploadBtn.type = 'button';
  uploadBtn.className = 'btn-secondary';
  uploadBtn.textContent = '📄 Upload a Document';
  uploadZone.appendChild(uploadBtn);
  const uploadHint = document.createElement('p');
  uploadHint.textContent = 'PDF or Word (.docx), up to 15MB';
  uploadZone.appendChild(uploadHint);
  const filenameDisplay = document.createElement('p');
  filenameDisplay.className = 'quickstart-filename';
  filenameDisplay.style.display = 'none';
  uploadZone.appendChild(filenameDisplay);
  section.appendChild(uploadZone);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  fileInput.style.display = 'none';
  section.appendChild(fileInput);

  let selectedFile: File | undefined;
  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    selectedFile = fileInput.files?.[0];
    if (selectedFile) {
      filenameDisplay.textContent = `Selected: ${selectedFile.name}`;
      filenameDisplay.style.display = 'block';
    }
  });

  const summary = document.createElement('div');
  summary.className = 'quickstart-summary';
  section.appendChild(summary);

  const actions = document.createElement('div');
  actions.className = 'quickstart-actions';

  const generateBtn = document.createElement('button');
  generateBtn.type = 'button';
  generateBtn.className = 'btn-nav btn-next';
  generateBtn.textContent = '✨ Generate Suggestions';
  actions.appendChild(generateBtn);

  const skipBtn = document.createElement('button');
  skipBtn.type = 'button';
  skipBtn.className = 'btn-quickstart-skip';
  skipBtn.textContent = "Skip - I'll fill it in myself";
  actions.appendChild(skipBtn);

  section.appendChild(actions);

  generateBtn.addEventListener('click', async () => {
    const rawText = (textareaField.querySelector('textarea') as HTMLTextAreaElement).value.trim();

    if (!rawText && !selectedFile) {
      showToast('Paste some text or upload a document first.', 'error');
      return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    summary.style.display = 'none';

    try {
      const result = await prefillBusiness({ rawText: rawText || undefined, file: selectedFile });
      applyPrefillResult(result, otherSections);

      const filledCount = Object.keys(result).length;
      summary.textContent = filledCount > 0
        ? `✓ Applied suggestions to ${filledCount} field${filledCount === 1 ? '' : 's'} - review and edit them in the next steps.`
        : "Didn't find enough detail to suggest anything - no worries, just fill in the next steps yourself.";
      summary.style.display = 'block';
      showToast('Suggestions ready - review them as you go through the next steps.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to generate suggestions.', 'error');
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = '✨ Generate Suggestions';
    }
  });

  skipBtn.addEventListener('click', () => {
    const nextBtn = document.querySelector('.btn-next') as HTMLButtonElement;
    nextBtn?.click();
  });

  return section;
}

/**
 * Populate the wizard's own fields (steps 1-4) with AI-drafted suggestions.
 * Values are set programmatically then an 'input' event is dispatched so
 * existing listeners (character counters) pick up the new length.
 */
function applyPrefillResult(
  result: PrefillResult,
  sections: { section1: HTMLElement; section2: HTMLElement; section3: HTMLElement; section4: HTMLElement }
): void {
  const setValue = (root: HTMLElement, name: string, value: string) => {
    const field = root.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    if (!field || !value) return;
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  };

  if (result.businessDescription) setValue(sections.section1, 'businessDescription', result.businessDescription);
  if (result.businessType) setValue(sections.section1, 'businessType', result.businessType);

  if (result.offerings) setValue(sections.section2, 'offerings', result.offerings);

  // Note: popularItems is intentionally not applied here anymore - individual
  // products (with photos/price/stock) live in the dedicated Products tab now,
  // not as a free-text array in the questionnaire. See handleCreateBusiness's
  // post-create redirect, which sends the owner straight to that tab.

  if (result.refundPolicy) setValue(sections.section3, 'refundPolicy', result.refundPolicy);
  if (result.chatbotTone) setValue(sections.section3, 'chatbotTone', result.chatbotTone);

  if (result.faqs && result.faqs.length > 0) {
    const addBtn = sections.section3.querySelector('.dynamic-array-section .btn-secondary') as HTMLButtonElement;
    const itemsContainer = sections.section3.querySelector('.dynamic-array-items') as HTMLElement;
    result.faqs.forEach(faq => {
      addBtn?.click();
      const lastItem = itemsContainer?.lastElementChild as HTMLElement;
      if (!lastItem) return;
      const questionInput = lastItem.querySelector('[name$="[question]"]') as HTMLInputElement;
      const answerInput = lastItem.querySelector('[name$="[answer]"]') as HTMLTextAreaElement;
      if (questionInput) questionInput.value = faq.question;
      if (answerInput) answerInput.value = faq.answer;
    });
  }
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
    helpText: 'Detailed description of your offerings - for individual products with photos, prices, and stock, use the Products tab after creating your business'
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

  section.appendChild(createFormField({
    type: 'textarea',
    name: 'chatbotCustomInstructions',
    label: 'Additional AI Instructions (Optional)',
    placeholder: 'e.g., Always respond in French. End every message with our tagline. Never quote prices without a consultation call.',
    helpText: 'Free-text instructions layered on top of the tone setting. Max 1000 characters.'
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

  section.appendChild(createFormField({
    type: 'url',
    name: 'webhookUrl',
    label: 'Webhook URL (Optional)',
    placeholder: 'https://your-site.com/webhooks/formachat',
    helpText: 'We will POST to this URL every time a new lead is captured. Connects FormaChat to your CRM, Zapier, or any custom system.'
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
        popularItems: [], // individual products now live in the Products tab, not this free-text list
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
        chatbotRestrictions: (formData.get('chatbotRestrictions') as string) || undefined,
        chatbotCustomInstructions: (formData.get('chatbotCustomInstructions') as string) || undefined
      },
      webhookUrl: (formData.get('webhookUrl') as string) || undefined,
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
    
    const created = await createBusiness(businessData);
    showToast('Business created! Now add your products.', 'success');
    window.location.hash = `#/dashboard/businesses/${created._id}/products`;


  } catch (error: any) {
    errorContainer.textContent = error.message || 'Failed to create business';
    errorContainer.style.display = 'block';
    submitButton.disabled = false;
    submitButton.textContent = 'Create Business Bot';
    console.error('Create business error:', error);
  }
}