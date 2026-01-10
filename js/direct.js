// 🔥 TAMBAHKAN SCRIPT URL ANDA DI SINI
// Ganti dengan URL Google Apps Script Anda
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwC1NSbdAcIAAA2r5K6P16KA77888I73JWf92TgbzhgtgRCam50n76leWPkSycIBSTA/exec";

// ===============================
// LANGKAH 1 — VALIDASI ID WAJIB ADA
// ===============================
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
    alert("ID registrasi tidak ditemukan. Silakan daftar ulang.");
    window.location.href = "index.html";
    throw new Error("Missing registration ID");
}

// ===============================
// DATA DARI SERVER (DIISI SETELAH FETCH)
// ===============================
let regData = null;

// ===============================
// MULTILINGUAL SUPPORT
// ===============================
const translations = {
    id: {
        title: "Pendaftaran Berhasil!",
        subtitle: "Data Anda telah berhasil tersimpan dalam sistem registrasi.",
        successMessage: "Simpan kartu akses di bawah ini untuk ditunjukkan saat acara.",
        
        eventTitle: "Buka Puasa Bersama 1447 H",
        organization: "Masjid Central Okayama",
        
        fullName: "Nama Lengkap",
        email: "Email",
        phone: "Nomor Telepon",
        domisili: "Domisili",
        totalAttendees: "Total Kehadiran",
        eventDate: "Tanggal Acara",
        eventTime: "Waktu",
        location: "Lokasi",
        
        dateValue: "Sabtu, 14 Maret 2026",
        timeValue: "17.30 - 20.00 JST",
        locationValue: "Masjid Central Okayama",
        
        instruction: "Harap tunjukkan QR Code ini kepada petugas saat kedatangan. Kartu ini berlaku untuk semua peserta yang terdaftar.",
        
        downloadBtn: "Simpan Kartu",
        shareBtn: "Bagikan",
        homeBtn: "Beranda",
        adminBtn: "Admin",
        downloading: "Mengunduh...",
        
        copyright: "© 2026 Masjid Central Okayama",
        contactInfo: "Untuk informasi lebih lanjut:",
        
        locationTitle: "Lokasi Acara",
        locationDetail: "Masjid Central Okayama<br>Okayama-shi, Kita-ku, Jepang",
        contactTitle: "Kontak Panitia",
        contactDetail: "Email: ibadurrahmanislamiccenter@gmail.com<br>Telepon: 070-5671-0616",
        
        errorMessage: "Gagal memuat data dari server. Silakan coba lagi.",
        downloadError: "Maaf, terjadi kesalahan saat mengunduh kartu. Silakan coba lagi atau hubungi panitia.",
        shareSuccess: "Berhasil dibagikan!",
        shareError: "Gagal membagikan",
        
        prayerMessage: "Semoga Allah menerima amal ibadah kita di bulan Ramadan yang mulia ini",
        qrHint: "Scan QR Code ini saat check-in",
        
        langName: "Bahasa Indonesia",
        langCode: "ID"
    },
    
    en: {
        title: "Registration Successful!",
        subtitle: "Your data has been successfully saved in the registration system.",
        successMessage: "Save the access card below to present at the event.",
        
        eventTitle: "Iftar Gathering 1447 H",
        organization: "Central Okayama Mosque",
        
        fullName: "Full Name",
        email: "Email",
        phone: "Phone Number",
        domisili: "Residence",
        totalAttendees: "Total Attendees",
        eventDate: "Event Date",
        eventTime: "Time",
        location: "Location",
        
        dateValue: "Saturday, March 14, 2026",
        timeValue: "5:30 PM - 8:00 PM JST",
        locationValue: "Central Okayama Mosque",
        
        instruction: "Please show this QR Code to the officer upon arrival. This card is valid for all registered participants.",
        
        downloadBtn: "Save Card",
        shareBtn: "Share",
        homeBtn: "Home",
        adminBtn: "Admin",
        downloading: "Downloading...",
        
        copyright: "© 2026 Central Okayama Mosque",
        contactInfo: "For more information:",
        
        locationTitle: "Event Location",
        locationDetail: "Central Okayama Mosque<br>Okayama-shi, Kita-ku, Japan",
        contactTitle: "Committee Contact",
        contactDetail: "Email: ibadurrahmanislamiccenter@gmail.com<br>Phone: 070-5671-0616",
        
        errorMessage: "Failed to load data from server. Please try again.",
        downloadError: "Sorry, an error occurred while downloading the card. Please try again or contact the committee.",
        shareSuccess: "Successfully shared!",
        shareError: "Failed to share",
        
        prayerMessage: "May Allah accept our worship in this blessed month of Ramadan",
        qrHint: "Scan this QR Code during check-in",
        
        langName: "English",
        langCode: "EN"
    },
    
    ja: {
        title: "登録が完了しました！",
        subtitle: "あなたのデータは登録システムに正常に保存されました。",
        successMessage: "下記のアクセスカードを保存して、イベント当日に提示してください。",
        
        eventTitle: "イフタール集会 1447 H",
        organization: "セントラル岡山モスク",
        
        fullName: "氏名",
        email: "メール",
        phone: "電話番号",
        domisili: "居住地",
        totalAttendees: "参加者総数",
        eventDate: "イベント日",
        eventTime: "時間",
        location: "場所",
        
        dateValue: "2026年3月14日（土）",
        timeValue: "17:30 - 20:00 JST",
        locationValue: "セントラル岡山モスク",
        
        instruction: "到着時にこのQRコードを係員に提示してください。このカードは登録されたすべての参加者に有効です。",
        
        downloadBtn: "カードを保存",
        shareBtn: "共有",
        homeBtn: "ホーム",
        adminBtn: "管理",
        downloading: "ダウンロード中...",
        
        copyright: "© 2026 セントラル岡山モスク",
        contactInfo: "詳細については：",
        
        locationTitle: "イベント会場",
        locationDetail: "岡山セントラルモスク<br>日本、岡山市北区",
        contactTitle: "委員会連絡先",
        contactDetail: "メール: ibadurrahmanislamiccenter@gmail.com<br>電話: 070-5671-0616",
        
        errorMessage: "サーバーからのデータの読み込みに失敗しました。もう一度お試しください。",
        downloadError: "申し訳ありません、カードのダウンロード中にエラーが発生しました。もう一度お試しいただくか、委員会にご連絡ください。",
        shareSuccess: "正常に共有されました！",
        shareError: "共有に失敗しました",
        
        prayerMessage: "アッラーがこの聖なるラマダーン月における私たちの礼拝をお受け入れになりますように",
        qrHint: "チェックイン時にこのQRコードをスキャンしてください",
        
        langName: "日本語",
        langCode: "JA"
    }
};

let currentLang = 'id';

// ===============================
// LANGUAGE FUNCTIONS
// ===============================
function applyTranslations(lang) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });
    
    const langBtn = document.getElementById('currentLang');
    if (langBtn) {
        langBtn.textContent = translations[lang].langCode;
    }
    
    document.title = `${translations[lang].title} - ${translations[lang].eventTitle}`;
    localStorage.setItem('preferredLanguage', lang);
    currentLang = lang;
}

function switchLanguage() {
    const languages = ['id', 'en', 'ja'];
    const currentIndex = languages.indexOf(currentLang);
    const nextIndex = (currentIndex + 1) % languages.length;
    const nextLang = languages[nextIndex];
    
    applyTranslations(nextLang);
    
    const langBtn = document.getElementById('langBtn');
    if (langBtn) {
        langBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            langBtn.style.transform = 'scale(1)';
        }, 150);
    }
    
    // Update quantity display for new language
    if (regData) {
        updateQuantityDisplay();
    }
}

// ===============================
// LANGKAH 3 — TAMPILKAN DATA DARI SERVER
// ===============================
function displayData(data) {
    // Simpan data ke variabel global untuk digunakan di fungsi lain
    regData = data;
    
    document.getElementById('displayId').textContent = data.id;
    document.getElementById('displayName').textContent = data.nama;
    document.getElementById('displayEmail').textContent = data.email;
    document.getElementById('displayPhone').textContent = data.phone;
    document.getElementById('displayDomisili').textContent = data.domisili;
    updateQuantityDisplay();
}

function updateQuantityDisplay() {
    if (!regData) return;
    
    const qty = regData.qty || '1';
    let qtyText = qty;
    
    if (currentLang === 'id') {
        qtyText += ' Orang';
    } else if (currentLang === 'en') {
        qtyText += qty === '1' ? ' Person' : ' People';
    } else {
        qtyText += '名';
    }
    
    document.getElementById('displayQty').textContent = qtyText;
}

// ===============================
// LANGKAH 4 — GENERATE QR (HANYA ID)
// ===============================
function generateQRCode(id) {
    const el = document.getElementById("qrcode");
    el.innerHTML = "";

    new QRCode(el, {
        text: id,
        width: 180,
        height: 180,
        correctLevel: QRCode.CorrectLevel.H
    });
}

// ===============================
// LANGKAH 2 — FETCH DATA DARI SERVER
// ===============================
function fetchRegistrationData() {
    console.log("Fetching data for ID:", id);
    
    const API_TOKEN = "MCO_Iftar1447_K3ySecure_@2026";
    fetch(`${SCRIPT_URL}?action=get_registration&id=${id}&api_token=${API_TOKEN}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            if (data.status !== "valid" || !data.id) {
                alert("ID tidak valid atau tidak terdaftar");
                window.location.href = "index.html";
                return;
            }

            // DATA ASLI DARI GOOGLE SHEET
            displayData(data);
            generateQRCode(data.id);
            
            // Aktifkan tombol setelah data berhasil di-load
            document.getElementById('downloadBtn').disabled = false;
            document.getElementById('shareBtn').disabled = false;
            
            // Sembunyikan error message jika ada
            document.getElementById('errorMessage').style.display = 'none';
            
            console.log("Data loaded successfully:", data);
        })
        .catch(err => {
            console.error("Fetch error:", err);
            showError("Gagal memverifikasi data dari server. Silakan coba lagi.");
        });
}

// ===============================
// DOWNLOAD CARD FUNCTION
// ===============================
async function downloadRegistrationCard() {
    if (!regData) {
        showError("Data belum siap. Silakan tunggu sebentar.");
        return;
    }
    
    const btn = document.getElementById('downloadBtn');
    const card = document.getElementById('registrationCard');
    
    if (!card) {
        console.error("Card element not found");
        showToast('Elemen kartu tidak ditemukan', 'error');
        return;
    }
    
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${translations[currentLang].downloading}`;

    try {
        // Clone card untuk manipulasi
        const clonedCard = card.cloneNode(true);
        clonedCard.style.position = 'absolute';
        clonedCard.style.left = '-9999px';
        clonedCard.style.top = '0';
        clonedCard.style.width = '500px';
        clonedCard.style.height = 'auto';
        clonedCard.style.border = '3px solid var(--accent-gold)';
        clonedCard.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
        clonedCard.style.background = 'white';
        
        // Tambahkan watermark
        const watermark = document.createElement('div');
        watermark.style.position = 'absolute';
        watermark.style.top = '50%';
        watermark.style.left = '50%';
        watermark.style.transform = 'translate(-50%, -50%) rotate(-45deg)';
        watermark.style.fontSize = '40px';
        watermark.style.fontWeight = 'bold';
        watermark.style.color = 'rgba(212, 175, 55, 0.1)';
        watermark.style.zIndex = '1';
        watermark.style.pointerEvents = 'none';
        watermark.style.whiteSpace = 'nowrap';
        watermark.textContent = 'IFTAR 1447 H';
        
        clonedCard.appendChild(watermark);
        document.body.appendChild(clonedCard);
        
        // Generate canvas
        const canvas = await html2canvas(clonedCard, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
            removeContainer: true
        });
        
        // Hapus clone
        document.body.removeChild(clonedCard);
        
        // Convert to image and download
        const imageData = canvas.toDataURL("image/png", 1.0);
        const link = document.createElement('a');
        
        // Generate filename
        const cleanName = regData.nama
            .replace(/[^a-zA-Z0-9\u0600-\u06FF\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 30);
        
        const fileNamePrefix = currentLang === 'id' ? 'KARTU_AKSES_' : 
                                currentLang === 'en' ? 'ACCESS_CARD_' : 'アクセスカード_';
        
        const fileName = `${fileNamePrefix}${regData.id}_${cleanName}.png`;
        link.href = imageData;
        link.download = fileName;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log("Card downloaded successfully:", fileName);
        
        // Success feedback
        btn.innerHTML = '<i class="fas fa-check-circle"></i> ✓';
        btn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
        
        showToast(translations[currentLang].downloadBtn + ' berhasil!', 'success');
        
        // Reset button after 2 seconds
        setTimeout(() => {
            btn.innerHTML = originalText;
            applyTranslations(currentLang);
            btn.disabled = false;
        }, 2000);
        
    } catch (err) {
        console.error("Gagal mengunduh kartu:", err);
        
        // Error feedback
        btn.innerHTML = '<i class="fas fa-exclamation-circle"></i> !';
        btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        
        showToast(translations[currentLang].downloadError, 'error');
        
        // Reset button after 3 seconds
        setTimeout(() => {
            btn.innerHTML = originalText;
            applyTranslations(currentLang);
            btn.style.background = 'linear-gradient(135deg, var(--accent-green), var(--accent-teal))';
            btn.disabled = false;
        }, 3000);
    }
}

// ===============================
// SHARE FUNCTION
// ===============================
function shareCard() {
    if (!regData) {
        showError("Data belum siap. Silakan tunggu sebentar.");
        return;
    }
    
    const shareBtn = document.getElementById('shareBtn');
    const originalText = shareBtn.innerHTML;
    
    if (navigator.share) {
        navigator.share({
            title: `${translations[currentLang].eventTitle} - ${regData.id}`,
            text: `${translations[currentLang].title} - ${translations[currentLang].eventTitle}\nID: ${regData.id}\nNama: ${regData.nama}`,
            url: window.location.href
        }).then(() => {
            showToast(translations[currentLang].shareSuccess, 'success');
        }).catch(error => {
            console.log('Sharing cancelled or failed:', error);
        });
    } else {
        // Fallback: copy to clipboard
        const shareText = `${translations[currentLang].title}\n${translations[currentLang].eventTitle}\nID Registrasi: ${regData.id}\nNama: ${regData.nama}\nLink: ${window.location.href}`;
        
        navigator.clipboard.writeText(shareText).then(() => {
            shareBtn.innerHTML = '<i class="fas fa-check"></i> ✓';
            showToast('Tautan disalin ke clipboard!', 'success');
            
            setTimeout(() => {
                shareBtn.innerHTML = originalText;
                applyTranslations(currentLang);
            }, 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
            shareBtn.innerHTML = '<i class="fas fa-times"></i> !';
            showToast(translations[currentLang].shareError, 'error');
            
            setTimeout(() => {
                shareBtn.innerHTML = originalText;
                applyTranslations(currentLang);
            }, 2000);
        });
    }
}

// ===============================
// HELPER FUNCTIONS
// ===============================
function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorEl.style.display = 'flex';
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// ===============================
// INIT
// ===============================
function initializePage() {
    console.log("Initializing registration page...");
    
    // 1. Setup language
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && ['id', 'en', 'ja'].includes(savedLang)) {
        currentLang = savedLang;
    }
    
    applyTranslations(currentLang);
    
    // 2. Setup event listener untuk tombol bahasa
    const langBtn = document.getElementById('langBtn');
    if (langBtn) {
        langBtn.addEventListener('click', switchLanguage);
    }
    
    // 3. Tampilkan link admin jika parameter admin ada
    if (params.get('admin') === 'true') {
        document.getElementById('adminLink').style.display = 'flex';
    }
    
    // 4. Fetch data dari server
    setTimeout(() => {
    fetchRegistrationData();
    }, 1000);
    
    // 5. Setup event listeners
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadRegistrationCard);
    }
    
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareCard);
    }
    
    console.log("Page initialized successfully with language:", currentLang);
}

document.addEventListener("DOMContentLoaded", initializePage);
