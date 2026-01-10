// ==============================================
// KONFIGURASI APLIKASI
// ==============================================

// 🔥 URL Google Apps Script Anda
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx8tFxFZtUsYc9LvyhBFTEhN990fZ30GhwXpDuQE7fejHPWq8YDNqyNfW8_Km_becnx/exec";

// Token API untuk keamanan
const API_TOKEN = "MCO_Iftar1447_K3ySecure_@2026";

// ==============================================
// VARIABEL GLOBAL
// ==============================================

// Data registrasi dari server
let regData = null;

// Parameter URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Bahasa saat ini (default: Bahasa Indonesia)
let currentLang = 'id';

// Status loading
let isLoading = false;

// ==============================================
// MULTILINGUAL SUPPORT
// ==============================================

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
        langCode: "ID",
        
        loading: "Memuat data...",
        retry: "Coba Lagi",
        goHome: "Kembali ke Beranda",
        invalidId: "ID tidak valid atau tidak terdaftar",
        offlineMessage: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
        dataNotFound: "Data tidak ditemukan untuk ID ini"
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
        langCode: "EN",
        
        loading: "Loading data...",
        retry: "Try Again",
        goHome: "Back to Home",
        invalidId: "Invalid or unregistered ID",
        offlineMessage: "Cannot connect to server. Please check your internet connection.",
        dataNotFound: "Data not found for this ID"
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
        langCode: "JA",
        
        loading: "データを読み込み中...",
        retry: "もう一度試す",
        goHome: "ホームに戻る",
        invalidId: "無効または登録されていないID",
        offlineMessage: "サーバーに接続できません。インターネット接続を確認してください。",
        dataNotFound: "このIDのデータが見つかりません"
    }
};

// ==============================================
// FUNGSI BAHASA DAN TRANSLASI
// ==============================================

/**
 * Menerapkan terjemahan ke seluruh halaman
 * @param {string} lang - Kode bahasa (id, en, ja)
 */
function applyTranslations(lang) {
    try {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                element.innerHTML = translations[lang][key];
            }
        });
        
        // Update tombol bahasa
        const langBtn = document.getElementById('currentLang');
        if (langBtn) {
            langBtn.textContent = translations[lang].langCode;
        }
        
        // Update title halaman
        document.title = `${translations[lang].title} - ${translations[lang].eventTitle}`;
        
        // Simpan preferensi bahasa
        localStorage.setItem('preferredLanguage', lang);
        currentLang = lang;
        
        // Update tampilan jumlah peserta
        if (regData) {
            updateQuantityDisplay();
        }
        
        console.log(`Bahasa diterapkan: ${lang}`);
    } catch (error) {
        console.error('Error dalam applyTranslations:', error);
    }
}

/**
 * Ganti bahasa ke bahasa berikutnya
 */
function switchLanguage() {
    const languages = ['id', 'en', 'ja'];
    const currentIndex = languages.indexOf(currentLang);
    const nextIndex = (currentIndex + 1) % languages.length;
    const nextLang = languages[nextIndex];
    
    applyTranslations(nextLang);
    
    // Animasi tombol
    const langBtn = document.getElementById('langBtn');
    if (langBtn) {
        langBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            langBtn.style.transform = 'scale(1)';
        }, 150);
    }
}

/**
 * Update tampilan jumlah peserta berdasarkan bahasa
 */
function updateQuantityDisplay() {
    if (!regData) return;
    
    const qty = regData.qty || '1';
    let qtyText = qty;
    
    switch (currentLang) {
        case 'id':
            qtyText += ' Orang';
            break;
        case 'en':
            qtyText += qty === '1' ? ' Person' : ' People';
            break;
        case 'ja':
            qtyText += '名';
            break;
        default:
            qtyText += ' Orang';
    }
    
    const displayElement = document.getElementById('displayQty');
    if (displayElement) {
        displayElement.textContent = qtyText;
    }
}

// ==============================================
// VALIDASI AWAL - CEK ID DI URL
// ==============================================

function validateId() {
    if (!id) {
        showError("ID registrasi tidak ditemukan. Silakan daftar ulang.", true);
        setTimeout(() => {
            window.location.href = "index.html";
        }, 3000);
        return false;
    }
    
    // Validasi format ID (harus ada karakter dan angka)
    if (!/^[A-Za-z0-9_-]+$/.test(id)) {
        showError("Format ID tidak valid. Silakan daftar ulang.", true);
        setTimeout(() => {
            window.location.href = "index.html";
        }, 3000);
        return false;
    }
    
    console.log("ID valid:", id);
    return true;
}

// ==============================================
// FUNGSI FETCH DATA DARI SERVER
// ==============================================

/**
 * Fetch data registrasi dari server
 */
async function fetchRegistrationData() {
    if (isLoading) return;
    
    // Validasi ID terlebih dahulu
    if (!validateId()) {
        return;
    }
    
    // Tampilkan loading state
    showLoading(true);
    isLoading = true;
    
    console.log("Memulai fetch data untuk ID:", id);
    
    try {
        // Tambahkan timeout untuk fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 detik timeout
        
        const response = await fetch(
            `${SCRIPT_URL}?action=get_registration&id=${encodeURIComponent(id)}&api_token=${API_TOKEN}`,
            {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Respons server:", data);
        
        // ============================================
        // VALIDASI FLEKSIBEL - MENERIMA BERBAGAI FORMAT
        // ============================================
        
        let isValid = false;
        let registrationData = null;
        
        // Format 1: { status: "valid", data: {...} }
        if (data.status === "valid" && data.data && data.data.id) {
            isValid = true;
            registrationData = data.data;
        }
        // Format 2: { success: true, data: {...} }
        else if (data.success === true && data.data && data.data.id) {
            isValid = true;
            registrationData = data.data;
        }
        // Format 3: { id: "...", nama: "...", ... } (data langsung tanpa wrapper)
        else if (data.id && data.nama) {
            isValid = true;
            registrationData = data;
        }
        // Format 4: { status: "success", ...data langsung }
        else if (data.status === "success" && data.id) {
            isValid = true;
            registrationData = data;
        }
        // Format 5: { error: false, ...data langsung }
        else if (data.error === false && data.id) {
            isValid = true;
            registrationData = data;
        }
        
        if (!isValid) {
            console.error("Validasi gagal. Data respons:", data);
            
            let errorMessage = translations[currentLang].invalidId;
            
            // Cek pesan error dari server
            if (data.message) errorMessage = data.message;
            if (data.error) errorMessage = data.error;
            if (data.reason) errorMessage = data.reason;
            
            // Jika data ditemukan tapi format tidak sesuai
            if (data.id && !data.nama) {
                errorMessage = translations[currentLang].dataNotFound;
            }
            
            throw new Error(errorMessage);
        }
        
        // Simpan data ke variabel global
        regData = registrationData;
        
        // Tampilkan data di halaman
        displayData(registrationData);
        
        // Generate QR Code
        generateQRCode(registrationData.id);
        
        // Aktifkan tombol
        enableButtons();
        
        // Sembunyikan error message jika ada
        hideError();
        
        console.log("Data berhasil dimuat:", registrationData);
        
    } catch (error) {
        console.error("Error dalam fetchRegistrationData:", error);
        
        // Tentukan pesan error berdasarkan jenis error
        let errorMessage = translations[currentLang].errorMessage;
        
        if (error.name === 'AbortError') {
            errorMessage = "Waktu permintaan habis. Periksa koneksi internet Anda.";
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = translations[currentLang].offlineMessage;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showError(errorMessage, false);
        
        // Tampilkan tombol retry
        showRetryButton();
        
    } finally {
        showLoading(false);
        isLoading = false;
    }
}

/**
 * Tampilkan data di halaman
 */
function displayData(data) {
    if (!data) return;
    
    const elements = {
        'displayId': data.id,
        'displayName': data.nama || data.name || '-',
        'displayEmail': data.email || '-',
        'displayPhone': data.phone || data.telepon || '-',
        'displayDomisili': data.domisili || data.residence || '-'
    };
    
    // Update setiap elemen
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    });
    
    // Update jumlah peserta
    updateQuantityDisplay();
    
    // Update informasi acara
    updateEventInfo();
}

/**
 * Update informasi acara berdasarkan bahasa
 */
function updateEventInfo() {
    const dateElement = document.getElementById('eventDateValue');
    const timeElement = document.getElementById('eventTimeValue');
    const locationElement = document.getElementById('eventLocationValue');
    
    if (dateElement) dateElement.textContent = translations[currentLang].dateValue;
    if (timeElement) timeElement.textContent = translations[currentLang].timeValue;
    if (locationElement) locationElement.textContent = translations[currentLang].locationValue;
}

/**
 * Aktifkan tombol-tombol interaktif
 */
function enableButtons() {
    const downloadBtn = document.getElementById('downloadBtn');
    const shareBtn = document.getElementById('shareBtn');
    
    if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.style.opacity = '1';
        downloadBtn.style.cursor = 'pointer';
    }
    
    if (shareBtn) {
        shareBtn.disabled = false;
        shareBtn.style.opacity = '1';
        shareBtn.style.cursor = 'pointer';
    }
}

// ==============================================
// GENERATE QR CODE
// ==============================================

/**
 * Generate QR Code dari ID registrasi
 */
function generateQRCode(id) {
    const qrElement = document.getElementById("qrcode");
    if (!qrElement) return;
    
    // Kosongkan konten sebelumnya
    qrElement.innerHTML = "";
    
    // Generate QR Code baru
    try {
        new QRCode(qrElement, {
            text: id,
            width: 200,
            height: 200,
            colorDark: "#0a5c36",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        console.log("QR Code berhasil digenerate untuk ID:", id);
    } catch (error) {
        console.error("Error generate QR Code:", error);
        qrElement.innerHTML = `
            <div style="color: #666; text-align: center; padding: 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 10px;"></i>
                <p>QR Code tidak dapat ditampilkan</p>
                <p><strong>ID:</strong> ${id}</p>
            </div>
        `;
    }
}

// ==============================================
// FUNGSI DOWNLOAD KARTU
// ==============================================

/**
 * Download kartu registrasi sebagai gambar
 */
async function downloadRegistrationCard() {
    if (!regData) {
        showToast("Data belum siap. Silakan tunggu sebentar.", 'error');
        return;
    }
    
    const btn = document.getElementById('downloadBtn');
    const card = document.getElementById('registrationCard');
    
    if (!card) {
        console.error("Elemen kartu tidak ditemukan");
        showToast('Elemen kartu tidak ditemukan', 'error');
        return;
    }
    
    // Simpan teks asli dan disable tombol
    const originalText = btn.innerHTML;
    const originalBackground = btn.style.background;
    
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${translations[currentLang].downloading}`;
    
    try {
        // Clone kartu untuk manipulasi
        const clonedCard = card.cloneNode(true);
        
        // Styling untuk clone
        Object.assign(clonedCard.style, {
            position: 'absolute',
            left: '-9999px',
            top: '0',
            width: '600px',
            height: 'auto',
            border: '3px solid #d4af37',
            boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
            background: 'white',
            borderRadius: '20px',
            overflow: 'hidden'
        });
        
        // Tambahkan watermark
        const watermark = document.createElement('div');
        watermark.textContent = 'IFTAR 1447 H';
        Object.assign(watermark.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            fontSize: '50px',
            fontWeight: 'bold',
            color: 'rgba(212, 175, 55, 0.08)',
            zIndex: '1',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
            letterSpacing: '3px'
        });
        
        clonedCard.appendChild(watermark);
        document.body.appendChild(clonedCard);
        
        // Generate canvas dengan html2canvas
        const canvas = await html2canvas(clonedCard, {
            scale: 3, // Resolusi tinggi
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
            allowTaint: true,
            onclone: (clonedDoc) => {
                // Pastikan semua font dan gambar sudah dimuat
                const clonedQr = clonedDoc.querySelector('#qrcode');
                if (clonedQr) {
                    clonedQr.style.border = '2px solid #f0f0f0';
                }
            }
        });
        
        // Hapus clone dari DOM
        document.body.removeChild(clonedCard);
        
        // Konversi ke gambar dan download
        const imageData = canvas.toDataURL("image/png", 1.0);
        const link = document.createElement('a');
        
        // Generate nama file
        const cleanName = (regData.nama || 'Unknown')
            .replace(/[^a-zA-Z0-9\u0600-\u06FF\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\s-]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 30);
        
        const fileNamePrefix = {
            'id': 'KARTU_AKSES_',
            'en': 'ACCESS_CARD_',
            'ja': 'アクセスカード_'
        }[currentLang] || 'ACCESS_CARD_';
        
        const fileName = `${fileNamePrefix}${regData.id}_${cleanName}_${new Date().getTime()}.png`;
        
        link.href = imageData;
        link.download = fileName;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log("Kartu berhasil diunduh:", fileName);
        
        // Feedback sukses
        btn.innerHTML = '<i class="fas fa-check-circle"></i> ✓';
        btn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
        
        showToast(translations[currentLang].downloadBtn + ' berhasil!', 'success');
        
        // Reset tombol setelah 2 detik
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = originalBackground;
            applyTranslations(currentLang);
            btn.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error("Error download kartu:", error);
        
        // Feedback error
        btn.innerHTML = '<i class="fas fa-exclamation-circle"></i> !';
        btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        
        showToast(translations[currentLang].downloadError, 'error');
        
        // Reset tombol setelah 3 detik
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = originalBackground;
            applyTranslations(currentLang);
            btn.disabled = false;
        }, 3000);
    }
}

// ==============================================
// FUNGSI SHARE
// ==============================================

/**
 * Share kartu registrasi
 */
function shareCard() {
    if (!regData) {
        showToast("Data belum siap. Silakan tunggu sebentar.", 'error');
        return;
    }
    
    const shareBtn = document.getElementById('shareBtn');
    const originalText = shareBtn.innerHTML;
    
    // Data untuk sharing
    const shareData = {
        title: `${translations[currentLang].eventTitle} - ${regData.id}`,
        text: `${translations[currentLang].title}\n\n` +
              `${translations[currentLang].eventTitle}\n` +
              `ID: ${regData.id}\n` +
              `Nama: ${regData.nama}\n` +
              `Jumlah: ${regData.qty || 1} peserta`,
        url: window.location.href
    };
    
    // Cek apakah Web Share API didukung
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => {
                showToast(translations[currentLang].shareSuccess, 'success');
            })
            .catch(error => {
                if (error.name !== 'AbortError') {
                    console.log('Sharing failed:', error);
                    fallbackShare(shareBtn, originalText);
                }
            });
    } else {
        fallbackShare(shareBtn, originalText);
    }
}

/**
 * Fallback untuk browser yang tidak mendukung Web Share API
 */
function fallbackShare(shareBtn, originalText) {
    // Copy ke clipboard
    const shareText = `${translations[currentLang].title}\n` +
                     `${translations[currentLang].eventTitle}\n\n` +
                     `ID Registrasi: ${regData.id}\n` +
                     `Nama: ${regData.nama}\n` +
                     `Jumlah Peserta: ${regData.qty || 1}\n\n` +
                     `Link: ${window.location.href}`;
    
    navigator.clipboard.writeText(shareText)
        .then(() => {
            shareBtn.innerHTML = '<i class="fas fa-check"></i> ✓';
            showToast('Tautan disalin ke clipboard!', 'success');
            
            setTimeout(() => {
                shareBtn.innerHTML = originalText;
                applyTranslations(currentLang);
            }, 2000);
        })
        .catch(err => {
            console.error('Copy failed:', err);
            shareBtn.innerHTML = '<i class="fas fa-times"></i> !';
            showToast(translations[currentLang].shareError, 'error');
            
            setTimeout(() => {
                shareBtn.innerHTML = originalText;
                applyTranslations(currentLang);
            }, 2000);
            
            // Alternatif: buka email
            const emailSubject = encodeURIComponent(`Konfirmasi Registrasi: ${regData.id}`);
            const emailBody = encodeURIComponent(shareText);
            window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`, '_blank');
        });
}

// ==============================================
// FUNGSI HELPER - UI FEEDBACK
// ==============================================

/**
 * Tampilkan loading state
 */
function showLoading(show) {
    const loadingElement = document.getElementById('loadingIndicator');
    const mainContent = document.getElementById('mainContent');
    
    if (loadingElement && mainContent) {
        if (show) {
            loadingElement.style.display = 'flex';
            mainContent.style.opacity = '0.5';
            mainContent.style.pointerEvents = 'none';
        } else {
            loadingElement.style.display = 'none';
            mainContent.style.opacity = '1';
            mainContent.style.pointerEvents = 'auto';
        }
    }
}

/**
 * Tampilkan error message
 */
function showError(message, isFatal = false) {
    const errorElement = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const errorActions = document.getElementById('errorActions');
    const mainContent = document.getElementById('mainContent');
    
    if (errorElement && errorText) {
        errorText.textContent = message;
        errorElement.style.display = 'flex';
        
        // Tampilkan aksi berdasarkan jenis error
        if (errorActions) {
            errorActions.style.display = isFatal ? 'none' : 'flex';
        }
        
        // Sembunyikan konten utama untuk error fatal
        if (mainContent && isFatal) {
            mainContent.style.display = 'none';
        }
    }
}

/**
 * Sembunyikan error message
 */
function hideError() {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

/**
 * Tampilkan tombol retry
 */
function showRetryButton() {
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
        retryBtn.style.display = 'inline-block';
        retryBtn.onclick = () => {
            retryBtn.style.display = 'none';
            fetchRegistrationData();
        };
    }
}

/**
 * Tampilkan toast notification
 */
function showToast(message, type = 'success') {
    // Hapus toast sebelumnya
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
    
    // Buat toast baru
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Styling toast
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        background: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: '10000',
        animation: 'slideIn 0.3s ease',
        borderLeft: `5px solid ${type === 'success' ? '#10b981' : '#ef4444'}`,
        maxWidth: '350px',
        fontSize: '14px'
    });
    
    document.body.appendChild(toast);
    
    // Hapus toast setelah 4 detik
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// ==============================================
// INISIALISASI HALAMAN
// ==============================================

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Tombol bahasa
    const langBtn = document.getElementById('langBtn');
    if (langBtn) {
        langBtn.addEventListener('click', switchLanguage);
    }
    
    // Tombol download
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadRegistrationCard);
    }
    
    // Tombol share
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareCard);
    }
    
    // Tombol home
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.href = "index.html";
        });
    }
    
    // Tombol admin (jika ada parameter admin)
    const adminLink = document.getElementById('adminLink');
    if (adminLink && params.get('admin') === 'true') {
        adminLink.style.display = 'flex';
        adminLink.addEventListener('click', () => {
            window.location.href = "admin.html";
        });
    }
    
    // Tombol retry
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            retryBtn.style.display = 'none';
            fetchRegistrationData();
        });
    }
    
    // Tombol back di error
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = "index.html";
        });
    }
    
    console.log("Event listeners berhasil di-setup");
}

/**
 * Inisialisasi aplikasi
 */
function initializeApp() {
    console.log("=== Inisialisasi Aplikasi Registrasi ===");
    
    // 1. Cek dukungan browser
    if (typeof QRCode === 'undefined') {
        showError("Browser tidak mendukung fitur QR Code. Silakan gunakan browser terbaru.", true);
        return;
    }
    
    if (typeof html2canvas === 'undefined') {
        showError("Fitur download kartu tidak tersedia. Silakan refresh halaman.", false);
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) downloadBtn.style.display = 'none';
    }
    
    // 2. Setup bahasa
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && ['id', 'en', 'ja'].includes(savedLang)) {
        currentLang = savedLang;
    } else {
        // Deteksi bahasa browser
        const browserLang = navigator.language.substring(0, 2);
        if (['id', 'en', 'ja'].includes(browserLang)) {
            currentLang = browserLang;
        }
    }
    
    applyTranslations(currentLang);
    
    // 3. Setup event listeners
    setupEventListeners();
    
    // 4. Fetch data dari server
    if (validateId()) {
        // Delay kecil untuk memastikan DOM siap
        setTimeout(() => {
            fetchRegistrationData();
        }, 300);
    }
    
    console.log("Aplikasi berhasil diinisialisasi dengan bahasa:", currentLang);
}

// ==============================================
// EVENT LISTENER UNTUK LOAD HALAMAN
// ==============================================

// Tunggu sampai DOM sepenuhnya dimuat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM sudah dimuat
    initializeApp();
}

// Tangani error global
window.addEventListener('error', function(event) {
    console.error("Global error:", event.error);
    showToast("Terjadi kesalahan tak terduga. Silakan refresh halaman.", 'error');
});

// Tangani saat halaman akan di-unload
window.addEventListener('beforeunload', function(event) {
    if (isLoading) {
        // Tampilkan konfirmasi jika masih loading
        event.preventDefault();
        event.returnValue = "Data sedang dimuat. Yakin ingin meninggalkan halaman?";
    }
});

// ==============================================
// FUNGSI TAMBAHAN UNTUK DEBUG
// ==============================================

/**
 * Fungsi untuk debugging - tampilkan semua data
 */
function debugShowAllData() {
    console.log("=== DEBUG INFO ===");
    console.log("ID from URL:", id);
    console.log("Current language:", currentLang);
    console.log("Registration data:", regData);
    console.log("All URL params:", Object.fromEntries(params.entries()));
    console.log("Script URL:", SCRIPT_URL);
    console.log("===================");
}

// Ekspos fungsi debug ke global scope untuk debugging di console
window.debug = {
    showData: debugShowAllData,
    reloadData: fetchRegistrationData,
    switchLang: switchLanguage,
    getCurrentLang: () => currentLang
};
