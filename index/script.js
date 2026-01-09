// ============================================
// KONFIGURASI SISTEM - SATU SUMBER KEBENARAN
// ============================================
const CONFIG = Object.freeze({
  // ⚠️ URL HARUS SAMA PERSIS dengan di success.html
  API_URL: "https://script.google.com/macros/s/AKfycbyUFVopjCXkd-STiV6svcPE_8VPBtDfK3OGMVpY1NdPPtRUDMNrDQng6HT9srivnfi2/exec",
  MAX_OTP_ATTEMPTS: 3,
  OTP_TIMEOUT: 60000,
  RETRY_ATTEMPTS: 2,
  ENABLE_OFFLINE: false,
  SUPPORTED_LANGUAGES: ['id', 'en', 'ja']
});

// ============================================
// VARIABEL STATE GLOBAL
// ============================================
let lang = 'id';
let isSubmitting = false;
let duplicateCheckTimeout = null;

// Deteksi bahasa pengguna
const userLang = navigator.language || navigator.userLanguage;
if (userLang.startsWith('ja')) lang = 'ja';
else if (userLang.startsWith('en')) lang = 'en';

// ============================================
// TRANSLATIONS
// ============================================

const translations = {
  id: {
    // Messages
    fillNameEmail: 'Mohon isi nama dan email terlebih dahulu',
    invalidEmail: 'Format email tidak valid',
    invalidPhone: 'Nomor telepon tidak valid. Gunakan format Jepang (080/090/070) atau Indonesia (08)',
    processing: 'Memproses...',
    success: 'Pendaftaran berhasil!',
    networkError: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
    serverError: 'Terjadi kesalahan pada server. Silakan coba lagi.',
    selectNationality: 'Mohon pilih kebangsaan',
    fillOtherNationality: 'Mohon isi kebangsaan Anda',
    consentRequired: 'Harap setujui persetujuan data',
    duplicateData: 'Data ini sudah terdaftar',
    registrationComplete: 'Pendaftaran berhasil! Silakan cek email untuk konfirmasi.',
    submitting: 'Mengirim data...',
    
    // UI Text
    duplicateAlert: 'Data ini sudah terdaftar',
    infoMessage: 'Setelah submit, Anda akan diarahkan ke halaman konfirmasi',
    mainTitle: 'Registrasi Buka Puasa Bersama 1447 H',
    centerName: 'Masjid Central Okayama',
    subtitle: 'Silakan lengkapi formulir registrasi di bawah ini dengan data yang valid',
    eventPurpose: 'Formulir ini digunakan untuk pendataan jamaah agar pelaksanaan buka puasa bersama berjalan tertib, nyaman, dan penuh keberkahan',
    
    // Form labels
    namaLengkap: 'Nama Lengkap',
    namaPlaceholder: 'Nama sesuai identitas',
    email: 'Alamat Email',
    emailPlaceholder: 'contoh@email.com',
    hintEmail: 'Konfirmasi akan dikirim ke email ini',
    noHp: 'Nomor Telepon',
    noHpPlaceholder: '081234567890',
    hintNoHp: 'Gunakan nomor aktif yang dapat dihubungi',
    domisili: 'Domisili',
    domisiliPlaceholder: 'Cari nama kelurahan/kecamatan',
    kebangsaan: 'Kebangsaan',
    kebangsaanLainnya: 'Kebangsaan Lainnya',
    kebangsaanPlaceholder: 'Masukkan kebangsaan Anda',
    selectKebangsaan: 'Pilih kebangsaan',
    indonesia: 'Indonesia',
    jepang: 'Jepang',
    lainnya: 'Lainnya',
    usia: 'Usia',
    usiaPlaceholder: 'Usia saat ini',
    jenisKelamin: 'Jenis Kelamin',
    lakiLaki: 'Laki-laki',
    perempuan: 'Perempuan',
    sectionDataJamaah: 'Data Jamaah',
    sectionKehadiran: 'Informasi Kehadiran',
    dewasaTambahan: 'Dewasa Tambahan',
    dewasaPlaceholder: 'Jumlah dewasa selain Anda',
    hintDewasa: 'Usia 13 tahun ke atas',
    datangDenganAnak: 'Datang dengan Anak?',
    tidak: 'Tidak',
    ya: 'Ya',
    hintAnak: 'Anak usia 0-12 tahun',
    jumlahAnak: 'Jumlah Anak',
    hintUsiaAnak: 'Usia maksimal 12 tahun',
    sectionPersetujuan: 'Persetujuan',
    consentText: '<strong>Data jamaah</strong> digunakan semata-mata untuk keperluan pendataan dan kelancaran pelaksanaan acara buka puasa bersama. Kami menjamin kerahasiaan data Anda.',
    submit: 'Daftar Sekarang',
    
    // Footer
    prayerMessage: 'Semoga Allah menerima amal ibadah kita di bulan Ramadan yang mulia ini',
    footerCopyright: '© 2026 — Masjid Central Okayama',
    contactText: 'Untuk informasi lebih lanjut:',
    totalLabel: 'Total yang akan hadir',
    progressText: 'Mengirim data...'
  },
  
  en: {
    // Messages
    fillNameEmail: 'Please fill in name and email first',
    invalidEmail: 'Invalid email format',
    invalidPhone: 'Invalid phone number. Use Japanese format (080/090/070) or Indonesian format (08)',
    processing: 'Processing...',
    success: 'Registration successful!',
    networkError: 'Network error. Please try again.',
    serverError: 'Server error. Please try again.',
    selectNationality: 'Please select nationality',
    fillOtherNationality: 'Please enter your nationality',
    consentRequired: 'Please agree to the data consent',
    duplicateData: 'This data is already registered',
    registrationComplete: 'Registration successful! Please check your email for confirmation.',
    submitting: 'Submitting data...',
    
    // UI Text
    duplicateAlert: 'This data is already registered',
    infoMessage: 'After submission, you will be redirected to the confirmation page',
    mainTitle: 'Ramadan Iftar Registration 1447 AH',
    centerName: 'Okayama Central Mosque',
    subtitle: 'Please complete the registration form below with valid data',
    eventPurpose: 'This form is used to register congregation members so that the iftar gathering runs orderly, comfortably, and full of blessings',
    
    // Form labels
    namaLengkap: 'Full Name',
    namaPlaceholder: 'Name as shown on ID',
    email: 'Email Address',
    emailPlaceholder: 'example@email.com',
    hintEmail: 'Confirmation will be sent to this email',
    noHp: 'Phone Number',
    noHpPlaceholder: '081234567890',
    hintNoHp: 'Use an active contact number',
    domisili: 'Residence',
    domisiliPlaceholder: 'Search for neighborhood/district',
    kebangsaan: 'Nationality',
    kebangsaanLainnya: 'Other Nationality',
    kebangsaanPlaceholder: 'Enter your nationality',
    selectKebangsaan: 'Select nationality',
    indonesia: 'Indonesia',
    jepang: 'Japan',
    lainnya: 'Other',
    usia: 'Age',
    usiaPlaceholder: 'Current age',
    jenisKelamin: 'Gender',
    lakiLaki: 'Male',
    perempuan: 'Female',
    sectionDataJamaah: 'Congregation Data',
    sectionKehadiran: 'Attendance Information',
    dewasaTambahan: 'Additional Adults',
    dewasaPlaceholder: 'Number of adults besides you',
    hintDewasa: 'Age 13 and above',
    datangDenganAnak: 'Coming with Children?',
    tidak: 'No',
    ya: 'Yes',
    hintAnak: 'Children age 0-12 years',
    jumlahAnak: 'Number of Children',
    hintUsiaAnak: 'Maximum age: 12 years',
    sectionPersetujuan: 'Consent',
    consentText: '<strong>Congregation data</strong> is used solely for registration purposes and the smooth implementation of the iftar gathering. We guarantee the confidentiality of your data.',
    submit: 'Register Now',
    
    // Footer
    prayerMessage: 'May Allah accept our worship in this blessed month of Ramadan',
    footerCopyright: '© 2026 — Okayama Central Mosque',
    contactText: 'For more information:',
    totalLabel: 'Total attendees',
    progressText: 'Submitting data...'
  },
  
  ja: {
    // Messages
    fillNameEmail: '先に名前とメールアドレスを入力してください',
    invalidEmail: 'メールアドレスの形式が無効です',
    invalidPhone: '電話番号が無効です。日本の形式（080/090/070）またはインドネシアの形式（08）を使用してください',
    processing: '処理中...',
    success: '登録が完了しました！',
    networkError: '通信エラーが発生しました。もう一度お試しください。',
    serverError: 'サーバーエラーが発生しました。もう一度お試しください。',
    selectNationality: '国籍を選択してください',
    fillOtherNationality: '国籍を入力してください',
    consentRequired: 'データ同意に同意してください',
    duplicateData: 'すでに登録されています',
    registrationComplete: '登録が完了しました！確認メールをご確認ください。',
    submitting: 'データを送信中...',
    
    // UI Text
    duplicateAlert: 'すでに登録されています',
    infoMessage: '送信後、確認ページにリダイレクトされます',
    mainTitle: '1447年 ラマダン・イフタール参加登録',
    centerName: 'オカヤマセントラルモスク',
    subtitle: '有効なデータで以下の登録フォームにご記入ください',
    eventPurpose: 'このフォームは集団イフタールが秩序正しく、快適に、祝福に満ちて行われるよう、礼拝者の登録に使用されます',
    
    // Form labels
    namaLengkap: '氏名',
    namaPlaceholder: '身分証通りの氏名',
    email: 'メールアドレス',
    emailPlaceholder: '例: example@email.com',
    hintEmail: '確認メールがこのアドレスに送信されます',
    noHp: '電話番号',
    noHpPlaceholder: '08012345678',
    hintNoHp: '連絡可能な番号を入力してください',
    domisili: '居住地',
    domisiliPlaceholder: '町名・地区名を検索',
    kebangsaan: '国籍',
    kebangsaanLainnya: 'その他の国籍',
    kebangsaanPlaceholder: '国籍を入力してください',
    selectKebangsaan: '国籍を選択',
    indonesia: 'インドネシア',
    jepang: '日本',
    lainnya: 'その他',
    usia: '年齢',
    usiaPlaceholder: '現在の年齢',
    jenisKelamin: '性別',
    lakiLaki: '男性',
    perempuan: '女性',
    sectionDataJamaah: '礼拝者データ',
    sectionKehadiran: '参加情報',
    dewasaTambahan: '追加の大人',
    dewasaPlaceholder: 'ご本人以外の大人の人数',
    hintDewasa: '13歳以上',
    datangDenganAnak: 'お子様と一緒ですか？',
    tidak: 'いいえ',
    ya: 'はい',
    hintAnak: '0〜12歳のお子様',
    jumlahAnak: 'お子様の人数',
    hintUsiaAnak: '最大12歳まで',
    sectionPersetujuan: '同意',
    consentText: '<strong>礼拝者のデータ</strong>は、登録目的と集団イフタールの円滑な実施のためにのみ使用されます。お客様のデータの機密性を保証します。',
    submit: '今すぐ登録',
    
    // Footer
    prayerMessage: 'アッラーがこの尊いラマダン月における私たちの礼拝をお受け入れくださいますように',
    footerCopyright: '© 2026 — オカヤマセントラルモスク',
    contactText: '詳細については：',
    totalLabel: '総参加者数',
    progressText: 'データを送信中...'
  }
};

// ============================================
// FUNGSI UTILITAS
// ============================================

function getTranslation(key) {
  return translations[lang][key] || key;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhoneNumber(phone) {
  if (!phone) return false;
  
  let cleanPhone = phone.replace(/\D/g, '');
  
  // Format Indonesia: 62... atau 08...
  if (cleanPhone.startsWith('62')) {
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  } else if (cleanPhone.startsWith('08')) {
    return cleanPhone.length >= 10 && cleanPhone.length <= 13;
  } 
  // Format Jepang: 81... (international) atau 080/090/070
  else if (cleanPhone.startsWith('81')) {
    return cleanPhone.length >= 10 && cleanPhone.length <= 13;
  } else if (cleanPhone.startsWith('0') && 
             (cleanPhone.startsWith('080') || 
              cleanPhone.startsWith('090') || 
              cleanPhone.startsWith('070'))) {
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }
  
  return false;
}

function showAlert(type, message) {
  // Sembunyikan semua alert terlebih dahulu
  ['alert', 'success', 'info', 'duplicate'].forEach(t => {
    const el = document.getElementById(`${t}Message`);
    if (el) el.classList.remove('active');
  });
  
  const alertDiv = document.getElementById(`${type}Message`);
  const textSpan = document.getElementById(`${type}MessageText`);
  
  if (alertDiv && textSpan) {
    textSpan.textContent = message;
    alertDiv.classList.add('active');
    
    // Auto hide setelah 5 detik kecuali success
    if (type !== 'success') {
      setTimeout(() => {
        alertDiv.classList.remove('active');
      }, 5000);
    }
  }
}

function calculateTotal() {
  const registrant = 1;
  const additionalAdults = parseInt(document.getElementById('dewasa_tambahan').value) || 0;
  let children = 0;
  
  const denganAnak = document.querySelector('input[name="dengan_anak"]:checked');
  if (denganAnak && denganAnak.value === 'Ya') {
    children = parseInt(document.getElementById('jumlah_anak').value) || 0;
  }
  
  const total = registrant + additionalAdults + children;
  
  document.getElementById('totalAttendees').textContent = total;
  
  let details = '';
  if (lang === 'id') {
    details = `${registrant} pendaftar, ${additionalAdults} dewasa, ${children} anak`;
  } else if (lang === 'en') {
    details = `${registrant} registrant, ${additionalAdults} adults, ${children} children`;
  } else {
    details = `登録者${registrant}名、大人${additionalAdults}名、子供${children}名`;
  }
  
  document.getElementById('totalDetail').textContent = details;
  
  return total;
}

function generateRegistrationId() {
  const prefix = 'IFTAR';
  const date = new Date();
  const dateStr = date.getFullYear().toString().slice(-2) + 
                  (date.getMonth() + 1).toString().padStart(2, '0') + 
                  date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${prefix}-${dateStr}-${random}`;
}

function showDuplicateAlert() {
  document.getElementById('duplicateAlert').classList.add('active');
  document.getElementById('submitBtn').disabled = true;
}

// ============================================
// FUNGSI API DENGAN ERROR HANDLING
// ============================================

async function makeAPICall(action, params = {}, method = 'POST') {
  try {
    const formData = new URLSearchParams();
    for (const key in params) {
      formData.append(key, params[key]);
    }
    
    const response = await fetch(
      `${CONFIG.API_URL}?action=${encodeURIComponent(action)}`,
      {
        method: method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        mode: 'cors'
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed (${action}):`, error);
    return {
      success: false,
      error: getTranslation('networkError')
    };
  }
}

async function checkDuplicate() {
  const email = document.getElementById('email').value.trim().toLowerCase();
  const phone = document.getElementById('no_hp').value.trim();
  
  if (!email || !phone) return;
  
  try {
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('no_hp', phone);
    
    const response = await fetch(
      `${CONFIG.API_URL}?action=check_duplicate&${params.toString()}`,
      { method: 'GET', mode: 'cors' }
    );
    
    const result = await response.json();
    
    if (result.isDuplicate) {
      showDuplicateAlert();
    } else {
      document.getElementById('duplicateAlert').classList.remove('active');
      document.getElementById('submitBtn').disabled = false;
    }
  } catch (error) {
    console.error('Duplicate check error:', error);
  }
}

async function submitRegistration(formData) {
  try {
    const registrationId = generateRegistrationId();
    
    const dataToSubmit = {
      timestamp: new Date().toISOString(),
      registration_id: registrationId,
      nama_lengkap: formData.nama_lengkap,
      email: formData.email,
      no_hp: formData.no_hp,
      domisili: formData.domisili,
      kebangsaan: formData.kebangsaan || formData.kebangsaan_lainnya || '',
      usia: formData.usia,
      jk: formData.jk,
      dewasa_tambahan: formData.dewasa_tambahan || 0,
      dengan_anak: formData.dengan_anak || 'Tidak',
      jumlah_anak: formData.jumlah_anak || 0,
      total: calculateTotal(),
      status: 'Menunggu',
      checkin_time: '',
      lang_used: lang
    };

    const result = await makeAPICall('register', dataToSubmit, 'POST');
    
    // ✅ TAMBAHKAN HANDLER DUPLICATE RESPONSE
    if (result.status === "duplicate") {
      showDuplicateAlert();
      return {
        success: false,
        status: "duplicate"
      };
    }

    if (result.status === "success") {
      // ✅ PERBAIKI REDIRECT KE success.html (HANYA ID SAJA)
      setTimeout(() => {
        window.location.href = `success.html?id=${result.id}`;
      }, 800);
      
      return { success: true, id: result.id };
    } else {
      return { 
        success: false, 
        error: result.error || getTranslation('serverError')
      };
    }
  } catch (error) {
    console.error('Submission error:', error);
    return { 
      success: false, 
      error: getTranslation('networkError')
    };
  }
}

// ============================================
// MULTILINGUAL SUPPORT
// ============================================

function initMultilingual() {
  const t = translations[lang];
  
  // Update alert messages
  document.getElementById('duplicateAlertText').textContent = t.duplicateAlert;
  document.getElementById('infoMessageText').textContent = t.infoMessage;
  document.getElementById('progressText').textContent = t.progressText;
  
  // Update header
  document.getElementById('mainTitle').textContent = t.mainTitle;
  document.getElementById('centerName').textContent = t.centerName;
  document.getElementById('subtitleText').textContent = t.subtitle;
  document.getElementById('eventPurpose').textContent = t.eventPurpose;
  
  // Update form labels
  document.getElementById('labelNamaLengkap').textContent = t.namaLengkap;
  document.getElementById('nama_lengkap').placeholder = t.namaPlaceholder;
  
  document.getElementById('labelEmail').textContent = t.email;
  document.getElementById('email').placeholder = t.emailPlaceholder;
  document.getElementById('hintEmail').textContent = t.hintEmail;
  
  document.getElementById('labelNoHp').textContent = t.noHp;
  document.getElementById('no_hp').placeholder = t.noHpPlaceholder;
  document.getElementById('hintNoHp').textContent = t.hintNoHp;
  
  document.getElementById('labelDomisili').textContent = t.domisili;
  document.getElementById('domisili').placeholder = t.domisiliPlaceholder;
  
  document.getElementById('labelKebangsaan').textContent = t.kebangsaan;
  document.querySelector('#kebangsaan option[value=""]').textContent = t.selectKebangsaan;
  document.querySelector('#kebangsaan option[value="Indonesia"]').textContent = t.indonesia;
  document.querySelector('#kebangsaan option[value="Jepang"]').textContent = t.jepang;
  document.querySelector('#kebangsaan option[value="Lainnya"]').textContent = t.lainnya;
  
  document.getElementById('labelUsia').textContent = t.usia;
  document.getElementById('usia').placeholder = t.usiaPlaceholder;
  
  document.getElementById('labelJenisKelamin').textContent = t.jenisKelamin;
  document.getElementById('labelLakiLaki').textContent = t.lakiLaki;
  document.getElementById('labelPerempuan').textContent = t.perempuan;
  
  document.getElementById('sectionDataJamaah').textContent = t.sectionDataJamaah;
  document.getElementById('sectionKehadiran').textContent = t.sectionKehadiran;
  
  document.getElementById('labelDewasaTambahan').textContent = t.dewasaTambahan;
  document.getElementById('dewasa_tambahan').placeholder = t.dewasaPlaceholder;
  document.getElementById('hintDewasa').textContent = t.hintDewasa;
  
  document.getElementById('labelDatangDenganAnak').textContent = t.datangDenganAnak;
  document.getElementById('labelTidak').textContent = t.tidak;
  document.getElementById('labelYa').textContent = t.ya;
  document.getElementById('hintAnak').textContent = t.hintAnak;
  
  document.getElementById('labelJumlahAnak').textContent = t.jumlahAnak;
  document.getElementById('hintUsiaAnak').textContent = t.hintUsiaAnak;
  
  document.getElementById('sectionPersetujuan').textContent = t.sectionPersetujuan;
  document.getElementById('consentText').innerHTML = t.consentText;
  
  document.getElementById('submitText').textContent = t.submit;
  
  document.getElementById('prayerMessage').textContent = t.prayerMessage;
  document.getElementById('footerCopyright').textContent = t.footerCopyright;
  document.getElementById('contactText').textContent = t.contactText;
  
  document.getElementById('totalLabel').textContent = t.totalLabel;
  
  // Update total detail
  calculateTotal();
}

// ============================================
// FORM HANDLING
// ============================================

async function handleFormSubmit(e) {
  e.preventDefault();
  
  if (isSubmitting) {
    console.log('Form sedang diproses, tunggu...');
    return;
  }
  
  // Validasi kebangsaan
  const selectedNationality = document.getElementById('kebangsaan').value;
  if (!selectedNationality) {
    showAlert('alert', getTranslation('selectNationality'));
    document.getElementById('kebangsaan').focus();
    return;
  }
  
  if (selectedNationality === 'Lainnya') {
    const otherNationality = document.getElementById('kebangsaan_lainnya').value.trim();
    if (!otherNationality) {
      showAlert('alert', getTranslation('fillOtherNationality'));
      document.getElementById('kebangsaan_lainnya').focus();
      return;
    }
  }
  
  // Validasi nomor telepon
  const phone = document.getElementById('no_hp').value;
  if (!validatePhoneNumber(phone)) {
    showAlert('alert', getTranslation('invalidPhone'));
    document.getElementById('no_hp').focus();
    return;
  }
  
  // Validasi email
  const email = document.getElementById('email').value;
  if (!validateEmail(email)) {
    showAlert('alert', getTranslation('invalidEmail'));
    document.getElementById('email').focus();
    return;
  }
  
  // Cek persetujuan
  if (!document.getElementById('consentCheckbox').checked) {
    showAlert('alert', getTranslation('consentRequired'));
    document.getElementById('consentCheckbox').focus();
    return;
  }
  
  // Prepare form data
  const form = document.getElementById('registrationForm');
  const formData = new FormData(form);
  const data = {};
  
  for (const [key, value] of formData.entries()) {
    data[key] = value.toString().trim();
  }
  
  if (data.kebangsaan === 'Lainnya') {
    data.kebangsaan = document.getElementById('kebangsaan_lainnya').value.trim();
  }
  
  data.total_kehadiran = calculateTotal();
  data.total = data.total_kehadiran;
  
  // Set submitting state
  isSubmitting = true;
  const submitBtn = document.getElementById('submitBtn');
  const progressIndicator = document.getElementById('progressIndicator');
  const originalText = submitBtn.innerHTML;
  
  submitBtn.disabled = true;
  progressIndicator.classList.add('active');
  submitBtn.innerHTML = `<span class="loading-spinner" style="display: inline-block; width: 16px; height: 16px; margin-right: 8px;"></span> ${getTranslation('processing')}`;
  
  try {
    const result = await submitRegistration(data);
    
    if (result.success) {
      showAlert('success', getTranslation('registrationComplete'));
      submitBtn.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 8px;"></i> ${getTranslation('success')}`;
      submitBtn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
    } else {
      if (result.status === "duplicate") {
        showDuplicateAlert();
      } else {
        showAlert('alert', result.error || getTranslation('networkError'));
      }
      isSubmitting = false;
      submitBtn.disabled = false;
      progressIndicator.classList.remove('active');
      submitBtn.innerHTML = originalText;
    }
  } catch (error) {
    showAlert('alert', getTranslation('networkError'));
    isSubmitting = false;
    submitBtn.disabled = false;
    progressIndicator.classList.remove('active');
    submitBtn.innerHTML = originalText;
  }
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

function setupEventListeners() {
  // Language selector
  document.getElementById('languageSelector').addEventListener('change', function(e) {
    lang = e.target.value;
    initMultilingual();
  });
  
  // Nationality selection
  document.getElementById('kebangsaan').addEventListener('change', function(e) {
    const otherWrapper = document.getElementById('otherNationalityWrapper');
    otherWrapper.classList.toggle('active', e.target.value === 'Lainnya');
  });
  
  // Children toggle
  document.querySelectorAll('input[name="dengan_anak"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const childrenWrapper = document.getElementById('childrenFieldWrapper');
      childrenWrapper.classList.toggle('active', this.value === 'Ya');
      calculateTotal();
    });
  });
  
  // Real-time calculations
  document.getElementById('dewasa_tambahan').addEventListener('input', calculateTotal);
  document.getElementById('jumlah_anak').addEventListener('input', calculateTotal);
  
  // Duplicate check dengan debounce
  function scheduleDuplicateCheck() {
    clearTimeout(duplicateCheckTimeout);
    duplicateCheckTimeout = setTimeout(checkDuplicate, 800);
  }
  
  document.getElementById('email').addEventListener('input', scheduleDuplicateCheck);
  document.getElementById('no_hp').addEventListener('input', scheduleDuplicateCheck);
  
  // Reset alert ketika field berubah
  document.getElementById('email').addEventListener('input', function() {
    document.getElementById('alertMessage').classList.remove('active');
    document.getElementById('duplicateAlert').classList.remove('active');
    document.getElementById('submitBtn').disabled = false;
  });
  
  document.getElementById('no_hp').addEventListener('input', function() {
    document.getElementById('alertMessage').classList.remove('active');
    document.getElementById('duplicateAlert').classList.remove('active');
    document.getElementById('submitBtn').disabled = false;
  });
  
  // Form submission
  document.getElementById('registrationForm').addEventListener('submit', handleFormSubmit);
  
  // Enable submit button ketika consent di-check
  document.getElementById('consentCheckbox').addEventListener('change', function() {
    const submitBtn = document.getElementById('submitBtn');
    const isDuplicate = document.getElementById('duplicateAlert').classList.contains('active');
    submitBtn.disabled = !this.checked || isDuplicate;
  });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Initialize multilingual
  initMultilingual();
  
  // Set initial language selector
  document.getElementById('languageSelector').value = lang;
  
  // Show info message
  document.getElementById('infoMessage').classList.add('active');
  
  // Setup event listeners
  setupEventListeners();
  
  // Calculate initial total
  calculateTotal();
  
  // Enable form validation
  document.getElementById('registrationForm').addEventListener('input', function() {
    const form = this;
    const submitBtn = document.getElementById('submitBtn');
    const isFormValid = form.checkValidity();
    const isDuplicate = document.getElementById('duplicateAlert').classList.contains('active');
    const isConsent = document.getElementById('consentCheckbox').checked;
    
    submitBtn.disabled = !isFormValid || isDuplicate || !isConsent;
  });
});
