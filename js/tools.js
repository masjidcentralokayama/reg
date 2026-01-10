/* jshint browser: true, esversion: 6, devel: true */
/* global Chart, jsQR, sessionStorage, fetch, alert, prompt, confirm, URL, Blob */
/* eslint-disable */

// ============================================
// KONSTANTA SISTEM
// ============================================

const CONSTANTS = {
  // User roles
  ROLES: {
    ADMIN: 'Administrator',
    PANITIA: 'Panitia'
  },
  
  // Permissions
  PERMISSIONS: {
    SCANNER: 'scanner',
    PARTICIPANTS: 'participants',
    ANALYTICS: 'analytics',
    SETTINGS: 'settings'
  },
  
  // Participant status
  STATUS: {
    PRESENT: 'Hadir',
    WAITING: 'Menunggu'
  },
  
  // Notification types
  NOTIFICATION_TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  },
  
  // Time intervals
  INTERVALS: {
    AUTO_REFRESH: 120000, // 2 menit
    SESSION_CHECK: 60000, // 1 menit
    SCAN_TIMEOUT: 15000   // 15 detik
  }
};

// ============================================
// UTILITAS UMUM
// ============================================

// Fungsi untuk mendapatkan nilai CSS variable
function getCSSVariable(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Format waktu
function formatTime(date = new Date()) {
  return date.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
}

// Format tanggal
function formatDate(date = new Date()) {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// ============================================
// KONFIGURASI SISTEM
// ============================================

const API_URL = "https://script.google.com/macros/s/AKfycbwmZI49Ib5U49RbybUFGS6uKln03vjMxI2vWYY6e5xrWZwMia_8eULpH2sfqaBuy5RF/exec";
const LOGIN_ENDPOINT = `${API_URL}?action=login`;

// ============================================
// SESSION MANAGEMENT
// ============================================

const SessionManager = {
  TOKEN_KEY: 'iftar_auth_token',
  
  saveSession: function(token, userData, expiresInHours = 8) {
    const sessionData = {
      token: token,
      user: userData,
      expiry: Date.now() + (expiresInHours * 60 * 60 * 1000)
    };
    
    try {
      sessionStorage.setItem(this.TOKEN_KEY, JSON.stringify(sessionData));
      return true;
    } catch (error) {
      console.error('Failed to save session:', error);
      return false;
    }
  },
  
  validateSession: function() {
    try {
      const sessionData = sessionStorage.getItem(this.TOKEN_KEY);
      
      if (!sessionData) return null;
      
      const parsed = JSON.parse(sessionData);
      
      // Cek expiry
      if (Date.now() > parsed.expiry) {
        this.clearSession();
        return null;
      }
      
      // Cek structure
      if (!parsed.token || !parsed.user) {
        this.clearSession();
        return null;
      }
      
      return parsed;
      
    } catch (error) {
      console.error('Session validation error:', error);
      this.clearSession();
      return null;
    }
  },
  
  getToken: function() {
    const session = this.validateSession();
    return session ? session.token : null;
  },
  
  getUser: function() {
    const session = this.validateSession();
    return session ? session.user : null;
  },
  
  clearSession: function() {
    sessionStorage.removeItem(this.TOKEN_KEY);
  },
  
  extendSession: function(extraHours = 0.5) {
    const session = this.validateSession();
    if (session) {
      session.expiry = Date.now() + (extraHours * 60 * 60 * 1000);
      sessionStorage.setItem(this.TOKEN_KEY, JSON.stringify(session));
      return true;
    }
    return false;
  }
};

// ============================================
// DOM ELEMENTS CACHE
// ============================================

const DOM = {
  // Login elements
  loginForm: document.getElementById('loginForm'),
  usernameInput: document.getElementById('username'),
  passwordInput: document.getElementById('password'),
  loginBtn: document.getElementById('loginBtn'),
  loginError: document.getElementById('loginError'),
  loginContainer: document.getElementById('loginContainer'),
  
  // Dashboard elements
  dashboardContainer: document.getElementById('dashboardContainer'),
  userRole: document.getElementById('userRole'),
  logoutBtn: document.getElementById('logoutBtn'),
  
  // Stats elements
  statElements: {
    totalRegistered: document.querySelector('[data-stat="totalRegistered"]'),
    totalPresent: document.querySelector('[data-stat="totalPresent"]'),
    totalWaiting: document.querySelector('[data-stat="totalWaiting"]'),
    totalPeople: document.querySelector('[data-stat="totalPeople"]')
  },
  
  // Scanner elements
  video: document.getElementById('video'),
  startScannerBtn: document.getElementById('startScanner'),
  stopScannerBtn: document.getElementById('stopScanner'),
  manualCheckinBtn: document.getElementById('manualCheckin'),
  scanResult: document.getElementById('scanResult'),
  scanResultContent: document.getElementById('scanResultContent'),
  confirmCheckinBtn: document.getElementById('confirmCheckin'),
  cancelCheckinBtn: document.getElementById('cancelCheckin'),
  
  // Table elements
  participantsTableBody: document.getElementById('participantsTableBody'),
  searchInput: document.getElementById('searchInput'),
  refreshBtn: document.getElementById('refreshBtn'),
  exportBtn: document.getElementById('exportBtn'),
  prevPageBtn: document.getElementById('prevPage'),
  nextPageBtn: document.getElementById('nextPage'),
  pageInfo: document.getElementById('pageInfo'),
  tableTotal: document.getElementById('tableTotal'),
  
  // Charts
  charts: {
    attendance: document.getElementById('attendanceChart'),
    registration: document.getElementById('registrationChart'),
    location: document.getElementById('locationChart'),
    gender: document.getElementById('genderChart')
  },
  
  // Analytics
  avgAge: document.getElementById('avgAge'),
  topLocation: document.getElementById('topLocation'),
  lastCheckin: document.getElementById('lastCheckin'),
  todayReg: document.getElementById('todayReg'),
  
  // Settings
  savePasswordBtn: document.getElementById('savePasswordBtn'),
  saveEmailBtn: document.getElementById('saveEmailBtn'),
  backupBtn: document.getElementById('backupBtn'),
  
  // System
  updateTime: document.getElementById('updateTime'),
  systemStatus: document.getElementById('systemStatus'),
  dataCount: document.getElementById('dataCount'),
  serverTime: document.getElementById('serverTime'),
  
  // Loading
  loadingOverlay: document.getElementById('loadingOverlay'),
  loadingText: document.getElementById('loadingText')
};

// ============================================
// FUNGSI YANG HILANG
// ============================================

// Fungsi showLogin yang hilang
function showLogin() {
  console.log('🔐 Menampilkan form login');
  
  if (DOM.loginContainer) {
    DOM.loginContainer.style.display = 'block';
  }
  if (DOM.dashboardContainer) {
    DOM.dashboardContainer.style.display = 'none';
  }
  
  // Reset form login
  if (DOM.loginForm) {
    DOM.loginForm.reset();
  }
  if (DOM.loginError) {
    DOM.loginError.style.display = 'none';
  }
  
  // Stop scanner jika aktif
  if (scannerActive) {
    stopScanner();
  }
  
  // Cleanup resources
  cleanupResources();
}

// ============================================
// STATE APLIKASI
// ============================================

let currentUser = null;
let authToken = null;
let scannerActive = false;
let videoStream = null;
let currentScannerData = null;
let participantsData = [];
let currentPage = 1;
const itemsPerPage = 10;

// Chart instances
const chartManager = {
  instances: {},
  
  create: function(chartId, config) {
    this.destroy(chartId);
    
    const canvas = document.getElementById(chartId);
    if (!canvas) {
      console.error(`Canvas ${chartId} not found`);
      return null;
    }
    
    const ctx = canvas.getContext('2d');
    this.instances[chartId] = new Chart(ctx, config);
    
    return this.instances[chartId];
  },
  
  destroy: function(chartId) {
    if (this.instances[chartId]) {
      this.instances[chartId].destroy();
      delete this.instances[chartId];
    }
  },
  
  destroyAll: function() {
    Object.keys(this.instances).forEach(chartId => {
      this.destroy(chartId);
    });
  }
};

// Audio Context untuk efek suara
let audioContext = null;
let audioBuffers = {};

// ============================================
// FUNGSI UTILITAS
// ============================================

// Update waktu terakhir update
function updateLastUpdateTime() {
  if (DOM.updateTime) {
    DOM.updateTime.textContent = formatTime(new Date());
  }
}

// Update waktu server
function updateServerTime() {
  if (DOM.serverTime) {
    DOM.serverTime.textContent = formatTime(new Date());
  }
}

// Tampilkan loading overlay
function showLoading(text = 'Memuat data...') {
  if (DOM.loadingText && DOM.loadingOverlay) {
    DOM.loadingText.textContent = text;
    DOM.loadingOverlay.style.display = 'flex';
  }
}

// Sembunyikan loading overlay
function hideLoading() {
  if (DOM.loadingOverlay) {
    DOM.loadingOverlay.style.display = 'none';
  }
}

// Inisialisasi audio untuk efek suara
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Buat beep suara untuk berbagai kondisi
    audioBuffers = {
      success: createBeepBuffer(800, 0.3),
      error: createBeepBuffer(400, 0.5),
      warning: createBeepBuffer(600, 0.4),
      scan: createBeepBuffer(1000, 0.2)
    };
  }
}

// Buat buffer beep untuk efek suara
function createBeepBuffer(frequency, duration) {
  if (!audioContext) return null;
  
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.5;
    
    // Fade out untuk menghindari popping
    if (i > sampleRate * duration * 0.8) {
      data[i] *= (1 - (i - sampleRate * duration * 0.8) / (sampleRate * duration * 0.2));
    }
  }
  
  return buffer;
}

// Mainkan efek suara
function playSound(type) {
  if (!audioContext || !audioBuffers[type]) {
    console.warn('Audio tidak tersedia untuk:', type);
    return;
  }
  
  try {
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers[type];
    source.connect(audioContext.destination);
    source.start();
  } catch (error) {
    console.error('Gagal memainkan suara:', error);
  }
}

// Utility function untuk fetch dengan error handling
async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result;
    
  } catch (error) {
    console.error('Fetch error:', error);
    
    // Tampilkan notifikasi yang user-friendly
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      showNotification('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.', CONSTANTS.NOTIFICATION_TYPES.ERROR);
    } else {
      showNotification(`Error: ${error.message}`, CONSTANTS.NOTIFICATION_TYPES.ERROR);
    }
    
    throw error;
  }
}

// ============================================
// FUNGSI NOTIFIKASI
// ============================================

function showNotification(message, type = CONSTANTS.NOTIFICATION_TYPES.INFO) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.setAttribute('role', 'alert');
  
  let icon = 'info-circle';
  switch(type) {
    case CONSTANTS.NOTIFICATION_TYPES.SUCCESS: icon = 'check-circle'; break;
    case CONSTANTS.NOTIFICATION_TYPES.ERROR: icon = 'exclamation-circle'; break;
    case CONSTANTS.NOTIFICATION_TYPES.WARNING: icon = 'exclamation-triangle'; break;
  }
  
  notification.innerHTML = `
    <i class="fas fa-${icon}" aria-hidden="true"></i>
    <span>${message}</span>
  `;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// ============================================
// FUNGSI LOGIN
// ============================================

async function handleLogin(e) {
  if (e) e.preventDefault();
  
  const username = DOM.usernameInput ? DOM.usernameInput.value : '';
  const password = DOM.passwordInput ? DOM.passwordInput.value : '';
  
  // Validasi input
  if (!username || !password) {
    showNotification('Harap isi username dan password', CONSTANTS.NOTIFICATION_TYPES.WARNING);
    playSound('warning');
    return;
  }
  
  showLoading('Memproses login...');
  
  try {
    // Kirim request login
    const response = await fetch(`${API_URL}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.status === "success" && result.token && result.user) {
      // Simpan session
      SessionManager.saveSession(result.token, result.user);
      
      // Set global variables
      currentUser = result.user;
      authToken = result.token;
      
      showNotification('Login berhasil!', CONSTANTS.NOTIFICATION_TYPES.SUCCESS);
      playSound('success');
      
      // Tampilkan dashboard
      showDashboard();
    } else {
      throw new Error(result.message || 'Login gagal');
    }
  } catch (error) {
    console.error('Login error:', error);
    showNotification(`Login gagal: ${error.message}`, CONSTANTS.NOTIFICATION_TYPES.ERROR);
    playSound('error');
    
    // Tampilkan error di form
    if (DOM.loginError) {
      DOM.loginError.textContent = error.message;
      DOM.loginError.style.display = 'block';
    }
  } finally {
    hideLoading();
  }
}

// ============================================
// FUNGSI DASHBOARD
// ============================================

async function showDashboard() {
  if (DOM.loginContainer) {
    DOM.loginContainer.style.display = 'none';
  }
  if (DOM.dashboardContainer) {
    DOM.dashboardContainer.style.display = 'block';
  }
  
  // Inisialisasi audio
  initAudio();
  
  // Update UI berdasarkan role
  updateUIForRole();
  
  // Load data awal
  showLoading('Memuat data dashboard...');
  await loadDashboardData();
  hideLoading();
  
  // Setup tabs berdasarkan permission
  setupTabs();
  
  // Setup scanner
  setupScanner();
  
  // Setup event listeners
  setupDashboardListeners();
  
  // Update waktu server
  updateServerTime();
  setInterval(updateServerTime, 1000);
  
  // Setup auto refresh
  startAutoRefresh(CONSTANTS.INTERVALS.AUTO_REFRESH);
  
  // Auto-extend session setiap 30 menit jika user aktif
  setInterval(() => {
    if (document.hasFocus()) {
      SessionManager.extendSession(0.5);
    }
  }, 30 * 60 * 1000);
}

function updateUIForRole() {
  if (DOM.userRole && currentUser) {
    DOM.userRole.textContent = currentUser.role;
  }
  
  // Sembunyikan/munculkan tab berdasarkan permissions
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    const tabName = tab.dataset.tab;
    if (currentUser && currentUser.permissions && currentUser.permissions.includes(tabName)) {
      tab.style.display = 'flex';
    } else {
      tab.style.display = 'none';
    }
  });
  
  // Jika scanner adalah satu-satunya permission, aktifkan tab scanner
  if (currentUser && currentUser.permissions && 
      currentUser.permissions.length === 1 && 
      currentUser.permissions[0] === CONSTANTS.PERMISSIONS.SCANNER) {
    const scannerTab = document.querySelector('[data-tab="scanner"]');
    if (scannerTab) {
      scannerTab.click();
    }
  }
}

function setupDashboardListeners() {
  // Logout button
  if (DOM.logoutBtn) {
    DOM.logoutBtn.addEventListener('click', function() {
      if (confirm('Apakah Anda yakin ingin logout?')) {
        // Stop scanner if active
        if (scannerActive) {
          stopScanner();
        }
        
        // Clear session
        SessionManager.clearSession();
        currentUser = null;
        authToken = null;
        
        // Cleanup resources
        cleanupResources();
        
        // Show login
        showLogin();
      }
    });
  }
  
  // Refresh button
  if (DOM.refreshBtn) {
    DOM.refreshBtn.addEventListener('click', async function() {
      const btn = this;
      const originalHtml = btn.innerHTML;
      
      btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>';
      btn.disabled = true;
      
      await loadDashboardData();
      
      btn.innerHTML = originalHtml;
      btn.disabled = false;
      
      showNotification('Data diperbarui', CONSTANTS.NOTIFICATION_TYPES.SUCCESS);
      playSound('success');
    });
  }
  
  // Export button (hanya untuk admin)
  if (DOM.exportBtn) {
    DOM.exportBtn.addEventListener('click', exportData);
  }
  
  // Search functionality
  if (DOM.searchInput) {
    DOM.searchInput.addEventListener('input', function() {
      currentPage = 1;
      updateParticipantsTable();
    });
  }
  
  // Pagination
  if (DOM.prevPageBtn) {
    DOM.prevPageBtn.addEventListener('click', function() {
      if (currentPage > 1) {
        currentPage--;
        updateParticipantsTable();
      }
    });
  }
  
  if (DOM.nextPageBtn) {
    DOM.nextPageBtn.addEventListener('click', function() {
      const totalPages = Math.ceil(participantsData.length / itemsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        updateParticipantsTable();
      }
    });
  }
  
  // Settings buttons (hanya untuk admin)
  if (DOM.savePasswordBtn) {
    DOM.savePasswordBtn.addEventListener('click', savePassword);
  }
  if (DOM.saveEmailBtn) {
    DOM.saveEmailBtn.addEventListener('click', saveEmail);
  }
  if (DOM.backupBtn) {
    DOM.backupBtn.addEventListener('click', backupData);
  }
}

// ============================================
// FUNGSI DATA PESERTA
// ============================================

async function loadDashboardData() {
  try {
    // Load participants data
    await loadParticipants();
    
    // Update stats
    updateStats();
    
    // Update table hanya jika user memiliki permission
    if (currentUser && currentUser.permissions && currentUser.permissions.includes(CONSTANTS.PERMISSIONS.PARTICIPANTS)) {
      updateParticipantsTable();
    }
    
    // Update charts hanya jika user memiliki permission
    if (currentUser && currentUser.permissions && currentUser.permissions.includes(CONSTANTS.PERMISSIONS.ANALYTICS)) {
      updateCharts();
    }
    
    // Update last update time
    updateLastUpdateTime();
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showNotification('Gagal memuat data', CONSTANTS.NOTIFICATION_TYPES.ERROR);
    playSound('error');
  }
}

async function loadParticipants() {
  try {
    showLoading('Memuat data peserta...');
    
    const result = await safeFetch(`${API_URL}?action=get_participants&_t=${new Date().getTime()}`);
    
    if (result.success && result.participants) {
      participantsData = result.participants.map(participant => ({
        id: participant.id || participant.ID || '-',
        nama: participant.name || participant.nama || participant.Nama || '-',
        phone: participant.phone || participant.no_hp || participant.Phone || '-',
        email: participant.email || participant.Email || '-',
        domisili: participant.domisili || participant.Domisili || 'Tidak diketahui',
        total: parseInt(participant.total) || parseInt(participant.Total) || 1,
        status: participant.status || participant.Status || CONSTANTS.STATUS.WAITING,
        checkin_time: participant.checkin_time || participant['Check-in Time'] || '-',
        usia: participant.usia || participant.Usia || '-',
        gender: participant.gender || participant.jk || participant.Gender || '-',
        registration_date: participant.registration_date || participant['Registration Date'] || '-'
      }));
      
      console.log('Participants loaded:', participantsData.length);
      showNotification('Data peserta berhasil dimuat', CONSTANTS.NOTIFICATION_TYPES.SUCCESS);
      playSound('success');
    } else {
      throw new Error(result.error || 'Gagal mengambil data');
    }
  } catch (error) {
    console.error('Error loading participants:', error);
    participantsData = [];
  } finally {
    hideLoading();
  }
}

function updateStats() {
  const stats = {
    totalRegistered: participantsData.length,
    totalPresent: participantsData.filter(p => p.status === CONSTANTS.STATUS.PRESENT).length,
    totalWaiting: participantsData.length - participantsData.filter(p => p.status === CONSTANTS.STATUS.PRESENT).length,
    totalPeople: participantsData.reduce((sum, p) => sum + (parseInt(p.total) || 1), 0)
  };
  
  // Update semua stats sekaligus
  Object.keys(stats).forEach(stat => {
    const element = DOM.statElements[stat];
    if (element) {
      element.textContent = stats[stat];
    }
  });
  
  if (DOM.dataCount) {
    DOM.dataCount.textContent = `${participantsData.length} data tersimpan`;
  }
}

function updateParticipantsTable() {
  if (!DOM.participantsTableBody) return;
  
  const searchTerm = DOM.searchInput ? DOM.searchInput.value.toLowerCase() : '';
  
  // Filter data
  const filteredData = participantsData.filter(p =>
    p.nama.toLowerCase().includes(searchTerm) ||
    p.id.toLowerCase().includes(searchTerm) ||
    p.domisili.toLowerCase().includes(searchTerm)
  );
  
  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = filteredData.slice(startIndex, endIndex);
  
  // Clear table
  DOM.participantsTableBody.innerHTML = '';
  
  // Add rows
  pageData.forEach(participant => {
    const row = document.createElement('tr');
    
    // Status badge
    const statusClass = participant.status === CONSTANTS.STATUS.PRESENT ? 'status-success' : 'status-warning';
    const statusIcon = participant.status === CONSTANTS.STATUS.PRESENT ? 'fa-check-circle' : 'fa-clock';
    
    row.innerHTML = `
      <td><strong>${participant.id}</strong></td>
      <td>${participant.nama}</td>
      <td>${participant.total} orang</td>
      <td><span class="status-badge ${statusClass}"><i class="fas ${statusIcon}" aria-hidden="true"></i> ${participant.status}</span></td>
      <td>${participant.checkin_time || '-'}</td>
      <td class="actions">
        ${participant.status !== CONSTANTS.STATUS.PRESENT ? 
          `<button class="btn-action btn-checkin" data-id="${participant.id}" aria-label="Check-in ${participant.nama}">
            <i class="fas fa-user-check" aria-hidden="true"></i> Check-in
          </button>` : 
          '<span class="text-muted"><i class="fas fa-check" aria-hidden="true"></i> Selesai</span>'
        }
        ${currentUser && currentUser.role === CONSTANTS.ROLES.ADMIN ? 
          `<button class="btn-action btn-view" data-id="${participant.id}" aria-label="Lihat detail ${participant.nama}">
            <i class="fas fa-eye" aria-hidden="true"></i>
          </button>` : ''
        }
      </td>
    `;
    
    DOM.participantsTableBody.appendChild(row);
  });
  
  // Update pagination info
  if (DOM.pageInfo) {
    DOM.pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages}`;
  }
  if (DOM.tableTotal) {
    DOM.tableTotal.textContent = filteredData.length;
  }
  
  // Update pagination buttons
  if (DOM.prevPageBtn) {
    DOM.prevPageBtn.disabled = currentPage === 1;
  }
  if (DOM.nextPageBtn) {
    DOM.nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
  }
}

// ============================================
// FUNGSI SCANNER QR
// ============================================

function setupScanner() {
  if (DOM.startScannerBtn) {
    DOM.startScannerBtn.addEventListener('click', startScanner);
  }
  if (DOM.stopScannerBtn) {
    DOM.stopScannerBtn.addEventListener('click', stopScanner);
  }
  if (DOM.manualCheckinBtn) {
    DOM.manualCheckinBtn.addEventListener('click', showManualCheckin);
  }
  
  // Confirm check-in button
  if (DOM.confirmCheckinBtn) {
    DOM.confirmCheckinBtn.addEventListener('click', confirmCheckin);
  }
  if (DOM.cancelCheckinBtn) {
    DOM.cancelCheckinBtn.addEventListener('click', cancelCheckin);
  }
  
  // Handle tab visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && scannerActive) {
      console.log('Tab tidak aktif, stopping scanner...');
      stopScanner();
    }
  });
}

async function startScanner() {
  if (scannerActive) return;
  
  try {
    // Cek apakah browser mendukung mediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser tidak mendukung akses kamera');
    }
    
    // Cek izin kamera terlebih dahulu
    if (navigator.permissions && navigator.permissions.query) {
      const cameraPermission = await navigator.permissions.query({ name: 'camera' });
      
      if (cameraPermission.state === 'denied') {
        throw new Error('IZIN_KAMERA_DITOLAK');
      }
    }
    
    const constraints = {
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 }
      }
    };
    
    videoStream = await navigator.mediaDevices.getUserMedia(constraints);
    
    if (DOM.video) {
      DOM.video.srcObject = videoStream;
      
      // Handle video errors
      DOM.video.onerror = () => {
        throw new Error('Gagal memuat video stream');
      };
      
      await new Promise((resolve, reject) => {
        DOM.video.onloadedmetadata = resolve;
        DOM.video.onerror = reject;
        setTimeout(() => reject(new Error('Timeout loading video')), 5000);
      });
      
      DOM.video.play();
    }
    
    scannerActive = true;
    if (DOM.startScannerBtn) {
      DOM.startScannerBtn.disabled = true;
    }
    if (DOM.stopScannerBtn) {
      DOM.stopScannerBtn.disabled = false;
    }
    
    scanQRCode();
    showNotification('Scanner aktif', CONSTANTS.NOTIFICATION_TYPES.INFO);
    playSound('scan');
    
  } catch (error) {
    console.error('Camera error:', error);
    
    let errorMessage = 'Tidak dapat mengakses kamera';
    let errorType = CONSTANTS.NOTIFICATION_TYPES.ERROR;
    
    switch(error.message) {
      case 'IZIN_KAMERA_DITOLAK':
        errorMessage = 'Izin kamera ditolak. Silakan aktifkan izin kamera di pengaturan browser.';
        break;
      case 'Permission dismissed':
      case 'Permission denied':
        errorMessage = 'Anda perlu memberikan izin kamera untuk menggunakan scanner.';
        break;
      case 'Requested device not found':
        errorMessage = 'Kamera tidak ditemukan di perangkat ini.';
        break;
      default:
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Akses kamera ditolak oleh pengguna atau browser.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'Tidak ada kamera yang ditemukan.';
          errorType = CONSTANTS.NOTIFICATION_TYPES.WARNING;
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Kamera sedang digunakan oleh aplikasi lain.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'Kamera tidak memenuhi persyaratan. Coba gunakan kamera lain.';
        }
    }
    
    showNotification(errorMessage, errorType);
    playSound('error');
    
    // Tawarkan fallback ke manual input
    setTimeout(() => {
      if (confirm('Gagal mengakses kamera. Ingin melakukan check-in manual?')) {
        showManualCheckin();
      }
    }, 1500);
  }
}

function stopScanner() {
  if (!scannerActive) return;
  
  // Stop video stream
  if (videoStream) {
    videoStream.getTracks().forEach(track => {
      track.stop();
    });
    videoStream = null;
  }
  
  // Reset scanner state
  scannerActive = false;
  if (DOM.startScannerBtn) {
    DOM.startScannerBtn.disabled = false;
  }
  if (DOM.stopScannerBtn) {
    DOM.stopScannerBtn.disabled = true;
  }
  
  // Hide result
  if (DOM.scanResult) {
    DOM.scanResult.classList.remove('active');
  }
  
  showNotification('Scanner dihentikan', CONSTANTS.NOTIFICATION_TYPES.INFO);
}

function scanQRCode() {
  if (!scannerActive || !DOM.video) return;
  
  // Pastikan video siap
  if (DOM.video.readyState === DOM.video.HAVE_ENOUGH_DATA) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Set canvas size sesuai video
    canvas.width = DOM.video.videoWidth;
    canvas.height = DOM.video.videoHeight;
    
    // Gambar video frame ke canvas
    context.drawImage(DOM.video, 0, 0, canvas.width, canvas.height);
    
    // Ambil image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Coba scan QR code
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
      
      if (code) {
        // QR code ditemukan
        console.log('QR Code found:', code.data);
        handleScannedQR(code.data);
        return;
      }
    } catch (error) {
      console.error('QR scan error:', error);
    }
  }
  
  // Lanjutkan scanning jika masih aktif
  if (scannerActive) {
    requestAnimationFrame(scanQRCode);
  }
}

function handleScannedQR(data) {
  try {
    // Bersihkan data QR
    const cleanData = data.trim();
    console.log("QR Code scanned:", cleanData);
    
    // Hentikan scanner sementara
    if (scannerActive) {
      stopScanner();
    }
    
    // Cari di cache lokal dulu
    const cachedParticipant = participantsData.find(p => p.id === cleanData);
    
    if (cachedParticipant) {
      console.log("Found in cache:", cachedParticipant);
      playSound('scan');
      showScanResult(cachedParticipant);
      return;
    }
    
    // Jika tidak ditemukan di cache, fetch dari server
    fetchParticipantById(cleanData);
    
  } catch (error) {
    console.error('QR parse error:', error);
    showScanError('QR Code tidak valid');
    playSound('error');
  }
}

async function fetchParticipantById(id) {
  showLoading('Mencari data jamaah...');
  
  try {
    const result = await safeFetch(`${API_URL}?action=get_participant&id=${encodeURIComponent(id)}&_t=${new Date().getTime()}`);
    
    if (result.success && result.participant) {
      // Format data peserta
      const participant = {
        id: result.participant.id || result.participant.ID || id,
        nama: result.participant.name || result.participant.nama || result.participant.Nama || 'Tidak diketahui',
        phone: result.participant.phone || result.participant.no_hp || result.participant.Phone || '-',
        email: result.participant.email || result.participant.Email || '-',
        domisili: result.participant.domisili || result.participant.Domisili || 'Tidak diketahui',
        total: parseInt(result.participant.total) || parseInt(result.participant.Total) || 1,
        status: result.participant.status || result.participant.Status || CONSTANTS.STATUS.WAITING,
        checkin_time: result.participant.checkin_time || result.participant['Check-in Time'] || '-',
        usia: result.participant.usia || result.participant.Usia || '-',
        gender: result.participant.gender || result.participant.jk || result.participant.Gender || '-'
      };
      
      // Tambahkan ke cache jika belum ada
      const exists = participantsData.find(p => p.id === id);
      if (!exists) {
        participantsData.push(participant);
      }
      
      currentScannerData = {
        ...participant,
        scannedAt: new Date().toLocaleString('id-ID')
      };
      
      playSound('success');
      showScanResult(participant);
    } else {
      playSound('error');
      showScanError('Data jamaah tidak ditemukan di sistem');
    }
  } catch (error) {
    console.error('Error fetching participant:', error);
    playSound('error');
    showScanError('Gagal menghubungi server');
  } finally {
    hideLoading();
  }
}

function showScanResult(participant) {
  if (!DOM.scanResultContent || !DOM.scanResult) return;
  
  const isPresent = participant.status === CONSTANTS.STATUS.PRESENT;
  
  // Tampilkan data berdasarkan role
  let participantInfo = '';
  
  if (currentUser && currentUser.role === CONSTANTS.ROLES.ADMIN) {
    participantInfo = `
      <div class="info-row">
        <strong>ID:</strong> ${participant.id}
      </div>
      <div class="info-row">
        <strong>Nama:</strong> ${participant.nama}
      </div>
      <div class="info-row">
        <strong>Telepon:</strong> ${participant.phone}
      </div>
      <div class="info-row">
        <strong>Email:</strong> ${participant.email || '-'}
      </div>
      <div class="info-row">
        <strong>Jumlah:</strong> ${participant.total} orang
      </div>
    `;
  } else {
    // Untuk panitia, hanya tampilkan info dasar
    participantInfo = `
      <div class="info-row">
        <strong>ID:</strong> ${participant.id}
      </div>
      <div class="info-row">
        <strong>Nama:</strong> ${participant.nama}
      </div>
      <div class="info-row">
        <strong>Jumlah:</strong> ${participant.total} orang
      </div>
    `;
  }
  
  DOM.scanResultContent.innerHTML = `
    <div class="participant-info">
      ${participantInfo}
      <div class="info-row">
        <strong>Status:</strong> 
        <span class="${isPresent ? 'text-success' : 'text-warning'}">
          <i class="fas ${isPresent ? 'fa-check-circle' : 'fa-clock'}" aria-hidden="true"></i>
          ${isPresent ? 'Sudah Check-in' : 'Belum Check-in'}
        </span>
      </div>
      ${isPresent ? `
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
          Jamaah ini sudah check-in pada ${participant.checkin_time}
        </div>
      ` : `
        <div class="alert alert-success">
          <i class="fas fa-check-circle" aria-hidden="true"></i>
          Jamaah ditemukan. Klik "Konfirmasi Check-in" untuk menandai kehadiran.
        </div>
      `}
    </div>
  `;
  
  DOM.scanResult.classList.add('active');
  
  // Auto-hide setelah 15 detik jika tidak ada aksi
  setTimeout(() => {
    if (DOM.scanResult && DOM.scanResult.classList.contains('active')) {
      cancelCheckin();
      // Restart scanner jika masih di tab scanner
      const scannerTab = document.getElementById('scannerTab');
      if (scannerTab && scannerTab.classList.contains('active')) {
        setTimeout(() => startScanner(), 1000);
      }
    }
  }, CONSTANTS.INTERVALS.SCAN_TIMEOUT);
}

function showScanError(message) {
  if (!DOM.scanResultContent || !DOM.scanResult) return;
  
  DOM.scanResultContent.innerHTML = `
    <div class="alert alert-danger">
      <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
      ${message}
    </div>
    <div class="hint" style="margin-top: 10px; text-align: center;">
      <i class="fas fa-lightbulb" aria-hidden="true"></i>
      Pastikan QR Code dari halaman success.html
    </div>
  `;
  
  DOM.scanResult.classList.add('active');
  
  // Auto-hide setelah 5 detik
  setTimeout(() => {
    cancelCheckin();
    // Restart scanner jika masih di tab scanner
    const scannerTab = document.getElementById('scannerTab');
    if (scannerTab && scannerTab.classList.contains('active')) {
      setTimeout(() => startScanner(), 1000);
    }
  }, 5000);
}

async function confirmCheckin() {
  if (!currentScannerData) return;
  
  showLoading('Memproses check-in...');
  
  try {
    const result = await safeFetch(`${API_URL}?action=checkin&id=${encodeURIComponent(currentScannerData.id)}&_t=${new Date().getTime()}`);
    
    if (result.success) {
      // Update data lokal
      const index = participantsData.findIndex(p => p.id === currentScannerData.id);
      if (index !== -1) {
        participantsData[index].status = CONSTANTS.STATUS.PRESENT;
        participantsData[index].checkin_time = result.checkin_time || new Date().toLocaleString('id-ID');
      } else {
        // Jika tidak ada di cache, tambahkan
        participantsData.push({
          ...currentScannerData,
          status: CONSTANTS.STATUS.PRESENT,
          checkin_time: result.checkin_time || new Date().toLocaleString('id-ID')
        });
      }
      
      // Update UI
      updateStats();
      if (currentUser && currentUser.permissions && currentUser.permissions.includes(CONSTANTS.PERMISSIONS.PARTICIPANTS)) {
        updateParticipantsTable();
      }
      if (currentUser && currentUser.permissions && currentUser.permissions.includes(CONSTANTS.PERMISSIONS.ANALYTICS)) {
        updateCharts();
      }
      
      // Tampilkan notifikasi sukses
      showNotification(`Check-in berhasil untuk ${currentScannerData.nama}`, CONSTANTS.NOTIFICATION_TYPES.SUCCESS);
      playSound('success');
      
      // Reset scanner
      cancelCheckin();
      
      // Auto restart scanner setelah 2 detik
      setTimeout(() => {
        const scannerTab = document.getElementById('scannerTab');
        if (scannerTab && scannerTab.classList.contains('active')) {
          startScanner();
        }
      }, 2000);
    } else {
      playSound('error');
      showNotification('Gagal melakukan check-in: ' + (result.error || 'Unknown error'), CONSTANTS.NOTIFICATION_TYPES.ERROR);
    }
  } catch (error) {
    console.error('Check-in error:', error);
    playSound('error');
    showNotification('Gagal menghubungi server', CONSTANTS.NOTIFICATION_TYPES.ERROR);
  } finally {
    hideLoading();
  }
}

function cancelCheckin() {
  currentScannerData = null;
  if (DOM.scanResult) {
    DOM.scanResult.classList.remove('active');
  }
}

function showManualCheckin() {
  const regId = prompt('Masukkan ID Registrasi Jamaah:');
  if (regId) {
    // Cari peserta
    const participant = participantsData.find(p => p.id === regId);
    if (participant) {
      currentScannerData = participant;
      playSound('scan');
      showScanResult(participant);
    } else {
      alert('ID Registrasi tidak ditemukan');
      playSound('error');
    }
  }
}

// ============================================
// FUNGSI CHART
// ============================================

function updateCharts() {
  updateAttendanceChart();
  updateRegistrationChart();
  updateLocationChart();
  updateGenderChart();
  updateAnalyticsSummary();
}

function updateAttendanceChart() {
  const present = participantsData.filter(p => p.status === CONSTANTS.STATUS.PRESENT).length;
  const waiting = participantsData.length - present;
  
  chartManager.create('attendanceChart', {
    type: 'doughnut',
    data: {
      labels: ['Sudah Hadir', 'Belum Hadir'],
      datasets: [{
        data: [present, waiting],
        backgroundColor: [getCSSVariable('--success'), getCSSVariable('--warning')],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom',
          labels: {
            padding: 20
          }
        }
      }
    }
  });
}

function updateRegistrationChart() {
  // Hitung pendaftaran per hari
  const registrationData = {};
  participantsData.forEach(p => {
    const date = 'Hari ini'; // Sesuaikan dengan data sebenarnya
    
    if (!registrationData[date]) {
      registrationData[date] = 0;
    }
    registrationData[date]++;
  });
  
  chartManager.create('registrationChart', {
    type: 'line',
    data: {
      labels: Object.keys(registrationData),
      datasets: [{
        label: 'Pendaftaran',
        data: Object.values(registrationData),
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: getCSSVariable('--info'),
        borderWidth: 2,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

function updateLocationChart() {
  // Hitung distribusi domisili
  const locationData = {};
  participantsData.forEach(p => {
    const location = p.domisili || 'Tidak diketahui';
    if (!locationData[location]) {
      locationData[location] = 0;
    }
    locationData[location]++;
  });
  
  // Ambil 5 lokasi terbanyak
  const sortedLocations = Object.entries(locationData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  chartManager.create('locationChart', {
    type: 'bar',
    data: {
      labels: sortedLocations.map(item => item[0]),
      datasets: [{
        label: 'Jumlah Jamaah',
        data: sortedLocations.map(item => item[1]),
        backgroundColor: [
          'rgba(16, 163, 127, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(236, 72, 153, 0.7)'
        ],
        borderColor: [
          getCSSVariable('--accent-green'),
          getCSSVariable('--info'),
          getCSSVariable('--warning'),
          '#8b5cf6',
          '#ec4899'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

function updateGenderChart() {
  // Hitung distribusi gender
  const genderData = {
    'Laki-laki': 0,
    'Perempuan': 0,
    'Tidak diketahui': 0
  };
  
  participantsData.forEach(p => {
    const gender = p.gender || 'Tidak diketahui';
    if (genderData[gender] !== undefined) {
      genderData[gender]++;
    } else {
      genderData['Tidak diketahui']++;
    }
  });
  
  chartManager.create('genderChart', {
    type: 'pie',
    data: {
      labels: Object.keys(genderData),
      datasets: [{
        data: Object.values(genderData),
        backgroundColor: [getCSSVariable('--info'), '#ec4899', getCSSVariable('--text-muted')],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom',
          labels: {
            padding: 20
          }
        }
      }
    }
  });
}

function updateAnalyticsSummary() {
  // Hitung rata-rata usia
  const ages = participantsData
    .filter(p => p.usia && !isNaN(p.usia))
    .map(p => parseInt(p.usia));
  
  const avgAge = ages.length > 0 ? 
    Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;
  
  if (DOM.avgAge) {
    DOM.avgAge.textContent = avgAge + ' tahun';
  }
  
  // Hitung domisili terbanyak
  const locationCounts = {};
  participantsData.forEach(p => {
    const location = p.domisili || 'Tidak diketahui';
    locationCounts[location] = (locationCounts[location] || 0) + 1;
  });
  
  const topLocation = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (DOM.topLocation) {
    DOM.topLocation.textContent = topLocation ? 
      `${topLocation[0]} (${topLocation[1]} orang)` : '-';
  }
  
  // Check-in terakhir
  const checkins = participantsData
    .filter(p => p.status === CONSTANTS.STATUS.PRESENT && p.checkin_time !== '-')
    .map(p => new Date(p.checkin_time))
    .filter(date => !isNaN(date.getTime()));
  
  const lastCheckin = checkins.length > 0 ? 
    new Date(Math.max(...checkins)).toLocaleString('id-ID') : '-';
  
  if (DOM.lastCheckin) {
    DOM.lastCheckin.textContent = lastCheckin;
  }
  
  // Pendaftar hari ini
  const today = new Date().toLocaleDateString('id-ID');
  const todayReg = participantsData.filter(p => {
    // Untuk saat ini, kita hitung semua sebagai hari ini
    return true;
  }).length;
  
  if (DOM.todayReg) {
    DOM.todayReg.textContent = todayReg + ' orang';
  }
}

// ============================================
// FUNGSI LAINNYA
// ============================================

function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      
      // Cek apakah user memiliki permission untuk tab ini
      if (!currentUser || !currentUser.permissions || !currentUser.permissions.includes(tabId)) {
        showNotification('Anda tidak memiliki akses ke fitur ini', CONSTANTS.NOTIFICATION_TYPES.ERROR);
        playSound('error');
        return;
      }
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show corresponding content
      contents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId + 'Tab') {
          content.classList.add('active');
        }
      });
      
      // Handle scanner tab
      if (tabId === CONSTANTS.PERMISSIONS.SCANNER) {
        if (!scannerActive) {
          startScanner();
        }
      } else if (scannerActive) {
        stopScanner();
      }
    });
  });
}

function startAutoRefresh(interval = CONSTANTS.INTERVALS.AUTO_REFRESH) {
  // Clear existing interval jika ada
  if (window.autoRefreshInterval) {
    clearInterval(window.autoRefreshInterval);
  }
  
  // Auto refresh setiap interval
  window.autoRefreshInterval = setInterval(async () => {
    if (currentUser) {
      console.log('Auto-refreshing data...');
      await loadDashboardData();
    }
  }, interval);
  
  console.log(`Auto refresh diatur setiap ${interval/1000} detik`);
}

// Manual checkin function
async function manualCheckin(participantId) {
  const participant = participantsData.find(p => p.id === participantId);
  if (participant) {
    if (confirm(`Check-in ${participant.nama}?`)) {
      showLoading('Memproses check-in...');
      
      try {
        const result = await safeFetch(`${API_URL}?action=checkin&id=${encodeURIComponent(participantId)}&_t=${new Date().getTime()}`);
        
        if (result.success) {
          // Update status
          participant.status = CONSTANTS.STATUS.PRESENT;
          participant.checkin_time = new Date().toLocaleString('id-ID');
          
          // Update UI
          updateStats();
          if (currentUser && currentUser.permissions && currentUser.permissions.includes(CONSTANTS.PERMISSIONS.PARTICIPANTS)) {
            updateParticipantsTable();
          }
          if (currentUser && currentUser.permissions && currentUser.permissions.includes(CONSTANTS.PERMISSIONS.ANALYTICS)) {
            updateCharts();
          }
          
          showNotification(`Check-in berhasil untuk ${participant.nama}`, CONSTANTS.NOTIFICATION_TYPES.SUCCESS);
          playSound('success');
        } else {
          playSound('error');
          showNotification('Gagal melakukan check-in: ' + result.error, CONSTANTS.NOTIFICATION_TYPES.ERROR);
        }
      } catch (error) {
        playSound('error');
        showNotification('Gagal menghubungi server', CONSTANTS.NOTIFICATION_TYPES.ERROR);
      } finally {
        hideLoading();
      }
    }
  }
}

// View participant details (hanya untuk admin)
function viewParticipant(participantId) {
  if (!currentUser || currentUser.role !== CONSTANTS.ROLES.ADMIN) {
    showNotification('Anda tidak memiliki akses untuk melihat detail ini', CONSTANTS.NOTIFICATION_TYPES.ERROR);
    playSound('error');
    return;
  }
  
  const participant = participantsData.find(p => p.id === participantId);
  if (participant) {
    alert(`Detail Jamaah:\n\nID: ${participant.id}\nNama: ${participant.nama}\nTelepon: ${participant.phone}\nEmail: ${participant.email || '-'}\nDomisili: ${participant.domisili}\nTotal: ${participant.total} orang\nUsia: ${participant.usia || '-'}\nGender: ${participant.gender || '-'}\nStatus: ${participant.status}\nCheck-in: ${participant.checkin_time || 'Belum'}\nTanggal Daftar: ${participant.registration_date || '-'}`);
  }
}

// Export function (hanya untuk admin)
function exportData() {
  if (!currentUser || currentUser.role !== CONSTANTS.ROLES.ADMIN) {
    showNotification('Hanya administrator yang dapat mengekspor data', CONSTANTS.NOTIFICATION_TYPES.ERROR);
    playSound('error');
    return;
  }
  
  // Create CSV data
  const headers = ['ID', 'Nama', 'Telepon', 'Email', 'Domisili', 'Total', 'Status', 'Waktu Check-in', 'Usia', 'Gender', 'Tanggal Daftar'];
  const csvData = [
    headers.join(','),
    ...participantsData.map(p => [
      p.id,
      `"${p.nama}"`,
      p.phone,
      p.email || '',
      `"${p.domisili}"`,
      p.total,
      p.status,
      p.checkin_time || '-',
      p.usia || '-',
      p.gender || '-',
      p.registration_date || '-'
    ].join(','))
  ].join('\n');
  
  // Create download link
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `data-jamaah-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification('Data berhasil diexport', CONSTANTS.NOTIFICATION_TYPES.SUCCESS);
  playSound('success');
}

// Settings functions (hanya untuk admin)
function savePassword() {
  if (!currentUser || currentUser.role !== CONSTANTS.ROLES.ADMIN) {
    showNotification('Hanya administrator yang dapat mengubah password', CONSTANTS.NOTIFICATION_TYPES.ERROR);
    playSound('error');
    return;
  }
  
  const newPassword = document.getElementById('newPassword') ? document.getElementById('newPassword').value : '';
  if (newPassword) {
    // Simpan password (dalam implementasi nyata, ini akan dikirim ke server)
    showNotification('Password berhasil diperbarui', CONSTANTS.NOTIFICATION_TYPES.SUCCESS);
    playSound('success');
    if (document.getElementById('newPassword')) {
      document.getElementById('newPassword').value = '';
    }
  } else {
    showNotification('Harap masukkan password baru', CONSTANTS.NOTIFICATION_TYPES.WARNING);
    playSound('warning');
  }
}

function saveEmail() {
  if (!currentUser || currentUser.role !== CONSTANTS.ROLES.ADMIN) {
    showNotification('Hanya administrator yang dapat mengubah pengaturan email', CONSTANTS.NOTIFICATION_TYPES.ERROR);
    playSound('error');
    return;
  }
  
  const email = document.getElementById('notificationEmail') ? document.getElementById('notificationEmail').value : '';
  if (email && email.includes('@')) {
    // Simpan email (dalam implementasi nyata, ini akan dikirim ke server)
    showNotification('Email notifikasi berhasil diperbarui', CONSTANTS.NOTIFICATION_TYPES.SUCCESS);
    playSound('success');
  } else {
    showNotification('Harap masukkan email yang valid', CONSTANTS.NOTIFICATION_TYPES.WARNING);
    playSound('warning');
  }
}

function backupData() {
  // Backup data ke Excel
  exportData();
}

function cleanupResources() {
  chartManager.destroyAll();
  
  if (scannerActive) {
    stopScanner();
  }
  
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
  }
  
  // Clear intervals
  if (window.autoRefreshInterval) {
    clearInterval(window.autoRefreshInterval);
  }
}

// ============================================
// INISIALISASI
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🟢 ============================================');
  console.log('🟢 ADMIN DASHBOARD SYSTEM INITIALIZED');
  console.log('🟢 ============================================');
  console.log('📅 Date:', new Date().toLocaleDateString());
  console.log('⏰ Time:', new Date().toLocaleTimeString());
  console.log('🌐 API URL:', API_URL);
  
  // Session check
  const session = SessionManager.validateSession();
  console.log('💾 Session Storage Check:', session ? 'User found' : 'No user found');
  
  if (session) {
    try {
      currentUser = session.user;
      authToken = session.token;
      console.log('✅ AUTO-LOGIN SUCCESS');
      console.log('   👤 Username:', currentUser.username);
      console.log('   🎯 Role:', currentUser.role);
      console.log('   📋 Permissions:', currentUser.permissions);
      
      showDashboard();
      
    } catch (e) {
      console.error('❌ AUTO-LOGIN FAILED');
      console.error('   Error:', e.message);
      SessionManager.clearSession();
      showLogin();
    }
  } else {
    console.log('👋 Showing login form (no valid session)');
    showLogin();
  }
  
  // Setup event listeners untuk login
  if (DOM.loginForm) {
    DOM.loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleLogin(e);
    });
  }
  
  // Enter key untuk submit
  if (DOM.passwordInput) {
    DOM.passwordInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        handleLogin(e);
      }
    });
  }
  
  // Setup event delegation untuk table buttons
  document.addEventListener('click', function(e) {
    // Check-in button
    if (e.target.closest('.btn-checkin')) {
      const btn = e.target.closest('.btn-checkin');
      const participantId = btn.getAttribute('data-id');
      if (participantId) {
        manualCheckin(participantId);
      }
    }
    
    // View button
    if (e.target.closest('.btn-view')) {
      const btn = e.target.closest('.btn-view');
      const participantId = btn.getAttribute('data-id');
      if (participantId) {
        viewParticipant(participantId);
      }
    }
  });
  
  // Browser info
  console.log('🌍 Browser:', navigator.userAgent);
  console.log('📱 Screen:', window.screen.width + 'x' + window.screen.height);
  console.log('🔋 Online:', navigator.onLine);
});
