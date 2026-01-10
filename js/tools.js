/* jshint browser: true, esversion: 6, devel: true */
/* global Chart, jsQR, sessionStorage, fetch, alert, prompt, confirm, URL, Blob */
/* eslint-disable */

// ============================================
// KONFIGURASI SISTEM
// ============================================

// CORS Proxy untuk development
const USE_CORS_PROXY = true; // Set ke false jika tidak pakai proxy
const CORS_PROXY = 'https://corsproxy.io/?';
// Alternatif proxies:
// - https://api.allorigins.win/raw?url=
// - https://cors-anywhere.herokuapp.com/
// - https://thingproxy.freeboard.io/fetch/

// URL Google Apps Script
const GAS_URL = "https://script.google.com/macros/s/AKfycbwmZI49Ib5U49RbybUFGS6uKln03vjMxI2vWYY6e5xrWZwMia_8eULpH2sfqaBuy5RF/exec";
const API_URL = USE_CORS_PROXY ? CORS_PROXY + encodeURIComponent(GAS_URL) : GAS_URL;

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
// KONSTANTA SISTEM
// ============================================

const CONSTANTS = {
  ROLES: {
    ADMIN: 'Administrator',
    PANITIA: 'Panitia'
  },
  
  PERMISSIONS: {
    SCANNER: 'scanner',
    PARTICIPANTS: 'participants',
    ANALYTICS: 'analytics',
    SETTINGS: 'settings'
  },
  
  STATUS: {
    PRESENT: 'Hadir',
    WAITING: 'Menunggu'
  },
  
  NOTIFICATION_TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  },
  
  INTERVALS: {
    AUTO_REFRESH: 120000,
    SESSION_CHECK: 60000,
    SCAN_TIMEOUT: 15000
  }
};

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
      
      if (Date.now() > parsed.expiry) {
        this.clearSession();
        return null;
      }
      
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

// ============================================
// FUNGSI UTILITAS
// ============================================

function showLogin() {
  console.log('🔐 Menampilkan form login');
  
  if (DOM.loginContainer) {
    DOM.loginContainer.style.display = 'block';
  }
  if (DOM.dashboardContainer) {
    DOM.dashboardContainer.style.display = 'none';
  }
  
  if (DOM.loginForm) {
    DOM.loginForm.reset();
  }
  if (DOM.loginError) {
    DOM.loginError.style.display = 'none';
  }
  
  if (scannerActive) {
    stopScanner();
  }
  
  cleanupResources();
}

function updateLastUpdateTime() {
  if (DOM.updateTime) {
    DOM.updateTime.textContent = formatTime(new Date());
  }
}

function updateServerTime() {
  if (DOM.serverTime) {
    DOM.serverTime.textContent = formatTime(new Date());
  }
}

function showLoading(text = 'Memuat data...') {
  if (DOM.loadingText && DOM.loadingOverlay) {
    DOM.loadingText.textContent = text;
    DOM.loadingOverlay.style.display = 'flex';
  }
}

function hideLoading() {
  if (DOM.loadingOverlay) {
    DOM.loadingOverlay.style.display = 'none';
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
// FUNGSI LOGIN (DENGAN CORS HANDLING)
// ============================================

async function handleLogin(e) {
  if (e) e.preventDefault();
  
  const username = DOM.usernameInput ? DOM.usernameInput.value : '';
  const password = DOM.passwordInput ? DOM.passwordInput.value : '';
  
  if (!username || !password) {
    showNotification('Harap isi username dan password', CONSTANTS.NOTIFICATION_TYPES.WARNING);
    return;
  }
  
  showLoading('Memproses login...');
  
  try {
    // Simulasi login karena CORS issue
    // Untuk testing, gunakan user hardcoded
    
    // Cek kredensial hardcoded
    const validUsers = {
      'admin': { 
        password: 'musazain', 
        role: 'Administrator',
        permissions: ['scanner', 'participants', 'analytics', 'settings']
      },
      'panitia': { 
        password: 'panitiamco', 
        role: 'Panitia',
        permissions: ['scanner']
      }
    };
    
    if (validUsers[username] && validUsers[username].password === password) {
      // Simulasi token dan user data
      const token = 'fake_token_' + Date.now();
      const userData = {
        username: username,
        role: validUsers[username].role,
        permissions: validUsers[username].permissions
      };
      
      // Simpan session
      SessionManager.saveSession(token, userData);
      currentUser = userData;
      authToken = token;
      
      showNotification('Login berhasil!', CONSTANTS.NOTIFICATION_TYPES.SUCCESS);
      
      // Tunggu sebentar sebelum show dashboard
      setTimeout(() => {
        showDashboard();
      }, 500);
    } else {
      throw new Error('Username atau password salah');
    }
  } catch (error) {
    console.error('Login error:', error);
    showNotification(`Login gagal: ${error.message}`, CONSTANTS.NOTIFICATION_TYPES.ERROR);
    
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
}

function updateUIForRole() {
  if (DOM.userRole && currentUser) {
    DOM.userRole.textContent = currentUser.role;
  }
}

function setupDashboardListeners() {
  // Logout button
  if (DOM.logoutBtn) {
    DOM.logoutBtn.addEventListener('click', function() {
      if (confirm('Apakah Anda yakin ingin logout?')) {
        if (scannerActive) {
          stopScanner();
        }
        
        SessionManager.clearSession();
        currentUser = null;
        authToken = null;
        
        cleanupResources();
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
    });
  }
}

// ============================================
// FUNGSI DATA PESERTA (DENGAN MOCK DATA)
// ============================================

async function loadDashboardData() {
  try {
    // Load participants data dengan mock data karena CORS
    participantsData = generateMockParticipants(50);
    
    // Update stats
    updateStats();
    
    // Update table
    updateParticipantsTable();
    
    // Update charts jika user memiliki permission
    if (currentUser && currentUser.permissions.includes(CONSTANTS.PERMISSIONS.ANALYTICS)) {
      updateCharts();
    }
    
    // Update last update time
    updateLastUpdateTime();
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showNotification('Gagal memuat data', CONSTANTS.NOTIFICATION_TYPES.ERROR);
  }
}

function generateMockParticipants(count) {
  const mockParticipants = [];
  const names = ['Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hadi', 'Indra', 'Joko'];
  const locations = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Malang', 'Bali', 'Lombok', 'Medan', 'Palembang'];
  
  for (let i = 1; i <= count; i++) {
    const isPresent = Math.random() > 0.4;
    const nameIndex = Math.floor(Math.random() * names.length);
    const locationIndex = Math.floor(Math.random() * locations.length);
    
    mockParticipants.push({
      id: 'ID' + String(i).padStart(3, '0'),
      nama: names[nameIndex] + ' ' + ['Santoso', 'Wijaya', 'Kusuma', 'Setiawan', 'Prasetyo'][nameIndex % 5],
      phone: '08' + Math.floor(Math.random() * 1000000000).toString().padStart(10, '0'),
      email: `jamaah${i}@gmail.com`,
      domisili: locations[locationIndex],
      total: Math.floor(Math.random() * 5) + 1,
      status: isPresent ? CONSTANTS.STATUS.PRESENT : CONSTANTS.STATUS.WAITING,
      checkin_time: isPresent ? new Date(Date.now() - Math.random() * 86400000).toLocaleString('id-ID') : '-',
      usia: Math.floor(Math.random() * 40) + 20,
      gender: Math.random() > 0.5 ? 'Laki-laki' : 'Perempuan',
      registration_date: new Date(Date.now() - Math.random() * 86400000 * 7).toLocaleDateString('id-ID')
    });
  }
  
  return mockParticipants;
}

function updateStats() {
  const stats = {
    totalRegistered: participantsData.length,
    totalPresent: participantsData.filter(p => p.status === CONSTANTS.STATUS.PRESENT).length,
    totalWaiting: participantsData.length - participantsData.filter(p => p.status === CONSTANTS.STATUS.PRESENT).length,
    totalPeople: participantsData.reduce((sum, p) => sum + (parseInt(p.total) || 1), 0)
  };
  
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
  
  const filteredData = participantsData.filter(p =>
    p.nama.toLowerCase().includes(searchTerm) ||
    p.id.toLowerCase().includes(searchTerm) ||
    p.domisili.toLowerCase().includes(searchTerm)
  );
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = filteredData.slice(startIndex, endIndex);
  
  DOM.participantsTableBody.innerHTML = '';
  
  pageData.forEach(participant => {
    const row = document.createElement('tr');
    
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
  
  if (DOM.pageInfo) {
    DOM.pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages}`;
  }
  if (DOM.tableTotal) {
    DOM.tableTotal.textContent = filteredData.length;
  }
  
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
  
  if (DOM.confirmCheckinBtn) {
    DOM.confirmCheckinBtn.addEventListener('click', confirmCheckin);
  }
  if (DOM.cancelCheckinBtn) {
    DOM.cancelCheckinBtn.addEventListener('click', cancelCheckin);
  }
  
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && scannerActive) {
      stopScanner();
    }
  });
}

async function startScanner() {
  if (scannerActive) return;
  
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser tidak mendukung akses kamera');
    }
    
    videoStream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });
    
    if (DOM.video) {
      DOM.video.srcObject = videoStream;
      
      await new Promise((resolve, reject) => {
        DOM.video.onloadedmetadata = resolve;
        DOM.video.onerror = reject;
        setTimeout(() => reject(new Error('Timeout loading video')), 5000);
      });
      
      DOM.video.play();
    }
    
    scannerActive = true;
    if (DOM.startScannerBtn) DOM.startScannerBtn.disabled = true;
    if (DOM.stopScannerBtn) DOM.stopScannerBtn.disabled = false;
    
    simulateQRScanning(); // Simulasi scanning untuk demo
    showNotification('Scanner aktif', CONSTANTS.NOTIFICATION_TYPES.INFO);
    
  } catch (error) {
    console.error('Camera error:', error);
    let errorMessage = 'Tidak dapat mengakses kamera';
    
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Akses kamera ditolak. Harap berikan izin kamera.';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'Tidak ada kamera yang ditemukan.';
    }
    
    showNotification(errorMessage, CONSTANTS.NOTIFICATION_TYPES.ERROR);
    
    setTimeout(() => {
      if (confirm('Gagal mengakses kamera. Ingin melakukan check-in manual?')) {
        showManualCheckin();
      }
    }, 1500);
  }
}

function stopScanner() {
  if (!scannerActive) return;
  
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
  }
  
  scannerActive = false;
  if (DOM.startScannerBtn) DOM.startScannerBtn.disabled = false;
  if (DOM.stopScannerBtn) DOM.stopScannerBtn.disabled = true;
  
  if (DOM.scanResult) {
    DOM.scanResult.classList.remove('active');
  }
  
  showNotification('Scanner dihentikan', CONSTANTS.NOTIFICATION_TYPES.INFO);
}

// Simulasi scanning untuk demo
function simulateQRScanning() {
  if (!scannerActive) return;
  
  // Untuk demo, setelah 3 detik akan otomatis "scan" random participant
  setTimeout(() => {
    if (scannerActive && participantsData.length > 0) {
      stopScanner();
      
      // Pilih random participant yang belum check-in
      const waitingParticipants = participantsData.filter(p => p.status === CONSTANTS.STATUS.WAITING);
      if (waitingParticipants.length > 0) {
        const randomParticipant = waitingParticipants[Math.floor(Math.random() * waitingParticipants.length)];
        currentScannerData = randomParticipant;
        showScanResult(randomParticipant);
      } else {
        showNotification('Semua jamaah sudah check-in!', CONSTANTS.NOTIFICATION_TYPES.SUCCESS);
        setTimeout(() => startScanner(), 2000);
      }
    }
  }, 3000);
}

function showScanResult(participant) {
  if (!DOM.scanResultContent || !DOM.scanResult) return;
  
  const isPresent = participant.status === CONSTANTS.STATUS.PRESENT;
  
  let participantInfo = `
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
  
  if (currentUser && currentUser.role === CONSTANTS.ROLES.ADMIN) {
    participantInfo += `
      <div class="info-row">
        <strong>Telepon:</strong> ${participant.phone}
      </div>
      <div class="info-row">
        <strong>Domisili:</strong> ${participant.domisili}
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
  
  setTimeout(() => {
    if (DOM.scanResult.classList.contains('active')) {
      cancelCheckin();
      const scannerTab = document.getElementById('scannerTab');
      if (scannerTab && scannerTab.classList.contains('active')) {
        setTimeout(() => startScanner(), 1000);
      }
    }
  }, CONSTANTS.INTERVALS.SCAN_TIMEOUT);
}

async function confirmCheckin() {
  if (!currentScannerData) return;
  
  showLoading('Memproses check-in...');
  
  // Simulasi delay untuk proses check-in
  setTimeout(() => {
    // Update status di local data
    const index = participantsData.findIndex(p => p.id === currentScannerData.id);
    if (index !== -1) {
      participantsData[index].status = CONSTANTS.STATUS.PRESENT;
      participantsData[index].checkin_time = new Date().toLocaleString('id-ID');
    }
    
    // Update UI
    updateStats();
    updateParticipantsTable();
    updateCharts();
    
    showNotification(`Check-in berhasil untuk ${currentScannerData.nama}`, CONSTANTS.NOTIFICATION_TYPES.SUCCESS);
    
    // Reset scanner
    cancelCheckin();
    
    // Auto restart scanner setelah 2 detik
    setTimeout(() => {
      const scannerTab = document.getElementById('scannerTab');
      if (scannerTab && scannerTab.classList.contains('active')) {
        startScanner();
      }
    }, 2000);
    
    hideLoading();
  }, 1000);
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
    const participant = participantsData.find(p => p.id === regId);
    if (participant) {
      currentScannerData = participant;
      showScanResult(participant);
    } else {
      alert('ID Registrasi tidak ditemukan');
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
        backgroundColor: ['#10a37f', '#f59e0b'],
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
  // Data contoh untuk 7 hari terakhir
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const registrations = days.map(() => Math.floor(Math.random() * 20) + 5);
  
  chartManager.create('registrationChart', {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Pendaftaran',
        data: registrations,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
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
            stepSize: 5
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
    const location = p.domisili;
    locationData[location] = (locationData[location] || 0) + 1;
  });
  
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
          '#10a37f',
          '#3b82f6',
          '#f59e0b',
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
  const male = participantsData.filter(p => p.gender === 'Laki-laki').length;
  const female = participantsData.filter(p => p.gender === 'Perempuan').length;
  const unknown = participantsData.length - male - female;
  
  chartManager.create('genderChart', {
    type: 'pie',
    data: {
      labels: ['Laki-laki', 'Perempuan', 'Tidak diketahui'],
      datasets: [{
        data: [male, female, unknown],
        backgroundColor: ['#3b82f6', '#ec4899', '#6b7280'],
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
  const ages = participantsData
    .filter(p => p.usia && !isNaN(p.usia))
    .map(p => parseInt(p.usia));
  
  const avgAge = ages.length > 0 ? 
    Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;
  
  if (DOM.avgAge) {
    DOM.avgAge.textContent = avgAge + ' tahun';
  }
  
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
  
  const checkins = participantsData
    .filter(p => p.status === CONSTANTS.STATUS.PRESENT && p.checkin_time !== '-')
    .map(p => new Date());
  
  const lastCheckin = checkins.length > 0 ? 
    new Date().toLocaleString('id-ID') : '-';
  
  if (DOM.lastCheckin) {
    DOM.lastCheckin.textContent = lastCheckin;
  }
  
  const todayReg = Math.floor(participantsData.length * 0.3);
  
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
      
      if (!currentUser || !currentUser.permissions || !currentUser.permissions.includes(tabId)) {
        showNotification('Anda tidak memiliki akses ke fitur ini', CONSTANTS.NOTIFICATION_TYPES.ERROR);
        return;
      }
      
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      contents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId + 'Tab') {
          content.classList.add('active');
        }
      });
      
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
  if (window.autoRefreshInterval) {
    clearInterval(window.autoRefreshInterval);
  }
  
  window.autoRefreshInterval = setInterval(async () => {
    if (currentUser) {
      console.log('Auto-refreshing data...');
      await loadDashboardData();
    }
  }, interval);
}

// Manual checkin function
async function manualCheckin(participantId) {
  const participant = participantsData.find(p => p.id === participantId);
  if (participant) {
    if (confirm(`Check-in ${participant.nama}?`)) {
      showLoading('Memproses check-in...');
      
      setTimeout(() => {
        participant.status = CONSTANTS.STATUS.PRESENT;
        participant.checkin_time = new Date().toLocaleString('id-ID');
        
        updateStats();
        updateParticipantsTable();
        updateCharts();
        
        showNotification(`Check-in berhasil untuk ${participant.nama}`, CONSTANTS.NOTIFICATION_TYPES.SUCCESS);
        hideLoading();
      }, 1000);
    }
  }
}

function viewParticipant(participantId) {
  if (!currentUser || currentUser.role !== CONSTANTS.ROLES.ADMIN) {
    showNotification('Anda tidak memiliki akses untuk melihat detail ini', CONSTANTS.NOTIFICATION_TYPES.ERROR);
    return;
  }
  
  const participant = participantsData.find(p => p.id === participantId);
  if (participant) {
    alert(`Detail Jamaah:\n\nID: ${participant.id}\nNama: ${participant.nama}\nTelepon: ${participant.phone}\nEmail: ${participant.email || '-'}\nDomisili: ${participant.domisili}\nTotal: ${participant.total} orang\nUsia: ${participant.usia || '-'}\nGender: ${participant.gender || '-'}\nStatus: ${participant.status}\nCheck-in: ${participant.checkin_time || 'Belum'}\nTanggal Daftar: ${participant.registration_date || '-'}`);
  }
}

function exportData() {
  if (!currentUser || currentUser.role !== CONSTANTS.ROLES.ADMIN) {
    showNotification('Hanya administrator yang dapat mengekspor data', CONSTANTS.NOTIFICATION_TYPES.ERROR);
    return;
  }
  
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
}

function cleanupResources() {
  chartManager.destroyAll();
  
  if (scannerActive) {
    stopScanner();
  }
  
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
    if (e.target.closest('.btn-checkin')) {
      const btn = e.target.closest('.btn-checkin');
      const participantId = btn.getAttribute('data-id');
      if (participantId) {
        manualCheckin(participantId);
      }
    }
    
    if (e.target.closest('.btn-view')) {
      const btn = e.target.closest('.btn-view');
      const participantId = btn.getAttribute('data-id');
      if (participantId) {
        viewParticipant(participantId);
      }
    }
  });
  
  console.log('🌍 Browser:', navigator.userAgent);
  console.log('📱 Screen:', window.screen.width + 'x' + window.screen.height);
  console.log('🔋 Online:', navigator.onLine);
});
