// HT_MATH_WEB Frontend JavaScript v6.1 (Modern SPA Fix)

// ===== CẤU HÌNH =====
const DEFAULT_API_ENDPOINT = 'https://hoangthiencm-giangbai.hf.space'; 
let API_ENDPOINT = localStorage.getItem('apiEndpoint') || DEFAULT_API_ENDPOINT;
let AUTH_TOKEN = localStorage.getItem('authToken') || null;
let CURRENT_USER = JSON.parse(localStorage.getItem('currentUser') || 'null');

// ===== KHỞI TẠO =====
document.addEventListener('DOMContentLoaded', () => {
    // Chạy kiểm tra đăng nhập NGAY LẬP TỨC
    checkAuth();
    
    // Sau đó mới khởi tạo các thứ khác
    loadConfig();
    setupEventListeners();
    
    // Nếu đã đăng nhập thì mới load model để tránh lỗi mạng
    if (AUTH_TOKEN) {
        loadModels();
    }
});

function setupEventListeners() {
    // File input change
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.addEventListener('change', handleFileSelect);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (!AUTH_TOKEN) return; // Không cho dùng phím tắt nếu chưa login
        
        if (e.ctrlKey && e.key === 'r') { e.preventDefault(); handleConvert(); }
        if (e.ctrlKey && e.key === 'k') { e.preventDefault(); handleReset(); }
        if (e.ctrlKey && e.key === 'v') {
            if (document.activeElement.id === 'resultText') { e.preventDefault(); handlePasteImage(); }
        }
    });
    
    // Paste image
    document.addEventListener('paste', (e) => {
        if (!AUTH_TOKEN) return;
        if (e.clipboardData && e.clipboardData.items) {
            const items = Array.from(e.clipboardData.items);
            const imageItem = items.find(item => item.type.indexOf('image') !== -1);
            if (imageItem) { e.preventDefault(); handlePasteImage(); }
        }
    });
}

// ===== AUTHENTICATION LOGIC (QUAN TRỌNG) =====
function checkAuth() {
    const authSection = document.getElementById('authSection');
    const mainApp = document.getElementById('mainApp');

    if (AUTH_TOKEN && CURRENT_USER) {
        // Đã đăng nhập: Ẩn Login, Hiện App
        authSection.style.display = 'none';
        mainApp.style.display = 'grid'; // Dùng grid vì CSS dashboard là grid
        
        // Cập nhật email người dùng
        updateStatus(`Xin chào, ${CURRENT_USER.email}`);
    } else {
        // Chưa đăng nhập: Hiện Login (flex), Ẩn App
        authSection.style.display = 'flex';
        mainApp.style.display = 'none';
    }
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) { alert('Vui lòng nhập đầy đủ thông tin'); return; }
    
    // Loading state
    const btn = document.querySelector('#loginForm button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    btn.disabled = true;
    
    try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        
        const response = await fetch(`${API_ENDPOINT}/api/login`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            AUTH_TOKEN = data.token;
            CURRENT_USER = { email: data.email };
            localStorage.setItem('authToken', AUTH_TOKEN);
            localStorage.setItem('currentUser', JSON.stringify(CURRENT_USER));
            
            // Chuyển ngay vào app
            checkAuth();
            loadModels(); // Tải model sau khi login
        } else {
            alert('Đăng nhập thất bại: ' + (data.detail || data.message));
        }
    } catch (error) {
        alert('Lỗi đăng nhập: ' + error.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function handleRegister() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!email || !password) { alert('Vui lòng nhập đầy đủ thông tin'); return; }
    
    const btn = document.querySelector('#registerForm button');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    btn.disabled = true;
    
    try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        
        const response = await fetch(`${API_ENDPOINT}/api/register`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Đăng ký thành công! Vui lòng chờ Admin duyệt và đăng nhập lại.');
            showLogin();
        } else {
            alert('Đăng ký thất bại: ' + (data.detail || data.message));
        }
    } catch (error) {
        alert('Lỗi đăng ký: ' + error.message);
    } finally {
        btn.innerHTML = 'Đăng ký tài khoản';
        btn.disabled = false;
    }
}

function handleLogout() {
    AUTH_TOKEN = null;
    CURRENT_USER = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    checkAuth(); // Quay về màn hình login
}

// ===== CONFIG =====
function showConfig() {
    document.getElementById('configModal').style.display = 'flex';
    document.getElementById('apiEndpoint').value = API_ENDPOINT;
}

function closeConfig() {
    document.getElementById('configModal').style.display = 'none';
}

function saveConfig() {
    API_ENDPOINT = document.getElementById('apiEndpoint').value || DEFAULT_API_ENDPOINT;
    localStorage.setItem('apiEndpoint', API_ENDPOINT);
    updateStatus('Đã lưu cấu hình');
    closeConfig();
    // Reload lại trang để áp dụng
    location.reload();
}

function loadConfig() {
    const saved = localStorage.getItem('apiEndpoint');
    if (saved) API_ENDPOINT = saved;
}

async function loadModels() {
    try {
        const response = await fetch(`${API_ENDPOINT}/api/models`);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        
        const select = document.getElementById('modelSelect');
        if (!select) return;
        
        select.innerHTML = '';
        const models = (data.models && data.models.length > 0) ? data.models : ['gemini-3-flash-preview', 'gemini-2.5-flash'];
        
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            select.appendChild(option);
        });
    } catch (error) {
        console.warn('Không tải được model, dùng mặc định.');
        const select = document.getElementById('modelSelect');
        if (select) {
            select.innerHTML = '<option value="gemini-3-flash-preview">Gemini 3.0 Flash</option>';
        }
    }
}

// ===== FILE HANDLING & CONVERSION =====
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('filePath').value = file.name;
        updateStatus(`Đã chọn: ${file.name}`);
    }
}

async function handlePasteImage() {
    try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
            if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
                const blob = await item.getType('image/png');
                const file = new File([blob], 'pasted.png', { type: 'image/png' });
                const dt = new DataTransfer();
                dt.items.add(file);
                document.getElementById('fileInput').files = dt.files;
                document.getElementById('filePath').value = 'Ảnh từ clipboard';
                updateStatus('Đã dán ảnh');
                return;
            }
        }
        alert('Không tìm thấy ảnh trong clipboard');
    } catch (e) { alert('Lỗi dán ảnh: ' + e.message); }
}

function handleScreenshot() {
    document.getElementById('screenshotInput').click();
}
document.getElementById('screenshotInput').onchange = (e) => {
    if (e.target.files[0]) {
        const dt = new DataTransfer();
        dt.items.add(e.target.files[0]);
        document.getElementById('fileInput').files = dt.files;
        document.getElementById('filePath').value = 'Ảnh chụp';
        updateStatus('Đã chụp ảnh');
    }
};

async function handleConvert() {
    const file = document.getElementById('fileInput').files[0];
    if (!file) { alert('Vui lòng chọn file!'); return; }
    
    const model = document.getElementById('modelSelect').value;
    const mode = document.querySelector('input[name="mode"]:checked').value;
    
    updateStatus('Đang xử lý...');
    updateProgress(10);
    document.getElementById('resultText').value = '';
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', model);
        formData.append('mode', mode);
        
        const response = await fetch(`${API_ENDPOINT}/api/convert`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Lỗi từ Server');
        
        const data = await response.json();
        if (data.success) {
            document.getElementById('resultText').value = data.result;
            updateProgress(100);
            updateStatus(`Hoàn thành! (${data.pages_processed || 1} trang)`);
        } else {
            throw new Error(data.message);
        }
    } catch (e) {
        updateStatus('Lỗi: ' + e.message);
        alert('Lỗi xử lý: ' + e.message);
        updateProgress(0);
    }
}

// ===== UTILS =====
function handleReset() {
    document.getElementById('fileInput').value = '';
    document.getElementById('filePath').value = '';
    document.getElementById('resultText').value = '';
    updateProgress(0);
    updateStatus('Sẵn sàng');
}

function handleCopyText() {
    const text = document.getElementById('resultText').value;
    if(text) navigator.clipboard.writeText(text);
    updateStatus('Đã copy!');
}

async function handleExportWord() {
    const text = document.getElementById('resultText').value;
    if(!text) return;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `convert_${Date.now()}.md`;
    a.click();
}

async function handleExportWordLatex() {
    handleExportWord(); // Tạm thời dùng chung logic export markdown
}

function updateStatus(msg) {
    const el = document.getElementById('keyStatus');
    if(el) el.textContent = msg;
}

function updateProgress(percent) {
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressText').textContent = percent + '%';
}

// Close modal click outside
window.onclick = function(event) {
    if (event.target === document.getElementById('configModal')) closeConfig();
}
