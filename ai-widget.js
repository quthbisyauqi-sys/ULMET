// ==========================================
// ULMET AI Assistant Floating Widget
// ==========================================

const AI_WIDGET_HTML = `
<!-- AI Chat Panel -->
<div id="ai-panel" class="fixed bottom-24 right-6 w-[380px] h-[550px] max-h-[80vh] max-w-[calc(100vw-48px)] bg-slate-900 border border-blue-800/60 rounded-3xl shadow-2xl z-[90] flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right scale-0 opacity-0 pointer-events-none" ondragenter="aiHandleDragOver(event)" ondragover="aiHandleDragOver(event)" ondragleave="aiHandleDragLeave(event)" ondrop="aiHandleDrop(event)">
    
    <!-- Header -->
    <div class="bg-blue-950/80 backdrop-blur px-5 py-4 flex items-center justify-between border-b border-blue-800/60 flex-shrink-0 cursor-pointer" onclick="toggleAIWidget()">
        <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-lg shadow-sm text-blue-950 font-bold">🤖</div>
            <div>
                <h3 class="text-white font-bold text-sm leading-tight">AI Asisten ULMET</h3>
                <p class="text-[10px] text-green-400 font-semibold flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online (Gemini 3.8)</p>
            </div>
        </div>
        <div class="flex items-center gap-2">
            <button onclick="event.stopPropagation(); document.getElementById('ai-api-modal').classList.remove('hidden')" class="text-blue-300 hover:text-white p-1" title="Pengaturan API">⚙️</button>
            <button class="text-blue-300 hover:text-white text-xl leading-none px-1">&times;</button>
        </div>
    </div>

    <!-- Chat Area -->
    <div id="ai-chat-container" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 to-blue-950/20 scroll-smooth">
        <!-- Welcome Message -->
        <div class="flex gap-3">
            <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm flex-shrink-0 border border-blue-500 shadow-sm">🤖</div>
            <div class="bg-blue-900/40 border border-blue-800/50 rounded-2xl rounded-tl-sm p-3 text-[13px] text-blue-100 shadow-sm">
                Halo! Aku AI pendamping belajarmu di ULMET. Ada materi yang mau dibahas atau tugas yang membingungkan?
            </div>
        </div>
    </div>

    <!-- Input Area -->
    <div class="bg-slate-900 border-t border-blue-800/50 p-3 flex-shrink-0">
        <div id="ai-file-preview" class="hidden mb-2 px-3 py-1.5 bg-blue-900/50 border border-blue-700/50 rounded-lg flex items-center justify-between">
            <div class="flex items-center gap-2 overflow-hidden">
                <span class="text-xs">📄</span>
                <span id="ai-file-name" class="text-[11px] text-white truncate max-w-[200px]">file.pdf</span>
            </div>
            <button onclick="aiRemoveFile()" class="text-red-400 hover:text-red-300 text-sm font-bold">&times;</button>
        </div>
        
        <div class="flex items-end gap-2 bg-blue-950/40 border border-blue-700/50 rounded-2xl p-1.5 focus-within:border-yellow-400/50 transition-colors">
            <input type="file" id="ai-file-upload" class="hidden" accept=".pdf,.doc,.docx,.txt" onchange="aiHandleFile(event)">
            <button onclick="aiOpenUlmetFilesModal()" class="w-9 h-9 rounded-xl flex items-center justify-center text-blue-400 hover:text-white hover:bg-blue-800/50 transition flex-shrink-0" title="Pilih File dari ULMET">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
            </button>
            <textarea id="ai-chat-input" rows="1" class="flex-1 bg-transparent text-white text-[13px] px-2 py-2 resize-none outline-none max-h-24 placeholder-blue-600/70" placeholder="Ketik pesan..." onkeydown="aiHandleEnter(event)"></textarea>
            <button onclick="aiSendMessage()" class="w-9 h-9 rounded-xl flex items-center justify-center bg-yellow-400 hover:bg-yellow-300 text-blue-950 transition flex-shrink-0 shadow-md">
                <svg class="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19V6m0 0l-8 8m8-8l8 8"></path></svg>
            </button>
        </div>
        <div class="flex justify-between items-center mt-2 px-1">
            <span class="text-[9px] text-blue-500">Google Gemini 3.8 Flash</span>
            <button onclick="aiClearChat()" class="text-[9px] text-red-400 hover:text-red-300 transition">Hapus Obrolan</button>
        </div>
    </div>
</div>

<!-- API KEY MODAL (Widget) -->
<div id="ai-api-modal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-blue-700/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
        <button onclick="document.getElementById('ai-api-modal').classList.add('hidden')" class="absolute top-4 right-4 text-blue-500 hover:text-white text-xl leading-none">&times;</button>
        <h3 class="text-white font-bold text-base mb-2">🔑 Pengaturan AI</h3>
        
        <div class="bg-blue-950/50 border border-blue-800/50 rounded-xl p-3 mb-4 text-[11px] text-blue-200 space-y-2">
            <p class="font-bold text-blue-100">Cara mendapatkan API Key (Gratis):</p>
            <ol class="list-decimal list-inside space-y-1">
                <li>Buka <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-yellow-400 hover:underline font-semibold">Google AI Studio ↗</a> dan login.</li>
                <li>Klik tombol <strong>"Create API key"</strong>.</li>
                <li>Pilih project atau buat baru, lalu klik "Create".</li>
                <li>Copy (salin) kode yang muncul dan Paste ke kotak di bawah.</li>
            </ol>
        </div>

        <p class="text-[11px] text-blue-300 mb-2 leading-relaxed">Masukkan API Key Anda:</p>
        <input type="password" id="ai-api-key-input" placeholder="AIzaSyB..." class="w-full bg-slate-950/70 border border-blue-700/50 focus:border-yellow-400 rounded-xl px-3 py-2 text-sm text-white outline-none mb-4">
        <button onclick="aiSaveApiKey()" class="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold py-2 rounded-xl text-sm transition">Simpan API Key</button>
    </div>
</div>

<!-- ULMET FILES MODAL (Widget) -->
<div id="ai-ulmet-files-modal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-blue-700/60 rounded-3xl p-6 max-w-md w-full shadow-2xl relative flex flex-col max-h-[70vh]">
        <button onclick="document.getElementById('ai-ulmet-files-modal').classList.add('hidden')" class="absolute top-4 right-4 text-blue-500 hover:text-white text-xl leading-none">&times;</button>
        <h3 class="text-white font-bold text-base mb-4 flex items-center gap-2"><span>📂</span> Pilih File ULMET</h3>
        <div id="ai-ulmet-files-list" class="overflow-y-auto flex-1 space-y-2">
            <!-- Files will be injected here -->
        </div>
    </div>
</div>
`;

// Inject HTML to body
const injectWidget = () => {
    if (!document.getElementById('ai-panel')) {
        document.body.insertAdjacentHTML('beforeend', AI_WIDGET_HTML);
        // Load marked.js for markdown parsing if not present
        if (typeof marked === 'undefined') {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
            document.head.appendChild(script);
        }
        
        // Add custom prose styles for widget
        const style = document.createElement('style');
        style.innerHTML = `
            .ai-prose p { margin-bottom: 0.5rem; }
            .ai-prose ul { list-style-type: disc; padding-left: 1.25rem; margin-bottom: 0.5rem; }
            .ai-prose ol { list-style-type: decimal; padding-left: 1.25rem; margin-bottom: 0.5rem; }
            .ai-prose strong { color: #fbbf24; }
            .ai-prose code { background: rgba(15, 23, 42, 0.5); padding: 2px 4px; border-radius: 4px; color: #38bdf8; font-size: 0.9em; }
            .ai-prose pre { background: rgba(15, 23, 42, 0.8); padding: 8px; border-radius: 8px; overflow-x: auto; margin-bottom: 0.5rem; font-size: 0.85em; border: 1px solid rgba(30, 58, 138, 0.5); }
        `;
        document.head.appendChild(style);

        aiInit();
    }
};

const SYSTEM_PROMPT = `Kamu adalah teman belajar dan asisten cerdas untuk ULMET. Kamu muncul sebagai widget chat melayang. Selalu gunakan format markdown. Bersikaplah ramah dan ringkas.`;

let aiChatHistory = [];
let aiPendingBase64 = null;
let aiPendingName = null;
let aiPendingMime = null;

function toggleAIWidget() {
    const panel = document.getElementById('ai-panel');
    if (panel.classList.contains('scale-0')) {
        panel.classList.remove('scale-0', 'opacity-0', 'pointer-events-none');
        panel.classList.add('scale-100', 'opacity-100');
        // Scroll to bottom
        const c = document.getElementById('ai-chat-container');
        c.scrollTop = c.scrollHeight;
    } else {
        panel.classList.remove('scale-100', 'opacity-100');
        panel.classList.add('scale-0', 'opacity-0', 'pointer-events-none');
    }
}

function aiInit() {
    const key = localStorage.getItem("ulmet_gemini_api_key");
    if (key) document.getElementById('ai-api-key-input').value = key;
    
    // Auto resize
    const tx = document.getElementById('ai-chat-input');
    tx.addEventListener("input", function() {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight < 96 ? this.scrollHeight : 96) + "px";
    });

    // Load history
    const saved = localStorage.getItem('ulmet_ai_history');
    if (saved) {
        try {
            aiChatHistory = JSON.parse(saved);
            renderHistory();
        } catch(e) { console.error(e); }
    }
}

function renderHistory() {
    // Clear except welcome message
    const c = document.getElementById('ai-chat-container');
    c.innerHTML = c.firstElementChild.outerHTML; 
    
    aiChatHistory.forEach(msg => {
        if (msg.role === 'user') {
            const text = msg.parts.find(p => p.text)?.text || '';
            const file = msg.parts.find(p => p.inline_data) ? 'File terlampir' : null;
            aiAppendMessage('user', text, file, false);
        } else {
            const text = msg.parts.find(p => p.text)?.text || '';
            aiAppendMessage('model', text, null, false);
        }
    });
    c.scrollTop = c.scrollHeight;
}

function aiSaveApiKey() {
    const key = document.getElementById('ai-api-key-input').value.trim();
    if (key) {
        localStorage.setItem("ulmet_gemini_api_key", key);
        document.getElementById('ai-api-modal').classList.add('hidden');
    }
}

function aiHandleEnter(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        aiSendMessage();
    }
}

function aiHandleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    aiPendingName = file.name;
    aiPendingMime = file.type || 'application/octet-stream';
    const reader = new FileReader();
    reader.onload = (evt) => {
        aiPendingBase64 = evt.target.result.split(',')[1];
        document.getElementById('ai-file-name').textContent = file.name;
        document.getElementById('ai-file-preview').classList.remove('hidden');
        document.getElementById('ai-file-preview').classList.add('flex');
    };
    reader.readAsDataURL(file);
}

function aiRemoveFile() {
    aiPendingBase64 = null; aiPendingName = null; aiPendingMime = null;
    document.getElementById('ai-file-upload').value = '';
    document.getElementById('ai-file-preview').classList.add('hidden');
    document.getElementById('ai-file-preview').classList.remove('flex');
}

window.aiDraggedFileId = null;

window.aiHandleDragStart = function(e, fileId) {
    window.aiDraggedFileId = fileId;
    e.dataTransfer.setData('text/plain', fileId);
    e.dataTransfer.effectAllowed = 'copy';
};

window.aiHandleDragOver = function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    document.getElementById('ai-panel').classList.add('border-yellow-400');
};

window.aiHandleDragLeave = function(e) {
    e.preventDefault();
    // Only remove border if we actually left the panel (not just hovering over a child element)
    if (!document.getElementById('ai-panel').contains(e.relatedTarget)) {
        document.getElementById('ai-panel').classList.remove('border-yellow-400');
    }
};

window.aiHandleDrop = function(e) {
    e.preventDefault();
    document.getElementById('ai-panel').classList.remove('border-yellow-400');
    
    // Check if it's a file from ULMET UI
    const fileId = window.aiDraggedFileId || e.dataTransfer.getData('text/plain');
    window.aiDraggedFileId = null; // Reset
    
    if (fileId) {
        aiSelectUlmetFile(fileId);
        return;
    }
    
    // Check if it's a file from OS
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        aiHandleFile({ target: { files: [e.dataTransfer.files[0]] } });
    }
};

window.aiOpenUlmetFilesModal = function() {
    const files = JSON.parse(localStorage.getItem('ulmet_files') || '[]');
    const container = document.getElementById('ai-ulmet-files-list');
    
    if (files.length === 0) {
        container.innerHTML = `<div class="text-center py-6 text-blue-400 text-sm">Belum ada file di ULMET. <br><br>
        <button onclick="document.getElementById('ai-file-upload').click(); document.getElementById('ai-ulmet-files-modal').classList.add('hidden')" class="px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-lg mt-2 transition">Upload dari Perangkat</button></div>`;
    } else {
        // Get unique courses (folders)
        const courses = [...new Set(files.map(f => f.course || 'Tanpa Mata Kuliah'))];
        
        container.innerHTML = courses.map(course => {
            const courseFilesCount = files.filter(f => (f.course || 'Tanpa Mata Kuliah') === course).length;
            return `
            <div onclick="aiShowUlmetFolder('${course}')" class="p-3 bg-blue-900/30 hover:bg-blue-800/50 border border-blue-800/40 rounded-xl cursor-pointer flex items-center gap-3 transition">
                <div class="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-lg border border-yellow-500/40 flex-shrink-0 text-yellow-400">\uD83D\uDCC1</div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-white font-bold truncate">${course}</p>
                    <p class="text-[10px] text-blue-400 truncate">${courseFilesCount} file</p>
                </div>
                <div class="text-blue-500 font-bold">\u276F</div>
            </div>
            `;
        }).join('') + `<div class="pt-4 border-t border-blue-800/50 mt-4"><button onclick="document.getElementById('ai-file-upload').click(); document.getElementById('ai-ulmet-files-modal').classList.add('hidden')" class="w-full py-2 bg-blue-950 hover:bg-blue-900 text-blue-300 rounded-lg transition text-sm flex items-center justify-center gap-2"><span>\uD83D\uDCE4</span> Atau Upload dari Perangkat</button></div>`;
    }
    
    // Update title
    document.querySelector('#ai-ulmet-files-modal h3').innerHTML = `<span>\uD83D\uDCC2</span> Pilih Folder Mata Kuliah`;
    document.getElementById('ai-ulmet-files-modal').classList.remove('hidden');
};

window.aiShowUlmetFolder = function(courseName) {
    const files = JSON.parse(localStorage.getItem('ulmet_files') || '[]');
    const folderFiles = files.filter(f => (f.course || 'Tanpa Mata Kuliah') === courseName);
    const container = document.getElementById('ai-ulmet-files-list');
    
    document.querySelector('#ai-ulmet-files-modal h3').innerHTML = `<button onclick="aiOpenUlmetFilesModal()" class="mr-2 text-blue-400 hover:text-white transition">\u2B05\uFE0F</button> <span>\uD83D\uDCC1</span> ${courseName}`;
    
    if (folderFiles.length === 0) {
        container.innerHTML = `<p class="text-center text-blue-400 text-sm py-4">Folder kosong.</p>`;
    } else {
        container.innerHTML = folderFiles.map(f => `
            <div onclick="aiSelectUlmetFile('${f.id}')" class="p-3 bg-blue-900/30 hover:bg-blue-800/50 border border-blue-800/40 rounded-xl cursor-pointer flex items-center gap-3 transition">
                <div class="w-8 h-8 rounded-lg bg-blue-950 flex items-center justify-center text-xs border border-blue-700/50 flex-shrink-0 text-blue-300">\uD83D\uDCC4</div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-white font-medium truncate">${f.name}</p>
                    <p class="text-[10px] text-blue-400 truncate">${f.size || ''}</p>
                </div>
            </div>
        `).join('');
    }
};

window.aiSelectUlmetFile = function(fileId) {
    const files = JSON.parse(localStorage.getItem('ulmet_files') || '[]');
    const file = files.find(f => f.id === fileId);
    if (file) {
        if (file.data || file.dataUrl) {
            aiPendingName = file.name;
            aiPendingMime = file.ext === 'pdf' ? 'application/pdf' : 'application/octet-stream';
            aiPendingBase64 = file.data || (file.dataUrl ? file.dataUrl.split(',')[1] : null);
            document.getElementById('ai-file-name').textContent = file.name;
            document.getElementById('ai-file-preview').classList.remove('hidden');
            document.getElementById('ai-file-preview').classList.add('flex');
            
            const input = document.getElementById('ai-chat-input');
            input.placeholder = "File " + file.name + " siap dikirim...";
            input.focus();
            
            document.getElementById('ai-ulmet-files-modal').classList.add('hidden');
        } else if (file.gdriveId) {
            alert("File ini hanya ada di Google Drive dan belum diunduh ke memori lokal. Silakan download dulu atau upload manual ke AI.");
        } else {
            alert("Maaf, file ini hanya contoh (dummy) bawaan aplikasi dan tidak memiliki isi asli. Silakan upload file materi Anda sendiri.");
        }
    }
};

function aiClearChat() {
    if(confirm('Hapus semua riwayat obrolan?')) {
        aiChatHistory = [];
        localStorage.removeItem('ulmet_ai_history');
        renderHistory();
    }
}

function aiAppendMessage(role, content, fileName = null, scroll = true) {
    const c = document.getElementById('ai-chat-container');
    const div = document.createElement('div');
    div.className = "flex gap-3 " + (role === 'user' ? "flex-row-reverse" : "");
    
    const avatar = document.createElement('div');
    avatar.className = `w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 shadow-sm border ${
        role === 'user' ? "bg-yellow-400 border-yellow-500 text-blue-950 font-bold" : "bg-blue-600 border-blue-500"
    }`;
    avatar.textContent = role === 'user' ? "A" : "🤖";

    const msgBox = document.createElement('div');
    msgBox.className = `border rounded-2xl p-3 text-[13px] shadow-sm ai-prose max-w-[85%] overflow-hidden ${
        role === 'user' ? "bg-blue-800/40 border-blue-700/50 text-white rounded-tr-sm" : "bg-blue-900/40 border-blue-800/50 text-blue-100 rounded-tl-sm"
    }`;

    let html = "";
    if (fileName) html += `<div class="mb-1.5 bg-blue-950/50 border border-blue-800/40 px-2 py-1 rounded text-[10px] text-blue-200 inline-flex items-center gap-1">📄 ${fileName}</div><br>`;
    
    if (role === 'user') {
        html += content.replace(/[&<>'"]/g, tag => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[tag]));
    } else {
        html += typeof marked !== 'undefined' ? marked.parse(content) : content;
    }
    
    msgBox.innerHTML = html;
    div.appendChild(avatar);
    div.appendChild(msgBox);
    c.appendChild(div);
    if (scroll) c.scrollTop = c.scrollHeight;
    
    return msgBox;
}

async function aiSendMessage() {
    const input = document.getElementById('ai-chat-input');
    const text = input.value.trim();
    const apiKey = localStorage.getItem("ulmet_gemini_api_key");

    if (!text && !aiPendingBase64) return;
    if (!apiKey) {
        document.getElementById('ai-api-modal').classList.remove('hidden');
        return;
    }

    const fname = aiPendingName;
    aiAppendMessage('user', text, fname);
    
    let parts = [];
    if (text) parts.push({ "text": text });
    if (aiPendingBase64) parts.push({
        "inline_data": { "mime_type": aiPendingMime === 'application/pdf' ? 'application/pdf' : 'text/plain', "data": aiPendingBase64 }
    });

    aiChatHistory.push({ "role": "user", "parts": parts });
    localStorage.setItem('ulmet_ai_history', JSON.stringify(aiChatHistory));

    input.value = ''; input.style.height = "auto";
    aiRemoveFile();

    const loading = aiAppendMessage('model', "⏳ ...");

    try {
        let attempt = 0, success = false, data, aiText;
        while (attempt < 3 && !success) {
            attempt++;
            if (attempt > 1) {
                loading.innerHTML = `⏳ Sibuk... (Coba ${attempt}/3)`;
                await new Promise(r => setTimeout(r, 2000));
            }
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "system_instruction": { "parts": [{ "text": SYSTEM_PROMPT }] },
                    "contents": aiChatHistory,
                    "generationConfig": { "temperature": 0.7, "maxOutputTokens": 2048 }
                })
            });
            data = await res.json();
            if (res.ok) {
                success = true; aiText = data.candidates[0].content.parts[0].text;
            } else {
                const err = data.error?.message || "";
                if (err.toLowerCase().includes("quota") || err.toLowerCase().includes("rate limit")) {
                    throw new Error("⏳ Wah, API Key Anda mencapai batas penggunaan (Quota Exceeded). Harap tunggu sekitar 15-30 detik lalu coba lagi!");
                }
                if (!err.toLowerCase().includes("high demand") && !err.toLowerCase().includes("overloaded")) throw new Error(err || "Gagal");
                if (attempt === 3) throw new Error("Server AI masih kepenuhan.");
            }
        }
        
        aiChatHistory.push({ "role": "model", "parts": [{ "text": aiText }] });
        localStorage.setItem('ulmet_ai_history', JSON.stringify(aiChatHistory));
        
        loading.innerHTML = marked.parse(aiText);
        const c = document.getElementById('ai-chat-container');
        c.scrollTop = c.scrollHeight;
    } catch (e) {
        loading.innerHTML = `<span class="text-red-400">${e.message}</span>`;
        aiChatHistory.pop();
        localStorage.setItem('ulmet_ai_history', JSON.stringify(aiChatHistory));
    }
}

// Attach immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWidget);
} else {
    injectWidget();
}
