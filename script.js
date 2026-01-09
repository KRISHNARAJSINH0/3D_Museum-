// Enhanced Museum Experience with Advanced Auto-Tour
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components
  class VirtualMuseum {
    constructor() {
      this.currentArtifact = null;
      this.currentArtifactId = null;
      this.audio = null;
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
        interval: null,
        data: this.getTourData()
      };
      this.isFullscreen = false;
      this.guideVisible = true;
      this.initialize();
    }

    async initialize() {
      this.setupElements();
      this.setupEventListeners();
      await this.simulateLoading();
      this.showGuide();
      this.loadProgress();
      this.setupBackgroundMusic();
      this.createParticles();
      this.setupHotspots();
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
        musicBtn: document.getElementById('musicBtn'),
        themeBtn: document.getElementById('themeBtn'),
        tourBtn: document.getElementById('tourBtn')
      };

      this.collectArtifacts();
    }

    collectArtifacts() {
      this.artifacts = Array.from(document.querySelectorAll('.artifact-card'));
      this.artifacts.forEach(artifact => {
        this.setupArtifactHover(artifact);
        artifact.addEventListener('click', (e) => this.handleArtifactClick(e, artifact));
      });
    }

    setupArtifactHover(artifact) {
      const media = artifact.querySelector('.artifact-media');
      const img = artifact.querySelector('.artifact-img');
      const modelViewer = artifact.querySelector('.artifact-3d');

      if (!media || !img || !modelViewer) return;

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
                this.showNotification('🚀 Welcome to Future Museum!', 'Welcome');
                resolve();
              }, 500);
            }, 500);
          }
        }, 100);
      });
    }

    setupEventListeners() {
      // Theme toggle
      this.elements.themeBtn.addEventListener('click', () => this.toggleTheme());
      
      // Music control
      this.elements.musicBtn.addEventListener('click', () => this.toggleMusic());
      
      // Tour button
      this.elements.tourBtn.addEventListener('click', () => this.startAdvancedTour());
      
      // Navigation view
      document.getElementById('gridView').addEventListener('click', () => this.setGridView());
      document.getElementById('listView').addEventListener('click', () => this.setListView());
      
      // Filter functionality
      document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', (e) => this.filterArtifacts(e.target.dataset.filter, e.target));
      });
      
      // Guide actions
      document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = e.target.closest('[data-action]').dataset.action;
          this.handleGuideAction(action);
        });
      });
      
      // Advanced tour controls
      document.getElementById('tourPlayPause').addEventListener('click', () => this.toggleTourPlayPause());
      document.getElementById('tourPrev').addEventListener('click', () => this.prevTourStep());
      document.getElementById('tourNext').addEventListener('click', () => this.nextTourStep());
      document.getElementById('tourStop').addEventListener('click', () => this.stopTour());
      
      // Tour speed controls
      document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const speed = parseFloat(e.target.dataset.speed);
          this.setTourSpeed(speed);
          e.target.parentElement.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
        });
      });
      
      // Tour mode
      document.getElementById('tourMode').addEventListener('change', (e) => {
        this.tour.mode = e.target.value;
        this.prepareTour();
      });
      
      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
      
      // Details panel controls
      this.setupDetailsPanelControls();
      
      // AR controls
      this.setupARControls();
    }

    handleArtifactClick(event, artifact) {
      event.preventDefault();
      event.stopPropagation();
      
      if (event.target.closest('.explore-btn')) {
        this.openDetails(artifact.dataset.id);
      } else if (event.target.closest('.view-3d')) {
        this.openFullscreen3D(artifact);
      } else if (event.target.closest('.preview-btn')) {
        this.showQuickPreview(artifact.dataset.id);
      } else {
        this.openDetails(artifact.dataset.id);
      }
    }

    openDetails(artifactId) {
      const artifact = document.querySelector(`[data-id="${artifactId}"]`);
      if (!artifact) return;

      this.markAsViewed(artifactId);
      this.currentArtifact = artifact;
      this.currentArtifactId = artifactId;

      this.updateDetailsPanel(artifact);
      this.showDetailsPanel();
      this.logArtifactVisit(artifactId);
    }

    markAsViewed(artifactId) {
      if (!this.viewedArtifacts.has(artifactId)) {
        this.viewedArtifacts.add(artifactId);
        this.updateProgress();
        this.saveProgress();
        this.showNotification('✨ New artifact discovered!', 'Discovery');
      }
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

    showGuide() {
      if (this.guideVisible) {
        this.elements.virtualGuide.style.display = 'block';
        setTimeout(() => {
          this.elements.virtualGuide.style.opacity = '1';
        }, 100);
      }
    }

    hideGuide() {
      this.elements.virtualGuide.style.opacity = '0';
      setTimeout(() => {
        this.elements.virtualGuide.style.display = 'none';
      }, 300);
    }

    handleGuideAction(action) {
      switch(action) {
        case 'startTour':
          this.startAdvancedTour();
          break;
        case 'skipTour':
          this.hideGuide();
          this.showNotification('Tour skipped. Explore freely!', 'Info');
          break;
        case 'customTour':
          this.openCustomTourModal();
          break;
      }
    }

    // Advanced Tour Functions
    getTourData() {
      return [
        { id: 1, duration: 5, highlight: 'ancient' },
        { id: 2, duration: 4, highlight: 'medieval' },
        { id: 3, duration: 6, highlight: 'ancient' },
        { id: 4, duration: 4, highlight: 'medieval' },
        { id: 5, duration: 3, highlight: 'ancient' },
        { id: 6, duration: 4, highlight: 'medieval' },
        { id: 7, duration: 5, highlight: 'ancient' },
        { id: 8, duration: 4, highlight: 'medieval' },
        { id: 9, duration: 6, highlight: 'ancient' },
        { id: 10, duration: 3, highlight: 'modern' },
        { id: 11, duration: 3, highlight: 'modern' },
        { id: 12, duration: 4, highlight: 'modern' },
        { id: 13, duration: 5, highlight: 'futuristic' },
        { id: 14, duration: 4, highlight: 'futuristic' },
        { id: 15, duration: 5, highlight: 'futuristic' },
        { id: 16, duration: 6, highlight: 'futuristic' }
      ];
    }

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
            const eraA = parseInt(a.dataset.era.replace(/[^0-9-]/g, ''));
            const eraB = parseInt(b.dataset.era.replace(/[^0-9-]/g, ''));
            return eraA - eraB;
          });
          break;
          
        case 'popular':
          // Simulate popularity based on views
          const visits = JSON.parse(localStorage.getItem('artifactVisits') || '{}');
          tourSteps.sort((a, b) => (visits[b.dataset.id] || 0) - (visits[a.dataset.id] || 0));
          break;
          
        case 'interactive':
          // Random order for interactive tour
          tourSteps = tourSteps.sort(() => Math.random() - 0.5);
          break;
      }
      
      this.tour.steps = tourSteps;
      this.tour.currentStep = 0;
    }

    startAdvancedTour() {
      this.hideGuide();
      this.prepareTour();
      this.tour.active = true;
      this.tour.paused = false;
      
      this.elements.advancedTourControls.style.display = 'block';
      setTimeout(() => {
        this.elements.advancedTourControls.style.opacity = '1';
      }, 100);
      
      this.showNotification('🚀 Starting advanced tour...', 'Tour Started');
      this.highlightCurrentArtifact();
      this.startTourTimer();
    }

    startTourTimer() {
      if (this.tour.interval) {
        clearInterval(this.tour.interval);
      }
      
      const stepDuration = 10000 / this.tour.speed; // 10 seconds per step adjusted for speed
      
      this.tour.interval = setInterval(() => {
        if (!this.tour.paused && this.tour.active) {
          this.nextTourStep();
        }
      }, stepDuration);
    }

    nextTourStep() {
      if (!this.tour.active) return;
      
      // Remove highlight from previous artifact
      if (this.tour.currentStep > 0) {
        const prevArtifact = this.tour.steps[this.tour.currentStep - 1];
        if (prevArtifact) prevArtifact.classList.remove('tour-active');
      }
      
      if (this.tour.currentStep < this.tour.steps.length) {
        const currentArtifact = this.tour.steps[this.tour.currentStep];
        this.openDetails(currentArtifact.dataset.id);
        this.highlightCurrentArtifact();
        this.updateTourUI();
        this.tour.currentStep++;
      } else {
        this.stopTour();
        this.showNotification('🎉 Tour completed! Well done!', 'Tour Complete');
      }
    }

    prevTourStep() {
      if (this.tour.currentStep > 1) {
        // Remove highlight from current
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

    updateTourUI() {
      const stepElement = document.getElementById('tourStep');
      const titleElement = document.getElementById('currentTourTitle');
      const descElement = document.getElementById('currentTourDescription');
      const progressFill = document.querySelector('.progress-fill');
      
      if (stepElement) {
        stepElement.textContent = `${this.tour.currentStep + 1}/${this.tour.steps.length}`;
      }
      
      if (progressFill) {
        const progress = ((this.tour.currentStep + 1) / this.tour.steps.length) * 100;
        const circumference = 2 * Math.PI * 18;
        const offset = circumference - (progress / 100) * circumference;
        progressFill.style.strokeDashoffset = offset;
      }
      
      if (this.tour.currentStep < this.tour.steps.length) {
        const artifact = this.tour.steps[this.tour.currentStep];
        if (titleElement) titleElement.textContent = artifact.dataset.title;
        if (descElement) descElement.textContent = `Exploring ${artifact.dataset.category} artifact from ${artifact.dataset.era}`;
      }
    }

    toggleTourPlayPause() {
      this.tour.paused = !this.tour.paused;
      const button = document.getElementById('tourPlayPause');
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
      
      this.elements.advancedTourControls.style.opacity = '0';
      setTimeout(() => {
        this.elements.advancedTourControls.style.display = 'none';
      }, 300);
    }

    // Theme and Music Functions
    toggleTheme() {
      document.body.classList.toggle('light-theme');
      const icon = this.elements.themeBtn.querySelector('i');
      
      if (document.body.classList.contains('light-theme')) {
        icon.className = 'fas fa-sun';
        this.showNotification('Light theme activated ☀️', 'Theme Changed');
      } else {
        icon.className = 'fas fa-moon';
        this.showNotification('Dark theme activated 🌙', 'Theme Changed');
      }
    }

    toggleMusic() {
      const icon = this.elements.musicBtn.querySelector('i');
      
      if (this.elements.backgroundMusic.paused) {
        this.elements.backgroundMusic.play().catch(e => console.log('Audio play failed:', e));
        icon.className = 'fas fa-volume-up';
        this.showNotification('Background music playing 🎵', 'Music');
      } else {
        this.elements.backgroundMusic.pause();
        icon.className = 'fas fa-volume-mute';
        this.showNotification('Background music paused', 'Music');
      }
    }

    setupBackgroundMusic() {
      // Set volume and preload
      this.elements.backgroundMusic.volume = 0.3;
      this.elements.backgroundMusic.preload = 'auto';
    }

    // View and Filter Functions
    setGridView() {
      this.elements.museumGrid.classList.remove('list-view');
      this.updateViewButtons('grid');
      this.showNotification('Grid view activated', 'View');
    }

    setListView() {
      this.elements.museumGrid.classList.add('list-view');
      this.updateViewButtons('list');
      this.showNotification('List view activated', 'View');
    }

    updateViewButtons(activeView) {
      document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
      document.getElementById(`${activeView}View`).classList.add('active');
    }

    filterArtifacts(filter, button) {
      document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
      button.classList.add('active');
      
      this.artifacts.forEach(artifact => {
        if (filter === 'all' || artifact.dataset.category === filter) {
          artifact.style.display = 'block';
          setTimeout(() => {
            artifact.style.opacity = '1';
            artifact.style.transform = 'translateY(0)';
          }, 10);
        } else {
          artifact.style.opacity = '0';
          artifact.style.transform = 'translateY(20px)';
          setTimeout(() => {
            artifact.style.display = 'none';
          }, 300);
        }
      });
      
      this.showNotification(`Showing ${filter} artifacts`, 'Filter');
    }

    // Details Panel Functions
    updateDetailsPanel(artifact) {
      // Update text content
      document.getElementById('detailTitle').textContent = artifact.dataset.title;
      document.getElementById('detailEra').textContent = artifact.dataset.era;
      document.getElementById('detailDescription').textContent = artifact.dataset.desc;
      document.getElementById('detailLocation').textContent = artifact.dataset.location;
      document.getElementById('detailCategory').textContent = artifact.dataset.category;
      
      // Update 3D model
      const modelSrc = artifact.querySelector('model-viewer').src;
      const detailModelViewer = document.getElementById('detailModelViewer');
      if (detailModelViewer) {
        detailModelViewer.src = modelSrc;
      }
      
      // Update audio
      const audioSrc = artifact.dataset.audio;
      if (this.audio) {
        this.audio.pause();
        this.isPlaying = false;
        const playButton = document.getElementById('playAudio');
        if (playButton) {
          playButton.innerHTML = '<i class="fas fa-play"></i><span>Audio Guide</span>';
        }
      }
      this.audio = new Audio(audioSrc);
      this.setupAudioControls();
      
      // Update specifications
      this.updateSpecifications(artifact);
    }

    showDetailsPanel() {
      this.elements.detailsOverlay.style.display = 'block';
      setTimeout(() => {
        this.elements.detailsOverlay.style.opacity = '1';
      }, 10);
      document.body.style.overflow = 'hidden';
    }

    closeDetails() {
      this.elements.detailsOverlay.style.opacity = '0';
      setTimeout(() => {
        this.elements.detailsOverlay.style.display = 'none';
      }, 300);
      document.body.style.overflow = '';
      
      if (this.audio && !this.audio.paused) {
        this.audio.pause();
        this.isPlaying = false;
      }
      
      this.currentArtifact = null;
      this.currentArtifactId = null;
    }

    setupDetailsPanelControls() {
      // Close button
      document.getElementById('closeDetailsBtn').addEventListener('click', () => this.closeDetails());
      
      // Navigation arrows
      document.getElementById('nextArtifact').addEventListener('click', () => this.navigateNext());
      document.getElementById('prevArtifact').addEventListener('click', () => this.navigatePrev());
      
      // Model controls
      document.getElementById('rotateBtn').addEventListener('click', () => this.toggleAutoRotate());
      document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomIn());
      document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomOut());
      document.getElementById('arBtn').addEventListener('click', () => this.openARMode());
      
      // Audio controls
      document.getElementById('playAudio').addEventListener('click', () => this.toggleAudio());
      document.getElementById('audioProgress').addEventListener('input', (e) => this.seekAudio(e));
    }

    navigateNext() {
      if (!this.currentArtifactId) return;
      const currentId = parseInt(this.currentArtifactId);
      const nextId = currentId < this.artifacts.length ? currentId + 1 : 1;
      this.openDetails(nextId);
    }

    navigatePrev() {
      if (!this.currentArtifactId) return;
      const currentId = parseInt(this.currentArtifactId);
      const prevId = currentId > 1 ? currentId - 1 : this.artifacts.length;
      this.openDetails(prevId);
    }

    // Audio Functions
    toggleAudio() {
      if (!this.audio) return;
      
      const playButton = document.getElementById('playAudio');
      
      if (this.isPlaying) {
        this.audio.pause();
        this.isPlaying = false;
        if (playButton) {
          playButton.innerHTML = '<i class="fas fa-play"></i><span>Audio Guide</span>';
        }
      } else {
        this.audio.play().catch(e => {
          console.log('Audio play failed:', e);
          this.showNotification('Audio guide unavailable', 'Audio');
        });
        this.isPlaying = true;
        if (playButton) {
          playButton.innerHTML = '<i class="fas fa-pause"></i><span>Pause Guide</span>';
        }
      }
    }

    setupAudioControls() {
      if (!this.audio) return;
      
      this.audio.addEventListener('timeupdate', () => this.updateAudioProgress());
      this.audio.addEventListener('ended', () => {
        this.isPlaying = false;
        const playButton = document.getElementById('playAudio');
        if (playButton) {
          playButton.innerHTML = '<i class="fas fa-play"></i><span>Audio Guide</span>';
        }
      });
    }

    updateAudioProgress() {
      const progress = document.getElementById('audioProgress');
      const time = document.getElementById('audioTime');
      
      if (progress && time && this.audio) {
        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration;
        progress.value = (currentTime / duration) * 100 || 0;
        
        const formatTime = (seconds) => {
          const mins = Math.floor(seconds / 60);
          const secs = Math.floor(seconds % 60);
          return `${mins}:${secs.toString().padStart(2, '0')}`;
        };
        
        time.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
      }
    }

    seekAudio(event) {
      if (!this.audio) return;
      this.audio.currentTime = (event.target.value / 100) * this.audio.duration;
    }

    // 3D Model Functions
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

    openFullscreen3D(artifact) {
      const fullscreenOverlay = document.getElementById('fullscreen3DOverlay');
      const fullscreenViewer = document.getElementById('fullscreenModelViewer');
      const title = document.getElementById('fullscreenTitle');
      
      if (fullscreenOverlay && fullscreenViewer && title) {
        title.textContent = artifact.dataset.title;
        fullscreenViewer.src = artifact.querySelector('model-viewer').src;
        
        fullscreenOverlay.style.display = 'block';
        setTimeout(() => {
          fullscreenOverlay.style.opacity = '1';
        }, 10);
        
        document.body.style.overflow = 'hidden';
        this.isFullscreen = true;
      }
    }

    // AR Functions
    setupARControls() {
      document.getElementById('closeArBtn')?.addEventListener('click', () => {
        const arOverlay = document.getElementById('arOverlay');
        if (arOverlay) {
          arOverlay.style.opacity = '0';
          setTimeout(() => {
            arOverlay.style.display = 'none';
          }, 300);
        }
      });
      
      document.getElementById('placeArBtn')?.addEventListener('click', () => this.placeInAR());
    }

    openARMode() {
      if (!this.currentArtifact) return;
      
      const arOverlay = document.getElementById('arOverlay');
      if (arOverlay) {
        arOverlay.style.display = 'block';
        setTimeout(() => {
          arOverlay.style.opacity = '1';
        }, 10);
        this.showNotification('AR Mode: Point camera at a flat surface', 'AR');
      }
    }

    placeInAR() {
      if (!this.currentArtifact) return;
      
      const modelViewer = document.getElementById('detailModelViewer');
      if (modelViewer && modelViewer.activateAR) {
        try {
          modelViewer.activateAR();
          this.showNotification('Tap on screen to place artifact', 'AR');
        } catch (e) {
          this.showNotification('AR not supported on this device', 'AR');
        }
      }
    }

    // Utility Functions
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

    logArtifactVisit(artifactId) {
      const visits = JSON.parse(localStorage.getItem('artifactVisits') || '{}');
      visits[artifactId] = (visits[artifactId] || 0) + 1;
      localStorage.setItem('artifactVisits', JSON.stringify(visits));
    }

    showQuickPreview(artifactId) {
      const artifact = document.querySelector(`[data-id="${artifactId}"]`);
      if (!artifact) return;
      
      this.showNotification(`Previewing: ${artifact.dataset.title}`, 'Preview');
    }

    showNotification(message, title = 'Notification') {
      // Create enhanced notification
      const notification = document.createElement('div');
      notification.className = 'enhanced-notification';
      notification.innerHTML = `
        <div class="notification-header">
          <i class="fas fa-info-circle"></i>
          <span class="notification-title">${title}</span>
        </div>
        <div class="notification-body">${message}</div>
      `;
      
      document.body.appendChild(notification);
      
      // Show notification
      notification.style.display = 'block';
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          notification.remove();
        }, 300);
      }, 3000);
    }

    handleKeyboardShortcuts(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key) {
        case 'Escape':
          if (this.isFullscreen) {
            document.getElementById('closeFullscreenBtn').click();
          } else if (this.elements.detailsOverlay.style.display === 'block') {
            this.closeDetails();
          }
          break;
        case 'ArrowRight':
          if (this.elements.detailsOverlay.style.display === 'block') {
            this.navigateNext();
          }
          break;
        case 'ArrowLeft':
          if (this.elements.detailsOverlay.style.display === 'block') {
            this.navigatePrev();
          }
          break;
        case ' ':
          if (this.elements.detailsOverlay.style.display === 'block') {
            e.preventDefault();
            this.toggleAudio();
          }
          break;
        case 't':
          if (!this.tour.active) {
            this.startAdvancedTour();
          }
          break;
        case 'h':
          this.guideVisible = !this.guideVisible;
          if (this.guideVisible) {
            this.showGuide();
          } else {
            this.hideGuide();
          }
          break;
      }
    }

    createParticles() {
      const particlesContainer = document.createElement('div');
      particlesContainer.className = 'particles';
      
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 20}s`;
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        particlesContainer.appendChild(particle);
      }
      
      document.body.appendChild(particlesContainer);
    }

    setupHotspots() {
      const hotspots = [
        { x: 20, y: 30, title: 'Ancient Era', category: 'ancient' },
        { x: 40, y: 50, title: 'Medieval Collection', category: 'medieval' },
        { x: 60, y: 40, title: 'Modern Art', category: 'modern' },
        { x: 80, y: 60, title: 'Future Tech', category: 'futuristic' }
      ];
      
      const container = document.getElementById('hotspotsContainer');
      if (!container) return;
      
      hotspots.forEach(hotspot => {
        const element = document.createElement('div');
        element.className = 'hotspot';
        element.style.left = `${hotspot.x}%`;
        element.style.top = `${hotspot.y}%`;
        element.innerHTML = `
          <div class="hotspot-tooltip">${hotspot.title}</div>
        `;
        
        element.addEventListener('click', () => {
          this.filterArtifacts(hotspot.category, 
            document.querySelector(`[data-filter="${hotspot.category}"]`));
        });
        
        container.appendChild(element);
      });
    }

    openCustomTourModal() {
      // This would open a modal for custom tour creation
      this.showNotification('Custom tour feature coming soon!', 'Feature');
    }
  }

  // Initialize the museum
  window.museum = new VirtualMuseum();
});

// Add enhanced music controls to the DOM
document.addEventListener('DOMContentLoaded', function() {
  const musicControls = document.createElement('div');
  musicControls.className = 'music-controls';
  musicControls.innerHTML = `
    <div class="music-control" id="playMusic">
      <i class="fas fa-play"></i>
    </div>
    <div class="music-control" id="volumeUp">
      <i class="fas fa-volume-up"></i>
    </div>
    <div class="music-control" id="volumeDown">
      <i class="fas fa-volume-down"></i>
    </div>
  `;
  
  document.body.appendChild(musicControls);
  
  // Add music control functionality
  const bgMusic = document.getElementById('backgroundMusic');
  
  document.getElementById('playMusic').addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play();
      document.getElementById('playMusic').innerHTML = '<i class="fas fa-pause"></i>';
    } else {
      bgMusic.pause();
      document.getElementById('playMusic').innerHTML = '<i class="fas fa-play"></i>';
    }
  });
  
  document.getElementById('volumeUp').addEventListener('click', () => {
    if (bgMusic.volume < 1) bgMusic.volume = Math.min(1, bgMusic.volume + 0.1);
  });
  
  document.getElementById('volumeDown').addEventListener('click', () => {
    if (bgMusic.volume > 0) bgMusic.volume = Math.max(0, bgMusic.volume - 0.1);
  });
});