// ============================================
// KONFIGURASI SISTEM - SATU SUMBER KEBENARAN
// ============================================
const CONFIG = Object.freeze({
  // ⚠️ URL
  API_URL: "https://script.google.com/macros/s/AKfycbxMdWUWrpx1F1uI1bVBej0v5l6WOrLGCKwxS2yg8vsLiWo13iTdOKt3D-Z6sAIU7ndv/exec",
  API_TOKEN: "MCO_Iftar1447_K3ySecure_@2026", // Sama dengan di GAS
  MAX_OTP_ATTEMPTS: 3,
  OTP_TIMEOUT: 60000,
  RETRY_ATTEMPTS: 2,
  ENABLE_OFFLINE: false,
  SUPPORTED_LANGUAGES: ['id', 'en', 'ja']
});

// ============================================
// FUNGSI UTILITAS AWAL (PERBAIKAN)
// ============================================

// PERBAIKAN: Fungsi calculateTotal dideklarasikan di awal
function calculateTotal() {
  const registrant = 1;
  const tambahan = document.getElementById('dewasa_tambahan');
  const additionalAdults = tambahan ? (parseInt(tambahan.value) || 0) : 0;
  let children = 0;
  
  const denganAnak = document.querySelector('input[name="dengan_anak"]:checked');
  if (denganAnak && denganAnak.value === 'Ya') {
    const jmlAnak = document.getElementById('jumlah_anak');
    children = jmlAnak ? (parseInt(jmlAnak.value) || 0) : 0;
  }
  
  const total = registrant + additionalAdults + children;
  
  const totalElement = document.getElementById('totalAttendees');
  if (totalElement) totalElement.textContent = total;
  
  const detailElement = document.getElementById('totalDetail');
  if (detailElement) {
    const t = translations[lang] || translations.id;
    if (lang === 'id') detailElement.textContent = `${registrant} pendaftar, ${additionalAdults} dewasa, ${children} anak`;
    else if (lang === 'en') detailElement.textContent = `${registrant} registrant, ${additionalAdults} adults, ${children} children`;
    else detailElement.textContent = `登録者${registrant}名、大人${additionalAdults}名、子供${children}名`;
  }
  return total;
}

// PERBAIKAN REGEX EMAIL (Cegah Error /v)
function validateEmail(email) {
  // Regex yang aman untuk semua browser (Firefox, Chrome, Safari)
  const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

function validatePhoneNumber(phone) {
  if (!phone) return false;
  // Perbaikan: Menambahkan escape pada tanda hubung (-) agar tidak error di Firefox/Safari
  const phoneRegex = /^(\+62|62|08|\+81|81|070|080|090)[0-9]{7,12}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

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
    quotaFull: 'Kuota pendaftaran sudah penuh',
    registrationClosed: 'Pendaftaran belum dibuka atau sudah ditutup',
    
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
    consentText: 'Saya menyetujui <strong>data</strong> yang saya berikan digunakan untuk keperluan buka puasa bersama.',
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
    quotaFull: 'Registration quota is full',
    registrationClosed: 'Registration is not open or has been closed',
    
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
    consentText: 'I agree that the <strong>data</strong> I provide may be used for the purpose of a communal breaking of the fast.',
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
    quotaFull: '登録枠が満杯です',
    registrationClosed: '登録は開始前または終了しています',
    
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
    consentText: '私は、提供した<strong>データ</strong>が、断食明けの食事会の運営目的で使用されることに同意します。',
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
// FUNGSI API (PERBAIKAN CORS & REDIRECT)
// ============================================

async function makeAPICall(action, params = {}, method = 'POST') {
  try {
    const formData = new URLSearchParams();
    formData.append('api_token', CONFIG.API_TOKEN);
    for (const key in params) {
      formData.append(key, params[key]);
    }

    const response = await fetch(`${CONFIG.API_URL}?action=${encodeURIComponent(action)}`, {
      method: method,
      // Jika POST, kirim body. Jika GET, biarkan null.
      body: method === 'POST' ? formData : null,
      mode: 'cors', // Harus tetap cors
      redirect: 'follow' // INI KUNCINYA agar tidak NetworkError
    });

    // Cek jika response berupa redirect manual dari Google
    if (response.type === 'opaque') {
        throw new Error("Akses ditolak. Pastikan Deployment Apps Script diatur ke 'Anyone'.");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, error: "Server tidak merespon (CORS/Redirect Error)" };
  }
}

async function checkDuplicate() {
  const email = document.getElementById('email')?.value.trim().toLowerCase();
  const phone = document.getElementById('no_hp')?.value.trim();
  
  if (!email || !phone || !validateEmail(email)) return;
  
  try {
    const params = new URLSearchParams({
      action: 'check_duplicate',
      email: email,
      no_hp: phone,
      api_token: CONFIG.API_TOKEN
    });
    
    const response = await fetch(
      `${CONFIG.API_URL}?${params.toString()}`,
      { 
        method: 'GET', 
        mode: 'cors',
        redirect: 'follow' // WAJIB
      }
    );
    
    const result = await response.json();
    
    const duplicateAlert = document.getElementById('duplicateAlert');
    const submitBtn = document.getElementById('submitBtn');
    
    if (result.isDuplicate) {
      if (duplicateAlert) duplicateAlert.classList.add('active');
      if (submitBtn) submitBtn.disabled = true;
    } else {
      if (duplicateAlert) duplicateAlert.classList.remove('active');
      const isConsent = document.getElementById('consentCheckbox')?.checked;
      if (submitBtn) submitBtn.disabled = !isConsent;
    }
  } catch (error) {
    console.error('Duplicate check error:', error);
  }
}

async function submitRegistration(data) {
  return await makeAPICall('register', data, 'POST');
}

// ============================================
// MULTILINGUAL SUPPORT
// ============================================

function getTranslation(key) {
  const t = translations[lang] || translations.id;
  return t[key] || key;
}

function showAlert(type, message) {
  // Implementasi showAlert sesuai kebutuhan UI Anda
  console.log(`${type}: ${message}`);
  alert(message); // Sementara gunakan alert biasa
}

function showDuplicateAlert() {
  const duplicateAlert = document.getElementById('duplicateAlert');
  if (duplicateAlert) duplicateAlert.classList.add('active');
}

function initMultilingual() {
  const t = translations[lang];
  
  // Update alert messages
  const duplicateAlertText = document.getElementById('duplicateAlertText');
  const infoMessageText = document.getElementById('infoMessageText');
  const progressText = document.getElementById('progressText');
  
  if (duplicateAlertText) duplicateAlertText.textContent = t.duplicateAlert;
  if (infoMessageText) infoMessageText.textContent = t.infoMessage;
  if (progressText) progressText.textContent = t.progressText;
  
  // Update header
  const elements = [
    { id: 'mainTitle', text: t.mainTitle },
    { id: 'centerName', text: t.centerName },
    { id: 'subtitleText', text: t.subtitle },
    { id: 'eventPurpose', text: t.eventPurpose }
  ];
  
  elements.forEach(el => {
    const element = document.getElementById(el.id);
    if (element) element.textContent = el.text;
  });
  
  // Update form labels
  const formElements = [
    { id: 'labelNamaLengkap', text: t.namaLengkap },
    { id: 'nama_lengkap', placeholder: t.namaPlaceholder },
    { id: 'labelEmail', text: t.email },
    { id: 'email', placeholder: t.emailPlaceholder },
    { id: 'hintEmail', text: t.hintEmail },
    { id: 'labelNoHp', text: t.noHp },
    { id: 'no_hp', placeholder: t.noHpPlaceholder },
    { id: 'hintNoHp', text: t.hintNoHp },
    { id: 'labelDomisili', text: t.domisili },
    { id: 'domisili', placeholder: t.domisiliPlaceholder },
    { id: 'labelKebangsaan', text: t.kebangsaan },
    { id: 'labelUsia', text: t.usia },
    { id: 'usia', placeholder: t.usiaPlaceholder },
    { id: 'labelJenisKelamin', text: t.jenisKelamin },
    { id: 'labelLakiLaki', text: t.lakiLaki },
    { id: 'labelPerempuan', text: t.perempuan },
    { id: 'sectionDataJamaah', text: t.sectionDataJamaah },
    { id: 'sectionKehadiran', text: t.sectionKehadiran },
    { id: 'labelDewasaTambahan', text: t.dewasaTambahan },
    { id: 'dewasa_tambahan', placeholder: t.dewasaPlaceholder },
    { id: 'hintDewasa', text: t.hintDewasa },
    { id: 'labelDatangDenganAnak', text: t.datangDenganAnak },
    { id: 'labelTidak', text: t.tidak },
    { id: 'labelYa', text: t.ya },
    { id: 'hintAnak', text: t.hintAnak },
    { id: 'labelJumlahAnak', text: t.jumlahAnak },
    { id: 'hintUsiaAnak', text: t.hintUsiaAnak },
    { id: 'sectionPersetujuan', text: t.sectionPersetujuan },
    { id: 'submitText', text: t.submit },
    { id: 'prayerMessage', text: t.prayerMessage },
    { id: 'footerCopyright', text: t.footerCopyright },
    { id: 'contactText', text: t.contactText },
    { id: 'totalLabel', text: t.totalLabel }
  ];
  
  formElements.forEach(el => {
    const element = document.getElementById(el.id);
    if (element) {
      if (el.placeholder) {
        element.placeholder = el.placeholder;
      } else {
        element.textContent = el.text;
      }
    }
  });
  
  // Update consent text (HTML)
  const consentText = document.getElementById('consentText');
  if (consentText) consentText.innerHTML = t.consentText;
  
  // Update kebangsaan options
  const kebangsaanSelect = document.getElementById('kebangsaan');
  if (kebangsaanSelect) {
    const options = kebangsaanSelect.options;
    if (options[0]) options[0].textContent = t.selectKebangsaan;
    if (options[1]) options[1].textContent = t.indonesia;
    if (options[2]) options[2].textContent = t.jepang;
    if (options[3]) options[3].textContent = t.lainnya;
  }
  
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
  
  // Validasi dasar
  const namaLengkap = document.getElementById('nama_lengkap')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  
  if (!namaLengkap || !email) {
    showAlert('alert', getTranslation('fillNameEmail'));
    return;
  }
  
  // Validasi email
  if (!validateEmail(email)) {
    showAlert('alert', getTranslation('invalidEmail'));
    document.getElementById('email').focus();
    return;
  }
  
  // Validasi nomor telepon
  const phone = document.getElementById('no_hp')?.value;
  if (!validatePhoneNumber(phone)) {
    showAlert('alert', getTranslation('invalidPhone'));
    document.getElementById('no_hp').focus();
    return;
  }
  
  // Validasi kebangsaan
  const selectedNationality = document.getElementById('kebangsaan')?.value;
  if (!selectedNationality) {
    showAlert('alert', getTranslation('selectNationality'));
    document.getElementById('kebangsaan').focus();
    return;
  }
  
  if (selectedNationality === 'Lainnya') {
    const otherNationality = document.getElementById('kebangsaan_lainnya')?.value.trim();
    if (!otherNationality) {
      showAlert('alert', getTranslation('fillOtherNationality'));
      document.getElementById('kebangsaan_lainnya').focus();
      return;
    }
  }
  
  // Cek persetujuan
  if (!document.getElementById('consentCheckbox')?.checked) {
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
  
  // Handle kebangsaan
  if (data.kebangsaan === 'Lainnya') {
    data.kebangsaan = document.getElementById('kebangsaan_lainnya')?.value.trim() || '';
  }
  
  // Hitung total
  data.total_kehadiran = calculateTotal();
  data.total = data.total_kehadiran;
  
  // Set submitting state
  isSubmitting = true;
  const submitBtn = document.getElementById('submitBtn');
  const progressIndicator = document.getElementById('progressIndicator');
  const originalText = submitBtn?.innerHTML;
  
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="loading-spinner" style="display: inline-block; width: 16px; height: 16px; margin-right: 8px;"></span> ${getTranslation('processing')}`;
  }
  
  if (progressIndicator) {
    progressIndicator.classList.add('active');
  }
  
  try {
    const result = await submitRegistration(data);
    
    if (result.success) {
      showAlert('success', getTranslation('registrationComplete'));
      if (submitBtn) {
        submitBtn.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 8px;"></i> ${getTranslation('success')}`;
        submitBtn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
      }
    } else {
      if (result.status === "duplicate") {
        showDuplicateAlert();
      } else {
        showAlert('alert', result.error || getTranslation('networkError'));
      }
      isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
      if (progressIndicator) {
        progressIndicator.classList.remove('active');
      }
    }
  } catch (error) {
    showAlert('alert', getTranslation('networkError'));
    isSubmitting = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
    if (progressIndicator) {
      progressIndicator.classList.remove('active');
    }
  }
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

function setupEventListeners() {
  // Language selector
  const languageSelector = document.getElementById('languageSelector');
  if (languageSelector) {
    languageSelector.addEventListener('change', function(e) {
      lang = e.target.value;
      initMultilingual();
    });
  }
  
  // Nationality selection
  const kebangsaanSelect = document.getElementById('kebangsaan');
  if (kebangsaanSelect) {
    kebangsaanSelect.addEventListener('change', function(e) {
      const otherWrapper = document.getElementById('otherNationalityWrapper');
      if (otherWrapper) {
        otherWrapper.classList.toggle('active', e.target.value === 'Lainnya');
      }
    });
  }
  
  // Children toggle
  document.querySelectorAll('input[name="dengan_anak"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const childrenWrapper = document.getElementById('childrenFieldWrapper');
      if (childrenWrapper) {
        childrenWrapper.classList.toggle('active', this.value === 'Ya');
      }
      calculateTotal();
    });
  });
  
  // Real-time calculations
  const dewasaInput = document.getElementById('dewasa_tambahan');
  const jumlahAnakInput = document.getElementById('jumlah_anak');
  
  if (dewasaInput) {
    dewasaInput.addEventListener('input', calculateTotal);
  }
  
  if (jumlahAnakInput) {
    jumlahAnakInput.addEventListener('input', calculateTotal);
  }
  
  // Duplicate check dengan debounce
  function scheduleDuplicateCheck() {
    clearTimeout(duplicateCheckTimeout);
    duplicateCheckTimeout = setTimeout(checkDuplicate, 800);
  }
  
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('no_hp');
  
  if (emailInput) {
    emailInput.addEventListener('input', scheduleDuplicateCheck);
  }
  
  if (phoneInput) {
    phoneInput.addEventListener('input', scheduleDuplicateCheck);
  }
  
  // Reset alert ketika field berubah
  const alertResetFields = ['email', 'no_hp'];
  
  alertResetFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('input', function() {
        const alertMessage = document.getElementById('alertMessage');
        const duplicateAlert = document.getElementById('duplicateAlert');
        const submitBtn = document.getElementById('submitBtn');
        
        if (alertMessage) alertMessage.classList.remove('active');
        if (duplicateAlert) duplicateAlert.classList.remove('active');
        if (submitBtn) {
          const isConsent = document.getElementById('consentCheckbox')?.checked;
          submitBtn.disabled = !isConsent;
        }
      });
    }
  });
  
  // Form submission
  const registrationForm = document.getElementById('registrationForm');
  if (registrationForm) {
    registrationForm.addEventListener('submit', handleFormSubmit);
  }
  
  // Enable submit button ketika consent di-check
  const consentCheckbox = document.getElementById('consentCheckbox');
  if (consentCheckbox) {
    consentCheckbox.addEventListener('change', function() {
      const submitBtn = document.getElementById('submitBtn');
      const isDuplicate = document.getElementById('duplicateAlert')?.classList.contains('active');
      
      if (submitBtn) {
        submitBtn.disabled = !this.checked || isDuplicate;
      }
    });
  }
}

// ============================================
// HEALTH CHECK FUNGSI
// ============================================

async function checkSystemHealth() {
  try {
    const response = await fetch(`${CONFIG.API_URL}?action=health&api_token=${CONFIG.API_TOKEN}`, {
      method: 'GET',
      mode: 'cors',
      redirect: 'follow'
    });
    
    const result = await response.json();
    
    if (result.status === 'active') {
      console.log('✅ Sistem backend aktif');
      
      // Tampilkan info jika pendaftaran belum/tidak dibuka
      if (!result.registration_open) {
        showAlert('alert', getTranslation('registrationClosed'));
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) submitBtn.disabled = true;
      }
    }
  } catch (error) {
    console.warn('⚠️ Tidak dapat menghubungi server:', error);
  }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Initialize multilingual
  initMultilingual();
  
  // Set initial language selector
  const languageSelector = document.getElementById('languageSelector');
  if (languageSelector) {
    languageSelector.value = lang;
  }
  
  // Show info message
  const infoMessage = document.getElementById('infoMessage');
  if (infoMessage) {
    infoMessage.classList.add('active');
  }
  
  // Setup event listeners
  setupEventListeners();
  
  // Calculate initial total
  calculateTotal();
  
  // Enable form validation
  const registrationForm = document.getElementById('registrationForm');
  if (registrationForm) {
    registrationForm.addEventListener('input', function() {
      const submitBtn = document.getElementById('submitBtn');
      if (!submitBtn) return;
      
      const isFormValid = this.checkValidity();
      const isDuplicate = document.getElementById('duplicateAlert')?.classList.contains('active');
      const isConsent = document.getElementById('consentCheckbox')?.checked;
      
      submitBtn.disabled = !isFormValid || isDuplicate || !isConsent;
    });
  }
  
  // Check system health saat load
  checkSystemHealth();
});
