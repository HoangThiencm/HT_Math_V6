// HT_MATH_WEB Frontend JavaScript
// Tác giả: Hoàng Tấn Thiên

// ===== CẤU HÌNH =====
const DEFAULT_API_ENDPOINT = 'https://your-app.hf.space'; // Thay bằng URL Hugging Face Space của bạn
let API_ENDPOINT = localStorage.getItem('apiEndpoint') || DEFAULT_API_ENDPOINT;
let AUTH_TOKEN = localStorage.getItem('authToken') || null;
let CURRENT_USER = JSON.parse(localStorage.getItem('currentUser') || 'null');

// ===== KHỞI TẠO =====
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadConfig();
    setupEventListeners();
    loadModels();
});

function setupEventListeners() {
    // File input change
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            handleConvert();
        }
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            handleReset();
        }
        if (e.ctrlKey && e.key === 'v') {
            // Handle paste in result textarea
            if (document.activeElement.id === 'resultText') {
                e.preventDefault();
                handlePasteImage();
            }
        }
    });
    
    // Paste image
    document.addEventListener('paste', (e) => {
        if (e.clipboardData && e.clipboardData.items) {
            const items = Array.from(e.clipboardData.items);
            const imageItem = items.find(item => item.type.indexOf('image') !== -1);
            if (imageItem) {
                e.preventDefault();
                handlePasteImage();
            }
        }
    });
}

// ===== AUTHENTICATION =====
function checkAuth() {
    if (AUTH_TOKEN && CURRENT_USER) {
        showMainApp();
    } else {
        showAuthSection();
    }
}

function showAuthSection() {
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
}

function showMainApp() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
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
    
    if (!email || !password) {
        alert('Vui lòng nhập đầy đủ thông tin');
        return;
    }
    
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
            showMainApp();
            updateStatus('Đăng nhập thành công');
        } else {
            alert('Đăng nhập thất bại: ' + (data.detail || data.message));
        }
    } catch (error) {
        alert('Lỗi đăng nhập: ' + error.message);
    }
}

async function handleRegister() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!email || !password) {
        alert('Vui lòng nhập đầy đủ thông tin');
        return;
    }
    
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
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            showLogin();
            document.getElementById('loginEmail').value = email;
        } else {
            alert('Đăng ký thất bại: ' + (data.detail || data.message));
        }
    } catch (error) {
        alert('Lỗi đăng ký: ' + error.message);
    }
}

function handleLogout() {
    AUTH_TOKEN = null;
    CURRENT_USER = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showAuthSection();
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
}

function loadConfig() {
    const saved = localStorage.getItem('apiEndpoint');
    if (saved) {
        API_ENDPOINT = saved;
    }
}

async function loadModels() {
    try {
        const response = await fetch(`${API_ENDPOINT}/api/models`);
        const data = await response.json();
        
        const select = document.getElementById('modelSelect');
        select.innerHTML = '';
        data.models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Lỗi tải models:', error);
    }
}

// ===== FILE HANDLING =====
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('filePath').value = file.name;
        updateStatus(`Đã chọn file: ${file.name}`);
    }
}

async function handlePasteImage() {
    try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
            if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
                const blob = await item.getType('image/png');
                const file = new File([blob], 'pasted-image.png', { type: 'image/png' });
                
                // Tạo DataTransfer để set file vào input
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                document.getElementById('fileInput').files = dataTransfer.files;
                
                document.getElementById('filePath').value = 'Ảnh từ clipboard';
                updateStatus('Đã dán ảnh từ clipboard');
                return;
            }
        }
        alert('Clipboard không có dữ liệu ảnh');
    } catch (error) {
        console.error('Lỗi dán ảnh:', error);
        alert('Lỗi dán ảnh: ' + error.message);
    }
}

function handleScreenshot() {
    const screenshotInput = document.getElementById('screenshotInput');
    screenshotInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            document.getElementById('fileInput').files = dataTransfer.files;
            document.getElementById('filePath').value = 'Ảnh chụp màn hình';
            updateStatus('Đã chọn ảnh chụp màn hình');
        }
    };
    screenshotInput.click();
}

// ===== CONVERSION =====
async function handleConvert() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Vui lòng chọn file hoặc dán/chụp ảnh');
        return;
    }
    
    const model = document.getElementById('modelSelect').value;
    const mode = document.querySelector('input[name="mode"]:checked').value;
    
    updateStatus('Đang xử lý...');
    updateProgress(0);
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
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Lỗi xử lý file');
        }
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('resultText').value = data.result;
            updateProgress(100);
            updateStatus(`Đã hoàn thành xử lý ${data.pages_processed} trang!`);
        } else {
            throw new Error(data.message || 'Lỗi không xác định');
        }
    } catch (error) {
        updateStatus('Lỗi: ' + error.message);
        alert('Lỗi xử lý: ' + error.message);
    }
}

// ===== EXPORT =====
function handleReset() {
    document.getElementById('fileInput').value = '';
    document.getElementById('filePath').value = '';
    document.getElementById('resultText').value = '';
    updateProgress(0);
    updateStatus('Sẵn sàng');
}

function handleCopyText() {
    const text = document.getElementById('resultText').value;
    if (!text.trim()) {
        alert('Không có nội dung để copy');
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        updateStatus('Đã copy văn bản vào clipboard!');
        alert('Đã sao chép văn bản vào clipboard!');
    }).catch(err => {
        alert('Lỗi copy: ' + err.message);
    });
}

async function handleExportWord() {
    const text = document.getElementById('resultText').value;
    if (!text.trim()) {
        alert('Không có nội dung để xuất');
        return;
    }
    
    // Tạo file Markdown tạm
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    
    updateStatus('Đã tải file Markdown. Bạn có thể mở bằng Word hoặc Pandoc để chuyển sang DOCX.');
}

async function handleExportWordLatex() {
    const text = document.getElementById('resultText').value;
    if (!text.trim()) {
        alert('Không có nội dung để xuất');
        return;
    }
    
    // Tạo file Markdown tạm
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `latex_document_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    
    updateStatus('Đã tải file Markdown. Bạn có thể mở bằng Word hoặc Pandoc để chuyển sang DOCX.');
}

// ===== UI HELPERS =====
function updateStatus(message) {
    document.getElementById('statusLabel').textContent = message;
}

function updateProgress(percent) {
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressText').textContent = percent + '%';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('configModal');
    if (event.target === modal) {
        closeConfig();
    }
}

