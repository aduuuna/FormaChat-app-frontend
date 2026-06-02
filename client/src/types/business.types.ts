export type BusinessType = 
  | 'E-commerce' 
  | 'Real Estate' 
  | 'Restaurant' 
  | 'Hotel'
  | 'Service-based' 
  | 'Tech/SaaS' 
  | 'Healthcare' 
  | 'Education' 
  | 'Other';

export type ServiceDeliveryType = 
  | 'Delivery' 
  | 'Pickup' 
  | 'In-person' 
  | 'Online/Virtual';

export type ChatbotTone = 
  | 'Friendly' 
  | 'Professional' 
  | 'Casual' 
  | 'Formal' 
  | 'Playful';

export type ContactMethodType = 
  | 'Email' 
  | 'Phone' 
  | 'WhatsApp' 
  | 'Live Chat' 
  | 'Social Media';


export type ChatbotCapabilityType = 
  | 'Answer FAQs' 
  | 'Book appointments' 
  | 'Generate leads' 
  | 'Handle Complaints' 
  | 'Provide product info'
  | 'Process orders';


export type VectorStatus = 'pending' | 'completed' | 'failed' | 'frozen';


export interface BasicInfo {
  businessName: string;
  businessDescription: string;
  businessType: BusinessType;
  operatingHours: string;
  location: string;
  timezone?: string;
}

export interface PopularItem {
  name: string;
  description?: string;
  price?: number;
}

export interface PricingDisplay {
  canDiscussPricing: boolean;
  pricingNote?: string;
}

export interface ProductsServices {
  offerings: string;
  popularItems: PopularItem[];
  serviceDelivery: ServiceDeliveryType[];
  pricingDisplay?: PricingDisplay;
}

export interface FAQ {
  question: string;
  answer: string;
}


export interface Policies {
  refundPolicy: string;
  cancellationPolicy?: string;
  importantPolicies?: string;
}

export interface CustomerSupport {
  faqs: FAQ[];
  policies: Policies;
  chatbotTone: ChatbotTone;
  chatbotGreeting?: string;
  chatbotRestrictions?: string;
}

export interface ContactMethod {
  method: ContactMethodType;
  value: string;
}

export interface EscalationContact {
  name: string;
  email: string;
  phone?: string;
}

export interface ContactEscalation {
  contactMethods: ContactMethod[];
  escalationContact: EscalationContact;
  chatbotCapabilities: ChatbotCapabilityType[];
}

export interface FileDocument {
  fileName: string;
  fileUrl: string;
  uploadDate: Date;
  fileSize: number;
}


export interface FileImage {
  fileName: string;
  fileUrl: string;
  uploadDate: Date;
  category?: string;
}


export interface Files {
  documents: FileDocument[];
  images: FileImage[];
}

export interface VectorInfo {
  namespace: string;
  lastVectorUpdate: Date;
  vectorStatus: VectorStatus;
  needsUpdate?: boolean;
  vectorCount?: number;
  lastSyncAttempt?: Date;
  processingErrors?: {
    lastError?: string;
    lastErrorAt?: Date;
  };
}

export interface FreezeInfo {
  isFrozen: boolean;
  reason?: 'trial_expired' | 'payment_failed' | 'admin_action' | 'subscription_canceled' | 'user_requested';
  frozenAt?: Date;
  frozenBy?: 'system' | 'admin';
  adminNote?: string;
  autoUnfreezeAt?: Date;
}

export interface Business {
  _id: string;
  userId: string;
  userEmail: string;
  isActive: boolean;
  freezeInfo?: FreezeInfo;
  basicInfo: BasicInfo;
  productsServices: ProductsServices;
  customerSupport: CustomerSupport;
  contactEscalation: ContactEscalation;
  files?: Files;
  vectorInfo: VectorInfo;
  createdAt: Date;
  updatedAt: Date;
}


export interface CreateBusinessRequest {
  basicInfo: BasicInfo;
  productsServices: ProductsServices;
  customerSupport: CustomerSupport;
  contactEscalation: ContactEscalation;
}

export interface UpdateBusinessRequest {
  basicInfo?: Partial<BasicInfo>;
  productsServices?: Partial<ProductsServices>;
  customerSupport?: Partial<CustomerSupport>;
  contactEscalation?: Partial<ContactEscalation>;
}

export interface BusinessListResponse {
  businesses: Business[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BusinessChatConfig {
  allowed: boolean;
  config?: {
    namespace: string;
    vectorStatus: VectorStatus;
    businessName: string;
    businessDescription: string;
    chatbotTone: ChatbotTone;
    chatbotGreeting?: string;
    chatbotRestrictions?: string;
    chatbotCapabilities: ChatbotCapabilityType[];
    escalationContact: EscalationContact;
    contactMethods: ContactMethod[];
    pricingDisplay?: PricingDisplay;
  };
}