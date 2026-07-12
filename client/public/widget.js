(function() {
  'use strict';

  var MOBILE_BREAKPOINT = 480;

  var FormachatWidget = {
    config: {
      businessId: null,
      position: 'bottom-right',
      primaryColor: '#636b2f',
      baseUrl: 'https://www.formachat.com',
      greeting: "👋 Need help? We're here to chat!",
      greetingDelay: 4000,
      showGreeting: true
    },

    isOpen: false,
    unreadCount: 0,
    container: null,
    button: null,
    badge: null,
    iframe: null,
    bubble: null,
    brandingTag: null,
    greetingTimer: null,

    icons: {
      chat: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
      close: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
    },

    init: function(options) {
      this.config = Object.assign({}, this.config, options);

      if (!this.config.businessId) {
        console.error('[Formachat Widget] businessId is required');
        return;
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { FormachatWidget.render(); });
      } else {
        this.render();
      }
    },

    isMobile: function() {
      return window.innerWidth <= MOBILE_BREAKPOINT;
    },

    storageKey: function(suffix) {
      return 'formachat_' + this.config.businessId + '_' + suffix;
    },

    render: function() {
      this.container = document.createElement('div');
      this.container.id = 'formachat-widget-container';
      this.container.style.cssText = this.getContainerStyles();

      this.button = document.createElement('button');
      this.button.id = 'formachat-widget-button';
      this.button.setAttribute('aria-label', 'Open chat');
      this.button.innerHTML = this.icons.chat;
      this.button.style.cssText = this.getButtonStyles();
      // Entrance: start scaled down/invisible, pop in shortly after mount
      // rather than just appearing - a small, standard polish touch.
      this.button.style.transform = 'scale(0)';
      this.button.style.opacity = '0';

      this.button.addEventListener('mouseenter', function() {
        if (FormachatWidget.isOpen) return;
        FormachatWidget.button.style.transform = 'scale(1.05) translateY(-2px)';
        FormachatWidget.button.style.boxShadow = '0 10px 25px rgba(0,0,0,0.25)';
      });
      this.button.addEventListener('mouseleave', function() {
        if (FormachatWidget.isOpen) return;
        FormachatWidget.button.style.transform = 'scale(1) translateY(0)';
        FormachatWidget.button.style.boxShadow = FormachatWidget.getButtonShadow();
      });
      this.button.addEventListener('click', function() { FormachatWidget.toggle(); });

      this.badge = document.createElement('div');
      this.badge.id = 'formachat-widget-badge';
      this.badge.style.cssText = this.getBadgeStyles();
      this.badge.style.display = 'none';
      this.button.appendChild(this.badge);

      this.iframe = document.createElement('iframe');
      this.iframe.id = 'formachat-widget-iframe';
      this.iframe.title = 'Chat';
      this.iframe.src = this.config.baseUrl + '?embed=true#/chat/' + this.config.businessId;
      this.iframe.style.cssText = this.getIframeStyles(false);
      this.iframe.setAttribute('frameborder', '0');
      this.iframe.setAttribute('allow', 'clipboard-write');

      // Quiet watermark text, shown only while the widget is open (see
      // open()/close()) - inline with the button, pinned to the far edge of
      // the popup above it (see getBrandingTagStyles for the anchor logic).
      //
      // Split into two elements on purpose: brandingTag is a wide
      // positioning box (up to 400px, spanning toward the button) with
      // pointer-events:none, so it never intercepts clicks - only
      // brandingLink, sized to just its own text via inline-block, is
      // actually clickable. Without this split, the wide box (even the
      // invisible part where no text renders) sat on top of the launcher
      // button and stole its clicks, so tapping "close" opened
      // formachat.com instead of closing the widget.
      this.brandingTag = document.createElement('div');
      this.brandingTag.id = 'formachat-branding-tag';
      this.brandingTag.style.cssText = this.getBrandingTagStyles();

      var brandingLink = document.createElement('a');
      brandingLink.href = 'https://www.formachat.com';
      brandingLink.target = '_blank';
      brandingLink.rel = 'noopener noreferrer';
      brandingLink.textContent = 'Powered by FormaChat';
      brandingLink.style.cssText = 'display:inline-block; pointer-events:auto; color:inherit; text-decoration:none;';
      brandingLink.addEventListener('mouseenter', function() {
        FormachatWidget.brandingTag.style.opacity = '1';
      });
      brandingLink.addEventListener('mouseleave', function() {
        if (FormachatWidget.isOpen) FormachatWidget.brandingTag.style.opacity = '0.7';
      });
      this.brandingTag.appendChild(brandingLink);

      this.container.appendChild(this.iframe);
      this.container.appendChild(this.button);
      this.container.appendChild(this.brandingTag);

      document.body.appendChild(this.container);

      window.addEventListener('message', function(event) { FormachatWidget.handleMessage(event); });
      window.addEventListener('resize', function() { FormachatWidget.handleResize(); });

      // Pop the button in on the next frame (so the initial scale(0) above
      // actually paints first and the transition has something to animate
      // from, instead of firing instantly with nothing to see).
      requestAnimationFrame(function() {
        setTimeout(function() {
          FormachatWidget.button.style.transform = 'scale(1)';
          FormachatWidget.button.style.opacity = '1';
        }, 50);
      });

      this.scheduleGreetingBubble();

      console.log('[Formachat Widget] Initialized');
    },

    handleMessage: function(event) {
      var data = event.data;
      if (!data || data.source !== 'formachat-widget') return;

      if (data.type === 'ready') {
        if (data.primaryColor) {
          this.config.primaryColor = data.primaryColor;
          this.button.style.background = data.primaryColor;
          this.button.style.boxShadow = this.getButtonShadow();
          this.brandingTag.style.color = data.primaryColor;
        }
        if (data.position && data.position !== this.config.position) {
          // Re-anchors the container, and re-derives the branding tag's own
          // anchor/alignment (getIframeStyles recomputes anchorLeft fresh on
          // every open()/close()/resize call, so it doesn't need a push here -
          // but the tag's position was baked in once at creation and needs an
          // explicit refresh). 'ready' fires before the widget's first open,
          // so the tag is still hidden at this point - safe to fully reset it.
          this.config.position = data.position;
          this.container.style.cssText = this.getContainerStyles();
          this.brandingTag.style.cssText = this.getBrandingTagStyles();
        }
      } else if (data.type === 'message' && data.role === 'bot') {
        if (!this.isOpen) {
          this.unreadCount += 1;
          this.updateBadge();
        }
      }
    },

    handleResize: function() {
      // Re-apply whatever open/closed state is current so the mobile
      // fullscreen breakpoint kicks in (or reverts) on rotate/resize, not
      // just on first render. The button itself needs no adjustment here -
      // it stays visible and on top at every viewport size (see open()).
      this.iframe.style.cssText = this.getIframeStyles(this.isOpen);
    },

    scheduleGreetingBubble: function() {
      if (!this.config.showGreeting) return;
      if (sessionStorage.getItem(this.storageKey('greeting_seen'))) return;

      this.greetingTimer = setTimeout(function() {
        if (FormachatWidget.isOpen) return;
        FormachatWidget.showGreetingBubble();
      }, this.config.greetingDelay);
    },

    showGreetingBubble: function() {
      sessionStorage.setItem(this.storageKey('greeting_seen'), '1');

      var bubble = document.createElement('div');
      bubble.id = 'formachat-greeting-bubble';
      bubble.style.cssText = this.getBubbleStyles();

      var text = document.createElement('span');
      text.textContent = this.config.greeting;
      text.style.cssText = 'flex: 1; cursor: pointer;';
      text.addEventListener('click', function() {
        FormachatWidget.hideGreetingBubble();
        FormachatWidget.open();
      });

      var dismiss = document.createElement('button');
      dismiss.innerHTML = '&times;';
      dismiss.setAttribute('aria-label', 'Dismiss');
      dismiss.style.cssText = 'background:none; border:none; color:inherit; opacity:0.6; font-size:18px; line-height:1; cursor:pointer; padding:0 0 0 8px;';
      dismiss.addEventListener('click', function(e) {
        e.stopPropagation();
        FormachatWidget.hideGreetingBubble();
      });

      bubble.appendChild(text);
      bubble.appendChild(dismiss);
      this.container.appendChild(bubble);
      this.bubble = bubble;

      requestAnimationFrame(function() {
        setTimeout(function() {
          bubble.style.opacity = '1';
          bubble.style.transform = 'translateY(0) scale(1)';
        }, 30);
      });
    },

    hideGreetingBubble: function() {
      if (!this.bubble) return;
      var bubble = this.bubble;
      bubble.style.opacity = '0';
      bubble.style.transform = 'translateY(8px) scale(0.95)';
      setTimeout(function() { bubble.remove(); }, 200);
      this.bubble = null;
    },

    updateBadge: function() {
      if (this.unreadCount > 0) {
        this.badge.textContent = this.unreadCount > 9 ? '9+' : String(this.unreadCount);
        this.badge.style.display = 'flex';
      } else {
        this.badge.style.display = 'none';
      }
    },

    toggle: function() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    },

    open: function() {
      this.isOpen = true;
      this.hideGreetingBubble();
      if (this.greetingTimer) clearTimeout(this.greetingTimer);

      this.unreadCount = 0;
      this.updateBadge();

      this.iframe.style.cssText = this.getIframeStyles(true);
      this.button.innerHTML = this.icons.close;
      this.button.appendChild(this.badge);
      // Stays visible and on top even in mobile full-screen mode (it's
      // appended after the iframe, so it paints above it) - it's the one
      // and only way to close the widget, on every screen size.
      this.button.style.transform = 'scale(1) rotate(90deg)';
      this.button.style.opacity = '1';
      this.button.style.pointerEvents = 'auto';

      // Quiet watermark text, inline with the button, only while open -
      // pairs with the button showing its X (closed) icon. Deliberately
      // subtle (0.7 opacity, no background) rather than a second button -
      // present if you look, not fighting for attention. The wrapper itself
      // stays pointer-events:none always (see getBrandingTagStyles) - only
      // the inner link element is clickable, so this wide box can never
      // steal clicks meant for the button next to it.
      this.brandingTag.style.display = 'block';
      requestAnimationFrame(function() {
        setTimeout(function() {
          FormachatWidget.brandingTag.style.opacity = '0.7';
        }, 30);
      });
    },

    close: function() {
      this.isOpen = false;
      this.iframe.style.cssText = this.getIframeStyles(false);
      this.button.innerHTML = this.icons.chat;
      this.button.appendChild(this.badge);
      this.button.style.transform = 'scale(1) rotate(0deg)';
      this.button.style.opacity = '1';
      this.button.style.pointerEvents = 'auto';
      this.button.style.boxShadow = this.getButtonShadow();

      this.brandingTag.style.opacity = '0';
      this.brandingTag.style.pointerEvents = 'none';
      setTimeout(function() {
        if (!FormachatWidget.isOpen) FormachatWidget.brandingTag.style.display = 'none';
      }, 200);
    },

    getButtonShadow: function() {
      return '0 4px 12px rgba(0,0,0,0.25)';
    },

    getContainerStyles: function() {
      var position = this.config.position;
      var right = position.indexOf('right') !== -1 ? '20px' : 'auto';
      var left = position.indexOf('left') !== -1 ? '20px' : 'auto';

      return [
        'position: fixed',
        'bottom: 10px',
        'right: ' + right,
        'left: ' + left,
        'z-index: 999999',
        "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      ].join(';');
    },

    getButtonStyles: function() {
      return [
        'width: 60px',
        'height: 60px',
        'border-radius: 50%',
        'border: none',
        'background: ' + this.config.primaryColor,
        'color: white',
        'cursor: pointer',
        'box-shadow: ' + this.getButtonShadow(),
        'display: flex',
        'align-items: center',
        'justify-content: center',
        'transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        'position: relative',
        'outline: none'
      ].join(';');
    },

    getBadgeStyles: function() {
      return [
        'position: absolute',
        'top: -4px',
        'right: -4px',
        'min-width: 20px',
        'height: 20px',
        'padding: 0 5px',
        'border-radius: 10px',
        'background: #dc2626',
        'color: white',
        'font-size: 11px',
        'font-weight: 700',
        'display: flex',
        'align-items: center',
        'justify-content: center',
        'border: 2px solid white',
        'box-shadow: 0 2px 6px rgba(0,0,0,0.2)'
      ].join(';');
    },

    getBrandingTagStyles: function() {
      // Mirrors getIframeStyles()'s own anchor/width exactly, so the tag's
      // far edge lines up with the popup's far edge above it instead of
      // needing a separate hardcoded width that could drift out of sync.
      // No background/pill - just colored text (the header/business color),
      // right- or left-aligned within that same span depending on which
      // side is "far" from the button, so it reads as a quiet watermark
      // rather than a second button.
      var anchorLeft = this.config.position.indexOf('left') !== -1;

      return [
        'display: none',
        'position: absolute',
        'bottom: 22px',
        anchorLeft ? 'left: 0' : 'right: 0',
        'width: min(400px, calc(100vw - 40px))',
        'box-sizing: border-box',
        'padding: 0 8px',
        'text-align: ' + (anchorLeft ? 'right' : 'left'),
        'color: ' + this.config.primaryColor,
        'font-size: 12px',
        'font-weight: 600',
        'text-decoration: none',
        'text-shadow: 0 0 4px rgba(255,255,255,0.6)',
        'opacity: 0',
        'transition: opacity 0.25s ease',
        'pointer-events: none'
      ].join(';');
    },

    getBubbleStyles: function() {
      var position = this.config.position;
      var right = position.indexOf('right') !== -1 ? '78px' : 'auto';
      var left = position.indexOf('left') !== -1 ? '78px' : 'auto';

      return [
        'position: absolute',
        'bottom: 6px',
        'right: ' + right,
        'left: ' + left,
        'max-width: min(240px, calc(100vw - 100px))',
        'background: white',
        'color: #1a1a1a',
        'padding: 12px 14px',
        'border-radius: 14px',
        'box-shadow: 0 8px 24px rgba(0,0,0,0.15)',
        'display: flex',
        'align-items: flex-start',
        'gap: 6px',
        'font-size: 14px',
        'line-height: 1.4',
        'opacity: 0',
        'transform: translateY(8px) scale(0.95)',
        'transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)',
        'cursor: default',
        'white-space: normal'
      ].join(';');
    },

    getIframeStyles: function(isOpen) {
      if (this.isMobile() && isOpen) {
        // Full-screen takeover on small viewports - a 380px floating card
        // is unusable on a phone. The launcher button stays visible on top
        // (see open()) as the way to close it.
        return [
          'position: fixed',
          'top: 0',
          'left: 0',
          'right: 0',
          'bottom: 0',
          'width: 100vw',
          'height: 100vh',
          'max-width: none',
          'max-height: none',
          'border: none',
          'border-radius: 0',
          'box-shadow: none',
          'opacity: 1',
          'visibility: visible',
          'transition: opacity 0.2s ease',
          'transform: none',
          'background: white'
        ].join(';');
      }

      // Anchor to whichever side the container itself is anchored to. The
      // container shrinks to fit its content (just the 60px button when
      // closed), so a hardcoded `right: 0` here was always measured against
      // that narrow box - fine when the container sits at the right edge,
      // but when position is 'bottom-left' the container's "right edge" is
      // only ~60px from the left of the screen, so a 400px-wide iframe
      // anchored there via `right: 0` expanded leftward into negative
      // coordinates and went almost entirely off-screen. Anchoring to
      // `left: 0` instead when the container itself is left-anchored keeps
      // the popup expanding rightward, into the visible page, regardless of
      // which corner the launcher lives in.
      var anchorLeft = this.config.position.indexOf('left') !== -1;

      return [
        'position: absolute',
        'bottom: 80px',
        anchorLeft ? 'left: 0' : 'right: 0',
        'width: ' + (isOpen ? '400px' : '0'),
        'height: ' + (isOpen ? '640px' : '0'),
        // Explicit CSS border, not just the legacy frameborder="0" HTML
        // attribute set on the element - modern browsers don't reliably
        // suppress the default iframe border from that attribute alone, so
        // without this the iframe was likely rendering its own default
        // browser border (often a grey/white inset bevel) right at its
        // outer edge. That's almost certainly what read as unexplained
        // "padding" around the card, and why the intentional 2px colored
        // border on .chat-ui just inside it wasn't reading as distinct.
        'border: none',
        'max-height: calc(100vh - 120px)',
        'max-width: calc(100vw - 40px)',
        'box-shadow: ' + (isOpen ? '0 12px 48px rgba(0, 0, 0, 0.12)' : 'none'),
        'opacity: ' + (isOpen ? '1' : '0'),
        'visibility: ' + (isOpen ? 'visible' : 'hidden'),
        'transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        'transform: ' + (isOpen ? 'translateY(0)' : 'translateY(20px)'),
        // Transparent, not white: the iframe box is a plain rectangle but
        // the chat card inside it (chat-ui) has rounded corners - an opaque
        // white iframe background showed through at those corners as a
        // white square poking out from behind the rounded card. The chat
        // card itself still renders its own white background from inside
        // (chat-widget.ts's .chat-ui), this only affects the frame around it.
        'background: transparent',
        'border-radius: 20px'
      ].join(';');
    }
  };

  window.FormachatWidget = FormachatWidget;

})();
