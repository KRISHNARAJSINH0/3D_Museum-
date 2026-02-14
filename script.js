// Complete Fixed JavaScript
document.addEventListener('DOMContentLoaded', function() {
  class VirtualMuseum {
    constructor() {
        this.audio = null;
this.isPlaying = false;
this.audioProgressInterval = null;

      this.currentArtifact = null;
      this.currentArtifactId = null;
      this.audio = null;
      this.ambientAudio = null;
       this.zoomLevel = 1;
  this.MIN_ZOOM = 1;
  this.MAX_ZOOM = 2;

this.ambientTracks = {
  ancient: document.getElementById('ambientAncient'),
  medieval: document.getElementById('ambientMedieval'),
  modern: document.getElementById('ambientModern'),
  futuristic: document.getElementById('ambientFuturistic')
};

      this.isPlaying = false;
      this.viewedArtifacts = new Set();
      this.artifacts = [];
      this.tour = {
        active: false,
        paused: false,
        currentStep: 0,
        mode: 'sequential',
        speed: 1,
        steps: [],
        interval: null
      };
      this.heroSubtitles = [
  'Explore Ancient Civilizations in 3D',
  'Touch History • Rotate • Interact',
  'Experience the Future of Museums',
  'Walk Through Time Without Limits'
];
this.currentSubtitleIndex = 0;

      this.musicPlaying = false;
      
      this.initialize();
      
    }

   async initialize() {
  localStorage.removeItem('museumTheme');
document.body.classList.add('theme-all');

  this.setupElements();
  this.initBubbleBackground();   // ⭐ ADD HERE
  this.setupEventListeners();
  await this.simulateLoading();
  this.loadProgress();
  
  setTimeout(() => this.showVirtualGuide(), 1500);
  this.startHeroSubtitleRotation();
this.animateHero();
this.bindLibraryButton();
this.updateLibraryButton();
this.bindDetailSaveButton();
this.bindAdvancedSearch();
this.bindSearchSuggestions();
this.bindPrintButton();
this.bindARButtons();
  this.bindAROverlayControls();
this.isMobile = window.innerWidth <= 768;

if (this.isMobile) {
  document.body.classList.add('is-mobile');
}
if (!/Mobi|Android/i.test(navigator.userAgent)) {
  document.querySelectorAll('.ar-btn, #arBtn').forEach(btn => {
    btn.style.display = 'none';
  });
}


}
applyZoom() {
  if (!this.currentArtifact) return;

  this.currentArtifact.style.transform =
    `scale(${this.zoomLevel})`;
}

bindZoomButtons() {
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');

  if (!zoomInBtn || !zoomOutBtn) return;

  zoomInBtn.addEventListener('click', () => {
    if (!this.currentArtifact) return;

    this.zoomLevel = Math.min(
      this.zoomLevel + 0.1,
      this.MAX_ZOOM
    );

    this.applyZoom();
  });

  zoomOutBtn.addEventListener('click', () => {
    if (!this.currentArtifact) return;

    this.zoomLevel = Math.max(
      this.zoomLevel - 0.1,
      this.MIN_ZOOM
    );

    this.applyZoom();
  });
}




    setupElements() {
      this.elements = {
        loadingScreen: document.getElementById('loadingScreen'),
        museumGrid: document.getElementById('museumGrid'),
        detailsOverlay: document.getElementById('detailsOverlay'),
        virtualGuide: document.getElementById('virtualGuide'),
        advancedTourControls: document.getElementById('advancedTourControls'),
        notification: document.getElementById('notification'),
        notificationText: document.getElementById('notificationText'),
        backgroundMusic: document.getElementById('backgroundMusic'),
        tourBtn: document.getElementById('tourBtn'),
        fullscreen3DOverlay: document.getElementById('fullscreen3DOverlay'),
        arOverlay: document.getElementById('arOverlay')
      };

      this.collectArtifacts();

    }

    collectArtifacts() {
      this.artifacts = Array.from(document.querySelectorAll('.artifact-card'));
      this.artifacts.forEach(artifact => {
        this.setupArtifactInteractions(artifact);
      });
    }
    playAmbient(era) {
  if (!this.ambientTracks[era]) return;

  // stop current ambient
  if (this.ambientAudio) {
    this.fadeOutAudio(this.ambientAudio);
  }

  const audio = this.ambientTracks[era];
  audio.volume = 0;
  audio.play().catch(() => {});
  this.fadeInAudio(audio, 0.08); // VERY low volume

  this.ambientAudio = audio;
}

fadeInAudio(audio, targetVolume) {
  let vol = 0;
  const interval = setInterval(() => {
    vol += 0.01;
    if (vol >= targetVolume) {
      audio.volume = targetVolume;
      clearInterval(interval);
    } else {
      audio.volume = vol;
    }
  }, 80);
}

fadeOutAudio(audio) {
  let vol = audio.volume;
  const interval = setInterval(() => {
    vol -= 0.01;
    if (vol <= 0) {
      audio.pause();
      audio.currentTime = 0;
      clearInterval(interval);
    } else {
      audio.volume = vol;
    }
  }, 80);
}
getLibrary() {
  return JSON.parse(localStorage.getItem('museumLibrary')) || [];
}

saveToLibrary(id) {
  const library = this.getLibrary();
  if (!library.includes(id)) {
    library.push(id);
    localStorage.setItem('museumLibrary', JSON.stringify(library));
    this.showSaveToast();
    this.updateLibraryButton();
  }
}

showSaveToast() {
  const toast = document.getElementById('saveToast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}
updateLibraryButton() {
  const btn = document.getElementById('libraryBtn');
  const library = this.getLibrary();
  btn.classList.toggle('hidden', library.length === 0);
}
bindLibraryButton() {
  const btn = document.getElementById('libraryBtn');
  const section = document.getElementById('librarySection');
  const closeBtn = document.getElementById('closeLibraryBtn');

  btn.addEventListener('click', () => {
    this.renderLibrary();
    section.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  closeBtn.addEventListener('click', () => {
    section.classList.remove('active');
    document.body.style.overflow = '';
  });
}
renderLibrary() {
  const grid = document.getElementById('libraryGrid');
  const emptyText = document.getElementById('libraryEmpty');
  const library = this.getLibrary().map(String);

  grid.innerHTML = '';

  // Empty state
  if (library.length === 0) {
    emptyText.style.display = 'block';
    return;
  }
  emptyText.style.display = 'none';

  library.forEach(id => {
    // Always use original artifact for data
    const original = document.querySelector(`.artifact-card[data-id="${id}"]`);
    if (!original) return;

    // Clone visual card
    const clone = original.cloneNode(true);
    clone.classList.add('library-card');

    // Remove duplicate IDs inside clone
    clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));

    /* ---------------------------------
       MODIFY ACTION BUTTONS (KEY PART)
    --------------------------------- */
    const actions = clone.querySelector('.artifact-actions');
    if (!actions) return;

    // ❌ Remove buttons not needed in Library
    actions.querySelector('.view-3d')?.remove();
    actions.querySelector('.explore-btn')?.remove();
    actions.querySelector('.save-btn')?.remove();

    // ✅ Add DETAILS button
    const detailsBtn = document.createElement('button');
    detailsBtn.className = 'action-btn details-btn';
    detailsBtn.innerHTML = '<i class="fas fa-info-circle"></i> Details';

   detailsBtn.addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();

  this.closeLibrary();   // ✅ CLOSE LIBRARY
  this.openDetails(id); // ✅ OPEN DETAILS
});


    // ✅ Add DELETE button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn delete-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';

    deleteBtn.addEventListener('click', e => {
      e.stopPropagation();
      this.removeFromLibrary(id);
    });

    // Add buttons to actions row
    actions.appendChild(detailsBtn);
    actions.appendChild(deleteBtn);

    /* ---------------------------------
       Add LIBRARY badge
    --------------------------------- */
    const overlay = clone.querySelector('.artifact-overlay');
    if (overlay) {
      const badge = document.createElement('div');
      badge.className = 'era-badge';
      badge.textContent = 'Library';
      overlay.appendChild(badge);
    }

    grid.appendChild(clone);
  });
}

bindAdvancedSearch() {
  const input = document.getElementById('advancedSearchInput');
  const era = document.getElementById('searchEra');
  const category = document.getElementById('searchCategory');

  const applySearch = () => {
    const query = input.value.trim().toLowerCase();
    const eraFilter = era.value.toLowerCase();
    const catFilter = category.value.toLowerCase();

    let exactMatches = [];
    let startMatches = [];
    let relatedMatches = [];

    this.artifacts.forEach(card => {
      const title = card.dataset.title.toLowerCase();
      const desc = card.dataset.desc.toLowerCase();
      const loc = card.dataset.location.toLowerCase();
      const eraVal = card.dataset.category.toLowerCase();

      const eraOk = !eraFilter || eraVal === eraFilter;
      const catOk = !catFilter || eraVal === catFilter;

      if (!eraOk || !catOk) return;

      if (query && title === query) {
        exactMatches.push(card);
      } else if (query && title.startsWith(query)) {
        startMatches.push(card);
      } else if (
        !query ||
        title.includes(query) ||
        desc.includes(query) ||
        loc.includes(query)
      ) {
        relatedMatches.push(card);
      }
    });

    // 🔥 PRIORITY DISPLAY LOGIC
    this.artifacts.forEach(card => (card.style.display = 'none'));

    if (exactMatches.length > 0) {
      exactMatches.forEach(c => (c.style.display = ''));
    } else if (startMatches.length > 0) {
      startMatches.forEach(c => (c.style.display = ''));
    } else {
      relatedMatches.forEach(c => (c.style.display = ''));
    }
  };

  input.addEventListener('input', applySearch);
  era.addEventListener('change', applySearch);
  category.addEventListener('change', applySearch);
}
bindSearchSuggestions() {
  const input = document.getElementById('searchInput');
  const box = document.getElementById('searchSuggestions');

  if (!input || !box) return;

  // 🔦 Highlight matched text
  const highlight = (text, query) => {
    if (!query) return text;
    return text.replace(
      new RegExp(`(${query})`, 'ig'),
      '<strong>$1</strong>'
    );
  };

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();

    // Reset suggestions
    box.innerHTML = '';
    box.classList.remove('active');

    if (query.length === 0) return;

    const exactMatches = [];
    const startMatches = [];
    const relatedMatches = [];

    this.artifacts.forEach(card => {
      const title = card.dataset.title?.toLowerCase() || '';

      if (title === query) {
        exactMatches.push(card);
      } else if (title.startsWith(query)) {
        startMatches.push(card);
      } else if (title.includes(query)) {
        relatedMatches.push(card);
      }
    });

    // Priority order + limit
    const results = [...exactMatches, ...startMatches, ...relatedMatches].slice(0, 7);
    if (!results.length) return;

    results.forEach(card => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';

      item.innerHTML = `
        <div class="suggestion-title">
          ${highlight(card.dataset.title, query)}
        </div>
        <div class="suggestion-meta">
          ${card.dataset.era} • ${card.dataset.location}
        </div>
      `;

      // Click → open artifact
      item.addEventListener('click', () => {
        box.classList.remove('active');
        input.value = card.dataset.title;

        // Open details panel
        this.openDetails(card.dataset.id);

        // Smooth scroll to artifact card
        card.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      });

      box.appendChild(item);
    });

    box.classList.add('active');
  });

  // Close suggestions when clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.search-wrapper')) {
      box.classList.remove('active');
    }
  });
}


bindPrintButton() {
  const btn = document.getElementById('printArtifactBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!this.currentArtifact) {
      this.showNotification('No artifact selected', 'Print');
      return;
    }

    this.printArtifact();
  });
}
printArtifact() {
  const artifact = this.currentArtifact;

  const title = artifact.dataset.title;
  const era = artifact.dataset.era;
  const location = artifact.dataset.location;
  const description = artifact.dataset.desc;

  const imgSrc =
    artifact.querySelector('.artifact-img')?.src || '';

  const specs = {
    dimensions: document.getElementById('specDimensions')?.textContent,
    weight: document.getElementById('specWeight')?.textContent,
    material: document.getElementById('specMaterial')?.textContent,
    condition: document.getElementById('specCondition')?.textContent
  };

  // Create print container
  const printDiv = document.createElement('div');
  printDiv.className = 'print-area';

  printDiv.innerHTML = `
    <div class="print-header">
      <h1>${title}</h1>
      <div class="print-meta">${era} • ${location}</div>
    </div>

    <div class="print-image">
      <img src="${imgSrc}">
    </div>

    <div class="print-section">
      <h3>Description</h3>
      <p>${description}</p>
    </div>

    <div class="print-section">
      <h3>Specifications</h3>
      <div class="print-specs">
        <div><strong>Dimensions:</strong> ${specs.dimensions}</div>
        <div><strong>Weight:</strong> ${specs.weight}</div>
        <div><strong>Material:</strong> ${specs.material}</div>
        <div><strong>Condition:</strong> ${specs.condition}</div>
      </div>
    </div>

    <div style="margin-top:40px;font-size:12px;opacity:0.6;text-align:center">
      © HeritEdge Museum – Printed Artifact Sheet
    </div>
  `;

  document.body.appendChild(printDiv);
  window.print();
  document.body.removeChild(printDiv);
}







removeFromLibrary(id) {
  let library = this.getLibrary();
  library = library.filter(item => item !== id);

  localStorage.setItem('museumLibrary', JSON.stringify(library));
  this.renderLibrary();
  this.updateLibraryButton();

  this.showNotification('Removed from library', 'Library');
}
closeLibrary() {
  const librarySection = document.getElementById('librarySection');
  if (!librarySection) return;

  librarySection.classList.remove('active');
  document.body.style.overflow = '';
}




setCursorLabel(text) {
  const label = document.getElementById('cursorLabel');
  if (!label) return;

  if (text) {
    label.textContent = text;
    label.style.opacity = '1';
    label.style.transform = 'translate(-50%, -50%) scale(1)';
  } else {
    label.style.opacity = '0';
    label.style.transform = 'translate(-50%, -50%) scale(0.8)';
  }
}


    setupArtifactInteractions(artifact) {
      // Hover effect for 3D preview
      const media = artifact.querySelector('.artifact-media');
      const img = artifact.querySelector('.artifact-img');
      const modelViewer = artifact.querySelector('.artifact-3d');

      if (media && img && modelViewer) {
        media.addEventListener('mouseenter', () => {
          setTimeout(() => {
            img.style.opacity = '0';
            modelViewer.style.opacity = '1';
          }, 200);
        });

        media.addEventListener('mouseleave', () => {
          img.style.opacity = '1';
          modelViewer.style.opacity = '0';
        });
      }

      // Click handlers
      artifact.addEventListener('click', (e) => {
  if (
    e.target.closest('button') ||
    e.target.tagName === 'MODEL-VIEWER'
  ) return;

  this.openDetails(artifact.dataset.id);
});


      // 3D view button
      const view3dBtn = artifact.querySelector('.view-3d');
      if (view3dBtn) {
        view3dBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openFullscreen3D(artifact);
        });
      }

      // Explore button
      const exploreBtn = artifact.querySelector('.explore-btn');
      if (exploreBtn) {
        exploreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openDetails(artifact.dataset.id);
        });
      }
    }

    async simulateLoading() {
      return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              this.elements.loadingScreen.style.opacity = '0';
              setTimeout(() => {
                this.elements.loadingScreen.style.display = 'none';
                this.showNotification('🚀 Museum ready for exploration!', 'Welcome');
                resolve();
              }, 500);
            }, 500);
          }
        }, 100);
      });
    }

    setupEventListeners() {
      document.getElementById('virtualMuseumBtn').addEventListener('click', () => {
  // OPTION 1: Redirect to your 3D walkthrough page
  window.location.href = "index2.html";

  // OPTION 2 (comment above & use this instead):
  // window.open("virtual-museum.html", "_blank");
});

      // Auto tour - FIXED
      this.elements.tourBtn.addEventListener('click', () => this.startAdvancedTour());
      
      // Navigation view - FIXED
      document.getElementById('gridView').addEventListener('click', () => this.setGridView());
      document.getElementById('listView').addEventListener('click', () => this.setListView());
      
      // Filter functionality - FIXED
      document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
          this.filterArtifacts(e.target.dataset.filter, e.target);
        });
      });

      // Virtual Guide buttons - FIXED
      document.getElementById('startTourBtn').addEventListener('click', () => this.startAdvancedTour());
      document.getElementById('skipTourBtn').addEventListener('click', () => this.hideVirtualGuide());
      document.getElementById('customTourBtn').addEventListener('click', () => this.showCustomTourModal());

      // Advanced tour controls - FIXED
      document.getElementById('tourPlayPauseBtn').addEventListener('click', () => this.toggleTourPlayPause());
      document.getElementById('tourPrevBtn').addEventListener('click', () => this.prevTourStep());
      document.getElementById('tourNextBtn').addEventListener('click', () => this.nextTourStep());
      document.getElementById('tourStopBtn').addEventListener('click', () => this.stopTour());
      document.getElementById('closeTourControlsBtn').addEventListener('click', () => this.stopTour());

      // Tour speed controls - FIXED
      document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const speed = parseFloat(e.target.dataset.speed);
          this.setTourSpeed(speed);
          document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
        });
      });

      // Tour mode - FIXED
      document.getElementById('tourModeSelect').addEventListener('change', (e) => {
        this.tour.mode = e.target.value;
        if (this.tour.active) {
          this.prepareTour();
          this.tour.currentStep = 0;
          this.highlightCurrentArtifact();
        }
      });

      // Fullscreen 3D controls - FIXED
      document.getElementById('closeFullscreenBtn').addEventListener('click', () => this.closeFullscreen3D());
      document.getElementById('fullscreenRotateBtn').addEventListener('click', () => this.toggleFullscreenRotation());
      document.getElementById('fullscreenArBtn').addEventListener('click', () => this.openArFromFullscreen());
      document.getElementById('fullscreenResetBtn').addEventListener('click', () => this.resetFullscreenView());

      // AR controls - FIXED
      document.getElementById('closeArBtn').addEventListener('click', () => this.closeArOverlay());
      document.getElementById('placeArBtn').addEventListener('click', () => this.placeInAR());

      // Details panel controls - FIXED
      this.setupDetailsPanelControls();

      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
      document.getElementById('startExperienceBtn')
  ?.addEventListener('click', () => {
    document.getElementById('museumGrid')
      .scrollIntoView({ behavior: 'smooth' });
  });

document.getElementById('startTourHeroBtn')
  ?.addEventListener('click', () => {
    this.startAdvancedTour();
  });

  document.querySelectorAll('.featured-card').forEach(card => {
  card.addEventListener('click', () => {
    const artifactId = card.dataset.id;
    this.openDetails(artifactId);
  });
});


  document.querySelectorAll('.era-card').forEach(card => {
  card.addEventListener('click', () => {
    const era = card.dataset.era;

    // Trigger existing filter button
    const filterBtn = document.querySelector(
      `.filter-tag[data-filter="${era}"]`
    );

    if (filterBtn) {
      filterBtn.click();
    }

    // Scroll to museum grid
    document.getElementById('museumGrid')
      .scrollIntoView({ behavior: 'smooth' });

    this.showNotification(
      `Entering ${era.charAt(0).toUpperCase() + era.slice(1)} Era`,
      'Museum'
    );
  });
});
const clickSound = document.getElementById('uiClickSound');

document.querySelectorAll('button').forEach(btn => {
  document.addEventListener('click', e => {
  if (e.target.closest('button')) {
    clickSound.volume = 0.05;
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
  }
});

});


    }

    // FIXED: Virtual Guide Functions
    showVirtualGuide() {
      const guideShown = localStorage.getItem('guideShown');
      if (!guideShown && this.elements.virtualGuide) {
        this.elements.virtualGuide.classList.add('active');
        this.updateGuideMessage('Hello! I\'m your virtual guide. I\'ll help you explore the museum. Click "Start Tour" for a guided experience or "Skip Tour" to explore on your own.');
      }
    }

    hideVirtualGuide() {
      if (this.elements.virtualGuide) {
        this.elements.virtualGuide.classList.remove('active');
        localStorage.setItem('guideShown', 'true');
        this.showNotification('Guide hidden. You can restart it anytime.', 'Info');
      }
    }

    updateGuideMessage(message) {
      const guideMessage = document.getElementById('guideMessage');
      if (guideMessage) {
        guideMessage.textContent = message;
      }
    }
    animateHero() {
  const animatedEls = document.querySelectorAll('.hero-anim');

  animatedEls.forEach(el => {
    requestAnimationFrame(() => {
      el.classList.add('show');
    });
  });
}


    initBubbleBackground() {
  const bubbleBg = document.getElementById('bubbleBg');
  if (!bubbleBg) return;

  const bubbleCount = this.isMobile ? 40 : 140;


  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement('span');

    bubble.style.left = Math.random() * 100 + '%';

    bubble.style.setProperty('--size', Math.random());
    bubble.style.setProperty('--speed', Math.random());
    bubble.style.setProperty('--delay', Math.random() * 30);
    bubble.style.setProperty('--blur', Math.random() * 2);

    bubble.style.setProperty('--x1', `${Math.random() * 80 - 40}px`);
    bubble.style.setProperty('--x2', `${Math.random() * 160 - 80}px`);
    bubble.style.setProperty('--x3', `${Math.random() * 260 - 130}px`);

    bubbleBg.appendChild(bubble);
  }
}

    // FIXED: List View Functions
    setGridView() {
      this.elements.museumGrid.classList.remove('list-view');
      document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
      document.getElementById('gridView').classList.add('active');
      this.showNotification('Grid view activated', 'View');
    }

    setListView() {
      this.elements.museumGrid.classList.add('list-view');
      document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
      document.getElementById('listView').classList.add('active');
      this.showNotification('List view activated', 'View');
    }

   filterArtifacts(filter, button) {
  // active button
  document.querySelectorAll('.filter-tag').forEach(t =>
    t.classList.remove('active')
  );
  button.classList.add('active');

  // ===== THEME SWITCH (COLOR ONLY) =====
  document.body.classList.remove(
    'theme-all',
    'theme-ancient',
    'theme-medieval',
    'theme-modern',
    'theme-futuristic'
  );

  document.body.classList.add(`theme-${filter}`);

  // ===== FILTER LOGIC (UNCHANGED) =====
  this.artifacts.forEach(artifact => {
    if (filter === 'all' || artifact.dataset.category === filter) {
      artifact.style.display = '';
      artifact.style.opacity = '1';
      artifact.style.transform = 'translateY(0)';
    } else {
      artifact.style.opacity = '0';
      artifact.style.transform = 'translateY(20px)';
      setTimeout(() => {
        artifact.style.display = 'none';
      }, 300);
    }
  });
  // 🎧 Ambient sound change
if (filter !== 'all') {
  this.playAmbient(filter);
} else if (this.ambientAudio) {
  this.fadeOutAudio(this.ambientAudio);
  this.ambientAudio = null;
}

}



    // FIXED: Advanced Tour Functions
    prepareTour() {
      let tourSteps = [...this.artifacts];
      
      switch(this.tour.mode) {
        case 'category':
          tourSteps.sort((a, b) => {
            const categories = ['ancient', 'medieval', 'modern', 'futuristic'];
            return categories.indexOf(a.dataset.category) - categories.indexOf(b.dataset.category);
          });
          break;
          
        case 'chronological':
          tourSteps.sort((a, b) => {
            const getYear = (era) => {
              const match = era.match(/-?\d+/);
              return match ? parseInt(match[0]) : 0;
            };
            return getYear(a.dataset.era) - getYear(b.dataset.era);
          });
          break;
          
        case 'popular':
          const visits = JSON.parse(localStorage.getItem('artifactVisits') || '{}');
          tourSteps.sort((a, b) => (visits[b.dataset.id] || 0) - (visits[a.dataset.id] || 0));
          break;
      }
      
      this.tour.steps = tourSteps;
      this.tour.currentStep = 0;
    }

    startAdvancedTour() {
      this.hideVirtualGuide();
      this.prepareTour();
      this.tour.active = true;
      this.tour.paused = false;
      
      this.elements.advancedTourControls.classList.add('active');
      
      this.showNotification('🚀 Starting advanced tour...', 'Tour Started');
      this.highlightCurrentArtifact();
      this.startTourTimer();
      this.updateGuideMessage('Tour started! Enjoy the guided exploration.');
    }

    startTourTimer() {
      if (this.tour.interval) {
        clearInterval(this.tour.interval);
      }
      
      const stepDuration = 10000 / this.tour.speed;
      
      this.tour.interval = setInterval(() => {
        if (!this.tour.paused && this.tour.active) {
          this.nextTourStep();
        }
      }, stepDuration);
    }

    nextTourStep() {
      if (!this.tour.active || this.tour.currentStep >= this.tour.steps.length) {
        this.stopTour();
        this.showNotification('🎉 Tour completed! Well done!', 'Tour Complete');
        this.updateGuideMessage('Tour completed! Feel free to explore more artifacts.');
        return;
      }
      
      // Remove highlight from previous
      if (this.tour.currentStep > 0) {
        const prevArtifact = this.tour.steps[this.tour.currentStep - 1];
        if (prevArtifact) prevArtifact.classList.remove('tour-active');
      }
      
      const currentArtifact = this.tour.steps[this.tour.currentStep];
      this.openDetails(currentArtifact.dataset.id);
      this.highlightCurrentArtifact();
      this.updateTourUI();
      
      this.tour.currentStep++;
      
      // Update guide message
      if (this.tour.currentStep < this.tour.steps.length) {
        const nextArtifact = this.tour.steps[this.tour.currentStep];
        if (nextArtifact) {
          this.updateGuideMessage(`Now viewing: ${currentArtifact.dataset.title}. Next: ${nextArtifact.dataset.title}`);
        }
      }
    }

    prevTourStep() {
      if (this.tour.currentStep > 1) {
        // Remove current highlight
        const currentArtifact = this.tour.steps[this.tour.currentStep - 1];
        if (currentArtifact) currentArtifact.classList.remove('tour-active');
        
        this.tour.currentStep -= 2;
        this.nextTourStep();
      }
    }

    highlightCurrentArtifact() {
      if (this.tour.currentStep < this.tour.steps.length) {
        const currentArtifact = this.tour.steps[this.tour.currentStep];
        if (currentArtifact) {
          currentArtifact.classList.add('tour-active');
          currentArtifact.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
    }
bindDetailSaveButton() {
  const btn = document.getElementById('detailSaveBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!this.currentArtifactId) return;
    this.saveToLibrary(this.currentArtifactId);
  });
}

    updateTourUI() {
      const stepElement = document.getElementById('tourStep');
      const titleElement = document.getElementById('currentTourTitle');
      const descElement = document.getElementById('currentTourDescription');
      const progressFill = document.querySelector('.progress-fill');
      
      if (stepElement) {
        stepElement.textContent = `${this.tour.currentStep + 1}/${this.tour.steps.length}`;
      }
      
      if (progressFill) {
        const circumference = 2 * Math.PI * 18;
        const progress = ((this.tour.currentStep + 1) / this.tour.steps.length) * 100;
        const offset = circumference - (progress / 100) * circumference;
        progressFill.style.strokeDashoffset = offset;
      }
      
      if (this.tour.currentStep < this.tour.steps.length) {
        const artifact = this.tour.steps[this.tour.currentStep];
        if (titleElement) titleElement.textContent = artifact.dataset.title;
        if (descElement) descElement.textContent = `${artifact.dataset.category} • ${artifact.dataset.era} • ${artifact.dataset.location}`;
      }
    }

    toggleTourPlayPause() {
      this.tour.paused = !this.tour.paused;
      const button = document.getElementById('tourPlayPauseBtn');
      if (button) {
        button.innerHTML = this.tour.paused ? 
          '<i class="fas fa-play"></i>' : 
          '<i class="fas fa-pause"></i>';
      }
      
      this.showNotification(
        this.tour.paused ? 'Tour paused' : 'Tour resumed',
        'Tour Status'
      );
    }

    setTourSpeed(speed) {
      this.tour.speed = speed;
      if (this.tour.active && !this.tour.paused) {
        this.startTourTimer();
      }
      this.showNotification(`Tour speed: ${speed}x`, 'Speed Changed');
    }

    stopTour() {
      this.tour.active = false;
      this.tour.paused = false;
      this.tour.currentStep = 0;
      
      if (this.tour.interval) {
        clearInterval(this.tour.interval);
        this.tour.interval = null;
      }
      
      // Remove all highlights
      document.querySelectorAll('.artifact-card.tour-active').forEach(card => {
        card.classList.remove('tour-active');
      });
      
      // Hide tour controls
      this.elements.advancedTourControls.classList.remove('active');
      
      this.updateGuideMessage('Tour stopped. You can explore freely or start a new tour.');
    }

    // FIXED: Fullscreen 3D Functions
    openFullscreen3D(artifact) {
      if (!artifact || !this.elements.fullscreen3DOverlay) return;
      
      const viewer = document.getElementById('fullscreenModelViewer');
      const title = document.getElementById('fullscreenTitle');
      
      title.textContent = artifact.dataset.title;
      const modelSrc = artifact.querySelector('model-viewer')?.src;
      if (modelSrc && viewer) {
        viewer.src = modelSrc;
        viewer.autoRotate = true;
        viewer.cameraOrbit = '0deg 75deg 105%';
      }
      
      this.elements.fullscreen3DOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    closeFullscreen3D() {
      if (this.elements.fullscreen3DOverlay) {
        this.elements.fullscreen3DOverlay.classList.remove('active');
        document.body.style.overflow = '';
        
        const viewer = document.getElementById('fullscreenModelViewer');
        if (viewer) {
          viewer.autoRotate = false;
        }
      }
    }

    toggleFullscreenRotation() {
      const viewer = document.getElementById('fullscreenModelViewer');
      if (viewer) {
        viewer.autoRotate = !viewer.autoRotate;
        this.showNotification(
          viewer.autoRotate ? 'Auto-rotation enabled' : 'Auto-rotation disabled',
          '3D Controls'
        );
      }
    }

   openArFromFullscreen() {
  const viewer = document.getElementById('fullscreenModelViewer');

  if (!viewer || !viewer.canActivateAR) {
    this.showNotification(
      'AR not supported on this device',
      'AR'
    );
    return;
  }

  try {
    viewer.activateAR();
  } catch (e) {
    console.error(e);
    this.showNotification(
      'Unable to launch AR',
      'AR'
    );
  }
}


    resetFullscreenView() {
      const viewer = document.getElementById('fullscreenModelViewer');
      if (viewer) {
        viewer.cameraOrbit = '0deg 75deg 105%';
        this.showNotification('View reset', '3D Controls');
      }
    }

    // FIXED: AR Functions
    openArOverlay() {
      if (this.elements.arOverlay) {
        this.elements.arOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }
bindAROverlayControls() {
  document
    .getElementById('closeArBtn')
    ?.addEventListener('click', () =>
      this.closeArOverlay()
    );

  document
    .getElementById('placeArBtn')
    ?.addEventListener('click', () =>
      this.placeInAR()
    );
}

    closeArOverlay() {
      if (this.elements.arOverlay) {
        this.elements.arOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
   stopAudio(resetUI = true) {
  if (!this.audio) return;

  this.audio.pause();
  this.audio.currentTime = 0;
  this.audio = null;
  this.isPlaying = false;

  clearInterval(this.audioProgressInterval);

  if (resetUI) {
    document.getElementById('audioProgress').value = 0;
    document.getElementById('audioTime').textContent = '0:00 / 0:00';

    const btn = document.getElementById('playAudio');
    if (btn) {
      btn.innerHTML =
        '<i class="fas fa-play"></i><span>Audio Guide</span>';
    }
  }
}

bindARButtons() {
  const arBtn = document.getElementById('arBtn');
  const fullscreenArBtn = document.getElementById('fullscreenArBtn');

  if (arBtn) {
    arBtn.addEventListener('click', () => {
      this.openArOverlay();
    });
  }

  if (fullscreenArBtn) {
    fullscreenArBtn.addEventListener('click', () => {
      this.openArFromFullscreen();
    });
  }
}


    placeInAR() {
  const modelViewer = document.getElementById('detailModelViewer');

  if (!modelViewer) {
    this.showNotification('3D model not found', 'AR');
    return;
  }

  // Safety check
  if (!modelViewer.canActivateAR) {
    this.showNotification(
      'AR not supported on this device',
      'AR'
    );
    return;
  }

  try {
    modelViewer.activateAR();
    this.closeArOverlay();
  } catch (error) {
    console.error(error);
    this.showNotification(
      'Failed to start AR',
      'AR'
    );
  }
}


    // FIXED: Details Panel Functions
    openDetails(artifactId) {
  const artifact = document.querySelector(`[data-id="${artifactId}"]`);
  if (!artifact) return;

  // ✅ THIS IS THE KEY FIX
  this.currentArtifact = artifact;
  this.currentArtifactId = artifactId;

  this.markAsViewed(artifactId);
  this.updateDetailsPanel(artifact);
  this.showDetailsPanel();
  this.logArtifactVisit(artifactId);
  this.zoomLevel = 1;
  this.applyZoom();
}


    updateDetailsPanel(artifact) {
      // Update text content
      document.getElementById('detailTitle').textContent = artifact.dataset.title;
      document.getElementById('detailEra').textContent = artifact.dataset.era;
      document.getElementById('detailDescription').textContent = artifact.dataset.desc;
      document.getElementById('detailLocation').textContent = artifact.dataset.location;
      document.getElementById('detailCategory').textContent = artifact.dataset.category;

      // Update 3D model
      const modelSrc = artifact.querySelector('model-viewer')?.src;
      const detailModelViewer = document.getElementById('detailModelViewer');
      if (detailModelViewer && modelSrc) {
        detailModelViewer.src = modelSrc;
        detailModelViewer.cameraOrbit = '0deg 75deg 105%';
        detailModelViewer.autoRotate = true;
      }

      // Update specifications
      this.updateSpecifications(artifact);
    }

    showDetailsPanel() {
      if (!this.elements.detailsOverlay) return;
      
      this.elements.detailsOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }


    setupDetailsPanelControls() {
        document.getElementById('audioProgress').addEventListener('input', (e) => {
  if (!this.audio || !this.audio.duration) return;

  const percent = e.target.value;
  this.audio.currentTime =
    (percent / 100) * this.audio.duration;
});

        document.getElementById('playAudio').addEventListener('click', () => {
  this.toggleArtifactAudio();
});

      // Close button
      document.getElementById('closeDetailsBtn').addEventListener('click', () => this.closeDetails());
      
      // Navigation arrows - FIXED
      document.getElementById('nextArtifact').addEventListener('click', () => this.navigateNext());
      document.getElementById('prevArtifact').addEventListener('click', () => this.navigatePrev());
      
      // Model controls
      document.getElementById('rotateBtn').addEventListener('click', () => this.toggleAutoRotate());
      document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomIn());
      document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomOut());
      document.getElementById('arBtn').addEventListener('click', () => this.openArOverlay());
      
      // Click outside to close
      this.elements.detailsOverlay.addEventListener('click', (e) => {
        if (e.target === this.elements.detailsOverlay) {
          this.closeDetails();
        }
      });
    }

    toggleAutoRotate() {
      const modelViewer = document.getElementById('detailModelViewer');
      if (modelViewer) {
        modelViewer.autoRotate = !modelViewer.autoRotate;
        this.showNotification(
          modelViewer.autoRotate ? 'Auto-rotate enabled' : 'Auto-rotate disabled',
          '3D Controls'
        );
      }
    }
toggleArtifactAudio() {
  // Pause ambient sound while guide audio plays
if (this.ambientAudio) {
  this.fadeOutAudio(this.ambientAudio);
}

  if (!this.currentArtifact) {
    this.showNotification('Select an artifact first', 'Audio');
    return;
  }

  // PAUSE
  if (this.audio && this.isPlaying) {
    this.audio.pause();
    this.isPlaying = false;
    clearInterval(this.audioProgressInterval);

    document.getElementById('playAudio').innerHTML =
      '<i class="fas fa-play"></i><span>Audio Guide</span>';
    return;
  }

  const audioSrc = this.currentArtifact.dataset.audio;
  if (!audioSrc) {
    this.showNotification('No audio available', 'Audio');
    return;
  }

  // STOP any old audio
  this.stopAudio(false);

  this.audio = new Audio(audioSrc);
  this.audio.volume = 0.8;

  this.audio.play().then(() => {
    this.isPlaying = true;

    document.getElementById('playAudio').innerHTML =
      '<i class="fas fa-pause"></i><span>Pause</span>';

    this.startAudioProgressTracking();
  }).catch(() => {
    this.showNotification('Click again to enable audio', 'Audio');
  });

  this.audio.onended = () => this.stopAudio();
}



    zoomIn() {
      const modelViewer = document.getElementById('detailModelViewer');
      if (modelViewer) {
        modelViewer.zoom(1.2);
        this.showNotification('Zoomed in', '3D Controls');
      }
    }

    zoomOut() {
      const modelViewer = document.getElementById('detailModelViewer');
      if (modelViewer) {
        modelViewer.zoom(0.8);
        this.showNotification('Zoomed out', '3D Controls');
      }
    }

  navigateNext() {
  this.stopAudio();
  this.openDetails(Number(this.currentArtifactId) + 1);
}

navigatePrev() {
  this.stopAudio();
  this.openDetails(Number(this.currentArtifactId) - 1);
}


closeDetails() {
  this.stopAudio();
  this.elements.detailsOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

startAudioProgressTracking() {
  const progress = document.getElementById('audioProgress');
  const timeText = document.getElementById('audioTime');

  this.audioProgressInterval = setInterval(() => {
    if (!this.audio || !this.audio.duration) return;

    const percent =
      (this.audio.currentTime / this.audio.duration) * 100;

    progress.value = percent;

    timeText.textContent =
      `${this.formatTime(this.audio.currentTime)} / ${this.formatTime(this.audio.duration)}`;
  }, 500);
}



    // Utility Functions
   markAsViewed(artifactId) {
  if (!this.viewedArtifacts.has(artifactId)) {
    this.viewedArtifacts.add(artifactId);

    const card = document.querySelector(`[data-id="${artifactId}"]`);
    if (card) card.classList.add('viewed');

    this.updateProgress();
    this.saveProgress();
    this.showNotification('✨ New artifact discovered!', 'Discovery');
  }
}

    formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}


    updateProgress() {
      const viewedCount = document.getElementById('viewedCount');
      const progressFill = document.querySelector('.progress-fill');
      
      if (viewedCount) {
        viewedCount.textContent = this.viewedArtifacts.size;
      }
      
      if (progressFill) {
        const percentage = (this.viewedArtifacts.size / this.artifacts.length) * 100;
        progressFill.style.width = `${percentage}%`;
      }
    }

    loadProgress() {
      const savedViews = JSON.parse(localStorage.getItem('viewedArtifacts') || '[]');
      savedViews.forEach(id => this.viewedArtifacts.add(id));
      this.updateProgress();
    }

    saveProgress() {
      const viewedArray = Array.from(this.viewedArtifacts);
      localStorage.setItem('viewedArtifacts', JSON.stringify(viewedArray));
    }
    startHeroSubtitleRotation() {
  const subtitleEl = document.getElementById('heroSubtitle');
  if (!subtitleEl) return;

  setInterval(() => {
    subtitleEl.classList.add('fade-out');

    setTimeout(() => {
      this.currentSubtitleIndex =
        (this.currentSubtitleIndex + 1) % this.heroSubtitles.length;

      subtitleEl.textContent =
        this.heroSubtitles[this.currentSubtitleIndex];

      subtitleEl.classList.remove('fade-out');
    }, 600);
  }, 3500);
}


    logArtifactVisit(artifactId) {
      const visits = JSON.parse(localStorage.getItem('artifactVisits') || '{}');
      visits[artifactId] = (visits[artifactId] || 0) + 1;
      localStorage.setItem('artifactVisits', JSON.stringify(visits));
    }

    updateSpecifications(artifact) {
      const specs = {
        ancient: {
          dimensions: ['45 × 25 × 15 cm', '60 × 30 × 20 cm', '35 × 35 × 50 cm'],
          weight: ['12.5 kg', '8.7 kg', '15.2 kg'],
          material: ['Marble', 'Bronze', 'Terracotta', 'Stone'],
          condition: ['Well Preserved', 'Good Condition', 'Partially Restored']
        },
        medieval: {
          dimensions: ['90 × 10 × 5 cm', '75 × 60 × 30 cm', '50 × 40 × 25 cm'],
          weight: ['1.8 kg', '12.3 kg', '5.6 kg'],
          material: ['Iron', 'Steel', 'Wood', 'Leather'],
          condition: ['Good Condition', 'Weathered', 'Restored']
        },
        modern: {
          dimensions: ['60 × 40 × 30 cm', '45 × 45 × 45 cm', '70 × 25 × 25 cm'],
          weight: ['8.2 kg', '3.5 kg', '6.8 kg'],
          material: ['Bronze', 'Aluminum', 'Glass', 'Mixed Media'],
          condition: ['Excellent', 'Pristine', 'Mint Condition']
        },
        futuristic: {
          dimensions: ['30 × 30 × 30 cm', '40 × 40 × 10 cm', '25 × 25 × 50 cm'],
          weight: ['3.5 kg', '2.1 kg', '4.8 kg'],
          material: ['Composite Materials', 'Carbon Fiber', 'Smart Materials', 'Bioplastic'],
          condition: ['Pristine', 'New', 'Factory Condition']
        }
      };
      
      const category = artifact.dataset.category || 'ancient';
      const spec = specs[category] || specs.ancient;
      
      const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
      
      document.getElementById('specDimensions').textContent = randomItem(spec.dimensions);
      document.getElementById('specWeight').textContent = randomItem(spec.weight);
      document.getElementById('specMaterial').textContent = randomItem(spec.material);
      document.getElementById('specCondition').textContent = randomItem(spec.condition);
    }

    showCustomTourModal() {
      this.showNotification('Custom tour creator coming soon!', 'Feature');
    }

    showNotification(message, title = 'Notification') {
      this.elements.notificationText.textContent = message;
      this.elements.notification.style.display = 'flex';
      
      setTimeout(() => {
        this.elements.notification.style.display = 'none';
      }, 3000);
    }

    handleKeyboardShortcuts(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key) {
        case 'Escape':
          if (this.elements.fullscreen3DOverlay.classList.contains('active')) {
            this.closeFullscreen3D();
          } else if (this.elements.arOverlay.classList.contains('active')) {
            this.closeArOverlay();
          } else if (this.elements.detailsOverlay.classList.contains('active')) {
            this.closeDetails();
          }
          break;
        case 'ArrowRight':
          if (this.elements.detailsOverlay.classList.contains('active')) {
            this.navigateNext();
          }
          break;
        case 'ArrowLeft':
          if (this.elements.detailsOverlay.classList.contains('active')) {
            this.navigatePrev();
          }
          break;
        case 't':
        case 'T':
          if (!this.tour.active) {
            this.startAdvancedTour();
          } else {
            this.stopTour();
          }
          break;
      }
    }
  }

  // Initialize the museum
  window.museum = new VirtualMuseum();
});
