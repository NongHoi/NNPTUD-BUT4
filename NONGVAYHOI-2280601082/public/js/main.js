// ===== MAIN JAVASCRIPT - MODERN FUNCTIONALITY =====

// Main App Class
class CloudSyncApp {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupAnimations();
    this.setupNavbar();
    this.setupFileUploads();
    this.checkUserAuth();
  }

  // Bind global events
  bindEvents() {
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navbarNav = document.querySelector('.navbar-nav');
    
    if (mobileToggle && navbarNav) {
      mobileToggle.addEventListener('click', () => {
        navbarNav.classList.toggle('show');
      });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.navbar') && navbarNav?.classList.contains('show')) {
        navbarNav.classList.remove('show');
      }
    });

    // Smooth scrolling for anchor links
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
  }

  // Setup scroll animations
  setupAnimations() {
    // Intersection Observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    }, observerOptions);

    // Observe all animatable elements
    document.querySelectorAll('.card, .feature-card, .preview-item').forEach(el => {
      observer.observe(el);
    });
  }

  // Setup navbar scroll effect
  setupNavbar() {
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      });
    }
  }

  // Setup file upload functionality
  setupFileUploads() {
    this.setupDragAndDrop();
    this.setupFilePreview();
  }

  // Drag and drop functionality
  setupDragAndDrop() {
    const fileUploads = document.querySelectorAll('.file-upload');
    
    fileUploads.forEach(upload => {
      const label = upload.querySelector('.file-upload-label');
      const input = upload.querySelector('input[type="file"]');
      
      if (!label || !input) return;

      // Prevent default behaviors
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        label.addEventListener(eventName, this.preventDefaults, false);
        document.body.addEventListener(eventName, this.preventDefaults, false);
      });

      // Highlight drop area
      ['dragenter', 'dragover'].forEach(eventName => {
        label.addEventListener(eventName, () => {
          upload.classList.add('dragover');
        }, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        label.addEventListener(eventName, () => {
          upload.classList.remove('dragover');
        }, false);
      });

      // Handle dropped files
      label.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        input.files = files;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
      }, false);
    });
  }

  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // File preview functionality
  setupFilePreview() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        this.handleFilePreview(e.target);
      });
    });
  }

  handleFilePreview(input) {
    const files = Array.from(input.files);
    const previewContainer = this.findPreviewContainer(input);
    
    if (!previewContainer) return;

    // Clear existing previews
    previewContainer.innerHTML = '';

    files.forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        this.createImagePreview(file, index, previewContainer, input);
      } else {
        this.createFilePreview(file, index, previewContainer);
      }
    });

    // Update file count display
    this.updateFileCount(input, files.length);
  }

  findPreviewContainer(input) {
    // Look for preview container near the input
    const form = input.closest('form');
    return form?.querySelector('.preview-grid, .preview-container, #multiplePreview, #avatarPreview');
  }

  createImagePreview(file, index, container, input) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const previewItem = document.createElement('div');
      previewItem.className = 'preview-item';
      previewItem.innerHTML = `
        <img src="${e.target.result}" alt="Preview ${index + 1}">
        <button type="button" class="remove-btn" onclick="CloudSync.removeFile(${index}, '${input.id}')">×</button>
      `;
      
      container.appendChild(previewItem);
      
      // Add animation
      setTimeout(() => {
        previewItem.classList.add('fade-in');
      }, 10);
    };
    
    reader.readAsDataURL(file);
  }

  createFilePreview(file, index, container) {
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item file-preview';
    previewItem.innerHTML = `
      <div class="file-info">
        <div class="file-icon">📄</div>
        <div class="file-name">${file.name}</div>
        <div class="file-size">${this.formatFileSize(file.size)}</div>
      </div>
      <button type="button" class="remove-btn" onclick="CloudSync.removeFile(${index})">×</button>
    `;
    
    container.appendChild(previewItem);
  }

  updateFileCount(input, count) {
    const fileNameDisplay = input.closest('form')?.querySelector('.file-name, #avatarFileName, #multipleFileNames');
    if (fileNameDisplay) {
      if (count === 0) {
        fileNameDisplay.textContent = '';
      } else if (count === 1) {
        fileNameDisplay.textContent = `Đã chọn: ${input.files[0].name}`;
      } else {
        fileNameDisplay.textContent = `Đã chọn: ${count} file(s)`;
      }
    }
  }

  removeFile(index, inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const dt = new DataTransfer();
    const files = Array.from(input.files);
    
    files.forEach((file, i) => {
      if (i !== index) {
        dt.items.add(file);
      }
    });
    
    input.files = dt.files;
    
    // Trigger change event to update preview
    const event = new Event('change', { bubbles: true });
    input.dispatchEvent(event);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Authentication methods
  checkUserAuth() {
    const token = this.getToken();
    const authElements = document.querySelectorAll('[data-auth]');
    
    authElements.forEach(element => {
      const requiredAuth = element.dataset.auth === 'true';
      
      if (requiredAuth && !token) {
        element.style.display = 'none';
      } else if (!requiredAuth && token) {
        element.style.display = 'none';
      }
    });
  }

  getToken() {
    return localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
  }

  setToken(token, remember = false) {
    if (remember) {
      localStorage.setItem('jwt_token', token);
    } else {
      sessionStorage.setItem('jwt_token', token);
    }
    
    this.checkUserAuth();
  }

  removeToken() {
    localStorage.removeItem('jwt_token');
    sessionStorage.removeItem('jwt_token');
    this.checkUserAuth();
  }

  // API Helper methods
  async apiRequest(url, options = {}) {
    const token = this.getToken();
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, mergedOptions);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Upload methods
  async uploadAvatar(file, token) {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.apiRequest('/users/upload-avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
  }

  async uploadMultipleFiles(files, token) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return this.apiRequest('/files/upload-multiple', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
  }

  // UI Helper methods
  showAlert(message, type = 'info', duration = 5000) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert-floating');
    existingAlerts.forEach(alert => alert.remove());

    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-floating`;
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      max-width: 500px;
      animation: slideInRight 0.3s ease;
    `;
    
    const icon = this.getAlertIcon(type);
    alert.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 1.2em;">${icon}</span>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" style="margin-left: auto; background: none; border: none; font-size: 1.2em; cursor: pointer;">×</button>
      </div>
    `;
    
    document.body.appendChild(alert);
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        if (alert.parentElement) {
          alert.style.animation = 'slideOutRight 0.3s ease';
          setTimeout(() => alert.remove(), 300);
        }
      }, duration);
    }
  }

  getAlertIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  showLoading(element, show = true) {
    if (show) {
      element.classList.add('active');
    } else {
      element.classList.remove('active');
    }
  }

  updateProgress(percentage) {
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
      bar.style.width = `${percentage}%`;
      bar.textContent = `${Math.round(percentage)}%`;
    });
  }

  // Form validation
  validateForm(form) {
    const inputs = form.querySelectorAll('.form-control[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!input.value.trim()) {
        this.setInputState(input, 'invalid');
        isValid = false;
      } else {
        this.setInputState(input, 'valid');
      }
    });

    return isValid;
  }

  setInputState(input, state) {
    input.classList.remove('is-valid', 'is-invalid');
    if (state !== 'normal') {
      input.classList.add(`is-${state}`);
    }
  }

  // Theme methods
  toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark-theme');
    
    if (isDark) {
      body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    } else {
      body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    }
  }

  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.body.classList.add('dark-theme');
    }
  }

  // Utility methods
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Copy to clipboard
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showAlert('Đã sao chép vào clipboard!', 'success', 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      this.showAlert('Không thể sao chép!', 'error', 2000);
    }
  }

  // Generate unique ID
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Format date
  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Intl.DateTimeFormat('vi-VN', { ...defaultOptions, ...options }).format(new Date(date));
  }
}

// Form Handlers
class FormHandlers {
  static async handleAvatarUpload(form, app) {
    const token = form.querySelector('input[name="token"]').value;
    const fileInput = form.querySelector('input[type="file"]');
    const loadingElement = form.closest('.card').querySelector('.loading');
    const messageElement = form.closest('.card').querySelector('.message');
    
    if (!fileInput.files[0]) {
      app.showAlert('Vui lòng chọn file!', 'error');
      return false;
    }

    try {
      app.showLoading(loadingElement, true);
      messageElement.style.display = 'none';

      const result = await app.uploadAvatar(fileInput.files[0], token);
      
      if (result.success) {
        app.showAlert(`✅ Upload thành công! Avatar URL: ${result.data.avatarURL}`, 'success');
        form.reset();
      } else {
        app.showAlert(`❌ Lỗi: ${result.message || 'Upload thất bại'}`, 'error');
      }
    } catch (error) {
      app.showAlert(`❌ Lỗi: ${error.message}`, 'error');
    } finally {
      app.showLoading(loadingElement, false);
    }

    return false;
  }

  static async handleMultipleUpload(form, app) {
    const token = form.querySelector('input[name="token"]').value;
    const fileInput = form.querySelector('input[type="file"]');
    const loadingElement = form.closest('.card').querySelector('.loading');
    const messageElement = form.closest('.card').querySelector('.message');
    
    if (!fileInput.files.length) {
      app.showAlert('Vui lòng chọn ít nhất 1 file!', 'error');
      return false;
    }

    try {
      app.showLoading(loadingElement, true);
      messageElement.style.display = 'none';

      const files = Array.from(fileInput.files);
      const result = await app.uploadMultipleFiles(files, token);
      
      if (result.success) {
        app.showAlert(`✅ Upload thành công ${result.data.length} file(s)!`, 'success');
        form.reset();
        // Clear preview
        const previewContainer = form.querySelector('.preview-grid, .preview-container');
        if (previewContainer) {
          previewContainer.innerHTML = '';
        }
      } else {
        app.showAlert(`❌ Lỗi: ${result.message || 'Upload thất bại'}`, 'error');
      }
    } catch (error) {
      app.showAlert(`❌ Lỗi: ${error.message}`, 'error');
    } finally {
      app.showLoading(loadingElement, false);
    }

    return false;
  }

  static handleLoginForm(form, app) {
    const username = form.querySelector('input[name="username"]').value;
    const password = form.querySelector('input[name="password"]').value;
    const remember = form.querySelector('input[name="remember"]')?.checked || false;

    // Simple validation
    if (!username || !password) {
      app.showAlert('Vui lòng nhập đầy đủ thông tin!', 'error');
      return false;
    }

    // TODO: Implement actual login API call
    app.showAlert('Chức năng đăng nhập đang được phát triển...', 'info');
    return false;
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize main app
  window.CloudSync = new CloudSyncApp();
  
  // Initialize theme
  CloudSync.initTheme();
  
  // Add form event listeners
  const avatarForm = document.getElementById('avatarForm');
  if (avatarForm) {
    avatarForm.addEventListener('submit', (e) => {
      e.preventDefault();
      FormHandlers.handleAvatarUpload(avatarForm, CloudSync);
    });
  }

  const multipleForm = document.getElementById('multipleForm');
  if (multipleForm) {
    multipleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      FormHandlers.handleMultipleUpload(multipleForm, CloudSync);
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      FormHandlers.handleLoginForm(loginForm, CloudSync);
    });
  }

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for theme toggle
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      CloudSync.toggleTheme();
    }
  });

  // Add service worker registration (for PWA support)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
});

// Export for global access
window.CloudSyncApp = CloudSyncApp;
window.FormHandlers = FormHandlers;
