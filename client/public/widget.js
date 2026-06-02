(function() {
  'use strict';
  
  const FormachatWidget = {
    config: {
      businessId: null,
      position: 'bottom-right', 
      primaryColor: '#636b2f', 
      baseUrl: 'https://formachat.com'
      // baseUrl: 'https://frontend-mockup-phi.vercel.app'
    },
    
    isOpen: false,
    container: null,
    button: null,
    iframe: null,
    
    icons: {
      chat: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
      close: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
    },
    
    init: function(options) {
      this.config = { ...this.config, ...options };
      
      if (!this.config.businessId) {
        console.error('[Formachat Widget] businessId is required');
        return;
      }
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.render());
      } else {
        this.render();
      }
    },
    
    render: function() {
     
      this.container = document.createElement('div');
      this.container.id = 'formachat-widget-container';
      this.container.style.cssText = this.getContainerStyles();
      
      this.button = document.createElement('button');
      this.button.id = 'formachat-widget-button';
      this.button.innerHTML = this.icons.chat; 
      this.button.style.cssText = this.getButtonStyles();
      
     
      this.button.addEventListener('mouseenter', () => {
        this.button.style.transform = 'scale(1.05) translateY(-2px)';
        this.button.style.boxShadow = '0 10px 25px rgba(99, 107, 47, 0.4)';
      });
      this.button.addEventListener('mouseleave', () => {
        this.button.style.transform = 'scale(1) translateY(0)';
        this.button.style.boxShadow = '0 4px 12px rgba(99, 107, 47, 0.3)';
      });

      this.button.addEventListener('click', () => this.toggle());
      
      this.iframe = document.createElement('iframe');
      this.iframe.id = 'formachat-widget-iframe';
      this.iframe.src = `${this.config.baseUrl}?embed=true#/chat/${this.config.businessId}`;
      this.iframe.style.cssText = this.getIframeStyles(false);
      this.iframe.setAttribute('frameborder', '0');
      this.iframe.setAttribute('allow', 'clipboard-write');
      
      this.container.appendChild(this.iframe);
      this.container.appendChild(this.button);
      
      document.body.appendChild(this.container);
      
      console.log('[Formachat Widget] Initialized');
    },
    
    toggle: function() {
      this.isOpen = !this.isOpen;
      
      if (this.isOpen) {
        this.open();
      } else {
        this.close();
      }
    },
    
    open: function() {
      this.isOpen = true;
      this.iframe.style.cssText = this.getIframeStyles(true);
      this.button.innerHTML = this.icons.close;
     
      this.button.style.transform = 'rotate(90deg)';
    },
    
    close: function() {
      this.isOpen = false;
      this.iframe.style.cssText = this.getIframeStyles(false);
      this.button.innerHTML = this.icons.chat;
      this.button.style.transform = 'rotate(0deg)';
    },
    
    getContainerStyles: function() {
      const position = this.config.position;
      const right = position.includes('right') ? '20px' : 'auto';
      const left = position.includes('left') ? '20px' : 'auto';
      
      return `
        position: fixed;
        bottom: 10px;
        right: ${right};
        left: ${left};
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
    },
    
    getButtonStyles: function() {
      return `
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        background: ${this.config.primaryColor};
        color: white;
        cursor: pointer;
        /* Brand-colored Glow Shadow */
        box-shadow: 0 4px 12px rgba(99, 107, 47, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        position: relative;
        outline: none;
      `;
    },
    
    getIframeStyles: function(isOpen) {
      return `
        position: absolute;
        bottom: 80px;
        right: 0;
        width: ${isOpen ? '400px' : '0'};
        height: ${isOpen ? '900px' : '0'};
        max-height: calc(100vh - 120px);
        max-width: calc(100vw - 40px);
        /* Deep, soft shadow for floating effect */
        box-shadow: ${isOpen ? '0 12px 48px rgba(0, 0, 0, 0.12)' : 'none'};
        opacity: ${isOpen ? '1' : '0'};
        visibility: ${isOpen ? 'visible' : 'hidden'};
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); /* Smooth spring-like open */
        transform: ${isOpen ? 'translateY(0)' : 'translateY(20px)'}; /* Slide up effect */
        background: white;
        
      `;
    }
  };
  
  window.FormachatWidget = FormachatWidget;
  
})();