// Landing Page Scroll Animations

document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        // Remove visible class when element goes out of view
        // This allows animations to trigger again when scrolling back
        entry.target.classList.remove('visible');
      }
    });
  }, observerOptions);

  // Observe large feature cards with continuous animation
  const featureCards = document.querySelectorAll('.feature');
  featureCards.forEach((el, index) => {
    observer.observe(el);
  });

  // Observe grid cards with continuous animation
  const gridCards = document.querySelectorAll('.stat');
  gridCards.forEach((el, index) => {
    observer.observe(el);
  });

  // Additional scroll-based animation trigger
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    // Clear any existing timeout
    clearTimeout(scrollTimeout);
    
    // Set a new timeout to trigger animation refresh
    scrollTimeout = setTimeout(() => {
      // Re-trigger animations for elements that might have been missed
      const allAnimatedElements = document.querySelectorAll('.feature, .stat');
      allAnimatedElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isVisible = (
          rect.top < window.innerHeight - 100 &&
          rect.bottom > 100
        );
        
        if (isVisible && !element.classList.contains('visible')) {
          element.classList.add('visible');
        } else if (!isVisible && element.classList.contains('visible')) {
          element.classList.remove('visible');
        }
      });
    }, 50);
  }, { passive: true });
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add parallax effect to hero background (lighter effect)
  const heroGradient = document.querySelector('.hero-bg-gradient');
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (heroGradient && scrollY < window.innerHeight) {
      requestAnimationFrame(() => {
        heroGradient.style.transform = `translateY(${scrollY * 0.3}px)`;
      });
    }
  }, { passive: true });

  // Card hover effect enhancement (subtle)
  const cards = document.querySelectorAll('.feature, .stat');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      if (this.classList.contains('visible')) {
        this.style.transform = 'translateY(-8px) scale(1.02)';
      }
    });
    
    card.addEventListener('mouseleave', function() {
      if (this.classList.contains('visible')) {
        this.style.transform = 'translateY(0) scale(1)';
      }
    });
  });

  // Feature card 3D tilt effect (very subtle)
  const largeFeatureCards = document.querySelectorAll('.feature');
  largeFeatureCards.forEach(card => {
    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const deltaX = (x - centerX) / centerX;
      const deltaY = (y - centerY) / centerY;
      
      const rotateX = deltaY * 1.5;
      const rotateY = deltaX * -1.5;
      
      requestAnimationFrame(() => {
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.005)`;
      });
    });
    
    card.addEventListener('mouseleave', function() {
      requestAnimationFrame(() => {
        this.style.transform = '';
      });
    });
  });

  // Log animation initialization
  console.log(`🎬 Landing animations initialized for ${featureCards.length} large cards and ${gridCards.length} grid cards`);
});

// Export for potential external use
window.landingAnimations = {
  reinitialize: () => {
    console.log('Re-initializing landing animations...');
    // Could re-run observer setup if needed
  }
};
