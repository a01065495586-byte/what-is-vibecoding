/* ==========================================================================
   Vibe Coding Presentation - Interactive Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.getElementById('presentation-wrapper');
  const slides = document.querySelectorAll('.slide');
  const progressBar = document.getElementById('progress-bar');
  const currentNumEl = document.getElementById('current-slide-num');
  const totalNumEl = document.getElementById('total-slide-num');
  
  // Controls
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnNotes = document.getElementById('btn-notes');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const btnOverview = document.getElementById('btn-overview');
  
  // Speaker Drawer & Overview
  const speakerDrawer = document.getElementById('speaker-drawer');
  const speakerContent = document.getElementById('speaker-content');
  const drawerClose = document.getElementById('drawer-close');
  const overviewModal = document.getElementById('overview-modal');
  const overviewClose = document.getElementById('overview-close');
  const overviewGrid = document.getElementById('overview-grid');

  let currentSlideIndex = 0;
  const totalSlides = slides.length;
  totalNumEl.textContent = String(totalSlides).padStart(2, '0');

  // ==========================================================================
  // 1. 16:9 Viewport Auto-Scaler
  // ==========================================================================
  function scalePresentation() {
    const targetWidth = 1920;
    const targetHeight = 1080;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const scaleX = windowWidth / targetWidth;
    const scaleY = windowHeight / targetHeight;
    const scale = Math.min(scaleX, scaleY) * 0.96; // 4% safe padding

    wrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  window.addEventListener('resize', scalePresentation);
  scalePresentation();

  // ==========================================================================
  // 2. Slide Navigation System
  // ==========================================================================
  function updateSlide(index) {
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;
    currentSlideIndex = index;

    // Update active class
    slides.forEach((slide, i) => {
      if (i === currentSlideIndex) {
        slide.classList.add('active');
        
        // Trigger benchmark bar animation if Slide 5 (index 4)
        if (i === 4) {
          animateBars();
        }
      } else {
        slide.classList.remove('active');
      }
    });

    // Update Counter & Progress Bar
    currentNumEl.textContent = String(currentSlideIndex + 1).padStart(2, '0');
    const progressPercent = ((currentSlideIndex + 1) / totalSlides) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Update Speaker Notes Content
    const currentNotes = slides[currentSlideIndex].querySelector('.speaker-notes');
    if (currentNotes) {
      speakerContent.innerHTML = currentNotes.innerHTML;
    } else {
      speakerContent.innerHTML = '<p>이 슬라이드에는 별도 발표자 대본이 없습니다.</p>';
    }

    // Update Overview highlight
    const thumbs = document.querySelectorAll('.overview-thumb');
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('current', i === currentSlideIndex);
    });
  }

  function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
      updateSlide(currentSlideIndex + 1);
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      updateSlide(currentSlideIndex - 1);
    }
  }

  // ==========================================================================
  // 3. Benchmark Bar Chart Animation (Slide 5)
  // ==========================================================================
  function animateBars() {
    const bars = document.querySelectorAll('.bar-pill');
    bars.forEach(bar => {
      const targetHeight = bar.getAttribute('data-height');
      bar.style.height = '0px';
      setTimeout(() => {
        bar.style.height = targetHeight;
      }, 100);
    });
  }

  // ==========================================================================
  // 4. Speaker Notes Drawer (Press S)
  // ==========================================================================
  function toggleNotes() {
    speakerDrawer.classList.toggle('open');
  }

  // ==========================================================================
  // 5. Fullscreen Toggle (Press F)
  // ==========================================================================
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // ==========================================================================
  // 6. Overview Grid Mode (Press O / Esc)
  // ==========================================================================
  function buildOverviewGrid() {
    overviewGrid.innerHTML = '';
    slides.forEach((slide, i) => {
      const title = slide.querySelector('.slide-title') ? slide.querySelector('.slide-title').innerText : `Slide ${i+1}`;
      const thumb = document.createElement('div');
      thumb.className = `overview-thumb ${i === currentSlideIndex ? 'current' : ''}`;
      thumb.innerHTML = `
        <div class="thumb-num">#${String(i + 1).padStart(2, '0')}</div>
        <div class="thumb-title">${title}</div>
      `;
      thumb.addEventListener('click', () => {
        updateSlide(i);
        toggleOverview(false);
      });
      overviewGrid.appendChild(thumb);
    });
  }

  function toggleOverview(forceState) {
    const isOpen = typeof forceState === 'boolean' ? forceState : !overviewModal.classList.contains('open');
    if (isOpen) {
      buildOverviewGrid();
      overviewModal.classList.add('open');
    } else {
      overviewModal.classList.remove('open');
    }
  }

  // ==========================================================================
  // 7. Event Listeners
  // ==========================================================================
  btnNext.addEventListener('click', nextSlide);
  btnPrev.addEventListener('click', prevSlide);
  btnNotes.addEventListener('click', toggleNotes);
  drawerClose.addEventListener('click', () => speakerDrawer.classList.remove('open'));
  btnFullscreen.addEventListener('click', toggleFullscreen);
  btnOverview.addEventListener('click', () => toggleOverview(true));
  overviewClose.addEventListener('click', () => toggleOverview(false));

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // If overview is open, Esc closes it
    if (overviewModal.classList.contains('open')) {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'o') {
        toggleOverview(false);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ': // Spacebar
        nextSlide();
        e.preventDefault();
        break;
      case 'ArrowLeft':
      case 'PageUp':
      case 'Backspace':
        prevSlide();
        e.preventDefault();
        break;
      case 's':
      case 'S':
        toggleNotes();
        e.preventDefault();
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        e.preventDefault();
        break;
      case 'o':
      case 'O':
      case 'Escape':
        toggleOverview();
        e.preventDefault();
        break;
    }
  });

  // Touch Swipe Support for Mobile/Tablet
  let touchStartX = 0;
  wrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  wrapper.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (diff < -50) nextSlide();
    if (diff > 50) prevSlide();
  }, { passive: true });

  // Initial Load
  updateSlide(0);
});
