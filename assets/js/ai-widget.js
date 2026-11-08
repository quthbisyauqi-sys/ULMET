// ==========================================
// ULMET AI Assistant Floating Widget (SnifoxAI Gateway Multi-Model)
// ==========================================

const SNIFOX_ENDPOINT = 'https://core.snifoxai.com/v1/chat/completions';
const DEFAULT_SNIFOX_KEY = 'snfx-rcENe1gqyQLhifbgRQjW8ajvKju8oKWjidv8fCMaQ7GMG';
const DEFAULT_MODEL = 'openai/gpt-5.5';

const AI_WIDGET_HTML = `
<!-- AI Chat Panel -->
<div id="ai-panel" class="fixed bottom-24 right-4 sm:right-6 w-[390px] h-[560px] max-h-[82vh] max-w-[calc(100vw-32px)] bg-slate-900 border border-blue-700/60 rounded-3xl shadow-2xl z-[90] flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right scale-0 opacity-0 pointer-events-none" ondragenter="aiHandleDragOver(event)" ondragover="aiHandleDragOver(event)" ondragleave="aiHandleDragLeave(event)" ondrop="aiHandleDrop(event)">
    
    <!-- Header -->
    <div class="bg-blue-950/90 backdrop-blur px-4 py-3 flex items-center justify-between border-b border-blue-800/60 flex-shrink-0 cursor-pointer" onclick="toggleAIWidget()">
        <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-xl bg-yellow-400 flex items-center justify-center text-base shadow-sm text-blue-950 font-bold flex-shrink-0">🤖</div>
            <div class="min-w-0">
                <h3 class="text-white font-bold text-xs sm:text-sm leading-tight flex items-center gap-1.5 truncate">
                    <span>AI ULMET</span>
                    <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">Snifox</span>
                </h3>
                <p class="text-[10px] text-blue-300 truncate flex items-center gap-1 font-mono" id="ai-header-model-label">GPT-5.5</p>
            </div>
        </div>
        
        <div class="flex items-center gap-1.5" onclick="event.stopPropagation()">
            <!-- Mini Model Switcher -->
            <select id="ai-widget-header-model" onchange="aiChangeModel(this.value)" class="bg-slate-900/90 border border-blue-700/60 text-yellow-400 text-[10px] font-bold rounded-lg px-2 py-1 outline-none cursor-pointer max-w-[125px] truncate">
                <option value="openai/gpt-5.5">🚀 GPT-5.5</option>
                <option value="google/gemini-2.5-flash">⚡ Gemini 2.5</option>
                <option value="anthropic/claude-opus-4.7">👑 Claude Opus</option>
            </select>
            
            <button onclick="document.getElementById('ai-api-modal').classList.remove('hidden')" class="text-blue-300 hover:text-white p-1 text-sm hover:bg-blue-800/40 rounded-lg transition" title="Pengaturan AI & API Key">⚙️</button>
            <button onclick="toggleAIWidget()" class="text-blue-300 hover:text-white text-lg leading-none p-1 hover:bg-blue-800/40 rounded-lg transition">&times;</button>
        </div>
    </div>

    <!-- Chat Area -->
    <div id="ai-chat-container" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 via-blue-950/20 to-slate-900 scroll-smooth">
        <!-- Welcome Message -->
        <div class="flex gap-3">
            <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-sm flex-shrink-0 border border-blue-500 shadow-sm">🤖</div>
            <div class="bg-blue-950/60 border border-blue-800/50 rounded-2xl rounded-tl-sm p-3 text-[12px] text-blue-100 shadow-sm leading-relaxed">
                <p class="font-bold text-white mb-1 flex items-center gap-1.5">
                    Halo! Saya AI ULMET.
                    <span class="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">SnifoxAI</span>
                </p>
                <p class="text-blue-200/90">Ada materi kuliah yang mau dibahas, tugas yang membingungkan, atau butuh bantuan rangkuman?</p>
                <p class="text-[10px] text-blue-400 mt-2 pt-2 border-t border-blue-800/40">Model aktif: <b id="ai-welcome-model" class="text-yellow-400 font-mono">GPT-5.5</b></p>
            </div>
        </div>
    </div>

    <!-- Input Area -->
    <div class="bg-slate-900 border-t border-blue-800/50 p-3 flex-shrink-0">
        <div id="ai-file-preview" class="hidden mb-2 px-3 py-1.5 bg-blue-950/70 border border-blue-700/50 rounded-xl flex items-center justify-between">
            <div class="flex items-center gap-2 overflow-hidden">
                <span class="text-xs text-yellow-400">📄</span>
                <span id="ai-file-name" class="text-[11px] text-white truncate max-w-[220px]">file.pdf</span>
            </div>
            <button onclick="aiRemoveFile()" class="text-red-400 hover:text-red-300 text-sm font-bold">&times;</button>
        </div>
        
        <div class="flex items-end gap-2 bg-blue-950/50 border border-blue-700/50 rounded-2xl p-1.5 focus-within:border-yellow-400/60 focus-within:bg-blue-950/80 transition-colors shadow-inner">
            <input type="file" id="ai-file-upload" class="hidden" accept=".pdf,.doc,.docx,.txt" onchange="aiHandleFile(event)">
            <button onclick="aiOpenUlmetFilesModal()" class="w-9 h-9 rounded-xl flex items-center justify-center text-blue-400 hover:text-white hover:bg-blue-800/50 transition flex-shrink-0" title="Pilih File dari ULMET">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
            </button>
            <textarea id="ai-chat-input" rows="1" class="flex-1 bg-transparent text-white text-[13px] px-2 py-2 resize-none outline-none max-h-24 placeholder-blue-600/70" placeholder="Ketik pesan..." onkeydown="aiHandleEnter(event)"></textarea>
            <button onclick="aiSendMessage()" class="w-9 h-9 rounded-xl flex items-center justify-center bg-yellow-400 hover:bg-yellow-300 text-blue-950 transition flex-shrink-0 shadow-md active:scale-95">
                <svg class="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19V6m0 0l-8 8m8-8l8 8"></path></svg>
            </button>
        </div>
        
        <div class="flex justify-between items-center mt-2 px-1">
            <span id="ai-widget-model-badge" class="text-[9px] text-blue-400 font-mono truncate max-w-[200px]">openai/gpt-5.5</span>
            <button onclick="aiClearChat()" class="text-[9px] text-red-400 hover:text-red-300 transition">Hapus Obrolan</button>
        </div>
    </div>
</div>

<!-- API KEY & MODEL SETTINGS MODAL (Widget) -->
<div id="ai-api-modal" class="hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-blue-700/60 rounded-3xl p-5 max-w-sm w-full shadow-2xl relative space-y-3.5">
        <button onclick="document.getElementById('ai-api-modal').classList.add('hidden')" class="absolute top-4 right-4 text-blue-400 hover:text-white text-xl leading-none">&times;</button>
        
        <div class="flex items-center gap-2">
            <span class="text-xl">🦊</span>
            <div>
                <h3 class="text-white font-bold text-sm">Pengaturan SnifoxAI</h3>
                <p class="text-[10px] text-blue-400">Gateway Multi-Model AI ULMET</p>
            </div>
        </div>

        <!-- Info Akun Snifox -->
        <div class="bg-blue-950/70 border border-blue-800/60 rounded-xl p-3 text-[11px] text-blue-200 space-y-1">
            <div class="flex items-center justify-between">
                <span class="font-bold text-yellow-400">Status Gateway: Ready</span>
                <span class="text-[10px] text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">$1.00 PAYG</span>
            </div>
            <p class="text-[10px] text-slate-300 font-mono truncate">Akun: <span class="text-yellow-300">quthbisyauqi@gmail.com</span></p>
            <p class="text-[10px] text-slate-400 font-mono truncate">Host: https://core.snifoxai.com/v1</p>
        </div>

        <!-- Pilihan Model Default -->
        <div>
            <label class="block text-[11px] font-semibold text-blue-200 mb-1">Pilih Model Utama:</label>
            <select id="ai-modal-model-select" class="w-full bg-slate-950 border border-blue-700/60 rounded-xl px-3 py-2 text-xs text-yellow-400 font-medium outline-none">
                <option value="openai/gpt-5.5">🚀 GPT-5.5 (OpenAI)</option>
                <option value="google/gemini-2.5-flash">⚡ Gemini Flash 2.5 (Google)</option>
                <option value="anthropic/claude-opus-4.7">👑 Claude Opus 4.7 (Anthropic)</option>
            </select>
        </div>

        <!-- API Key Input -->
        <div>
            <div class="flex items-center justify-between mb-1">
                <label class="text-[11px] font-semibold text-blue-200">API Key Snifox:</label>
                <button type="button" onclick="aiToggleModalPwd()" class="text-[10px] text-yellow-400 hover:underline">Lihat / Sembunyikan</button>
            </div>
            <input type="password" id="ai-api-key-input" placeholder="snfx-..." class="w-full bg-slate-950 border border-blue-700/60 focus:border-yellow-400 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none">
        </div>

        <!-- Result Box Test -->
        <div id="ai-widget-test-result" class="hidden p-2.5 rounded-xl text-[11px] leading-relaxed"></div>

        <!-- Actions -->
        <div class="flex gap-2 pt-1">
            <button type="button" id="ai-btn-test" onclick="aiTestApiConnection()" class="flex-1 bg-blue-900/60 hover:bg-blue-800 border border-blue-700/50 text-blue-200 font-bold py-2 rounded-xl text-xs transition">
                ⚡ Uji Koneksi
            </button>
            <button type="button" onclick="aiSaveApiKey()" class="flex-1 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold py-2 rounded-xl text-xs transition shadow-md">
                💾 Simpan
            </button>
        </div>
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
        // Load pdf.js for reading PDF documents
        if (typeof pdfjsLib === 'undefined') {
            const scriptPdf = document.createElement('script');
            scriptPdf.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            scriptPdf.onload = () => {
                if (typeof pdfjsLib !== 'undefined') {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                }
            };
            document.head.appendChild(scriptPdf);
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

const SYSTEM_PROMPT = `Kamu adalah teman belajar dan asisten cerdas untuk ULMET (Aplikasi Manajemen Kuliah Mahasiswa).
Kamu muncul sebagai widget chat melayang yang cepat dan responsif.
Karakter: Ramah, santai, cerdas, suportif layaknya teman kuliah cerdas.
Bantu mahasiswa berdiskusi tentang materi kuliah, menjawab tugas, merangkum poin penting, dan menjelaskan fitur ULMET.
Jika ada dokumen terlampir pada pesan mahasiswa di bagian [DOKUMEN TERLAMPIR: "..."], BACA DENGAN SEKSAMA isi teks dokumen tersebut dan langsung jawab pertanyaan mahasiswa atau rangkum berdasarkan isi dokumen tersebut. Jangan pernah bilang kamu tidak bisa melihat dokumennya.
Selalu gunakan format markdown yang ringkas dan rapi dengan bullet point dan emoji secukupnya.`;

let aiChatHistory = []; // format OpenAI: [{role: 'user'|'assistant', content: '...'}]
let aiPendingBase64 = null;
let aiPendingName = null;
let aiPendingMime = null;
let aiPendingText = null;

function aiGetApiKey() {
    const key = localStorage.getItem("ulmet_snifox_api_key");
    if (!key || key.includes('rcENc1') || key.includes('RQjw8')) {
        localStorage.setItem("ulmet_snifox_api_key", DEFAULT_SNIFOX_KEY);
        return DEFAULT_SNIFOX_KEY;
    }
    return key.trim();
}

const AI_ALLOWED_MODELS = ['openai/gpt-5.5', 'google/gemini-2.5-flash', 'anthropic/claude-opus-4.7'];

function aiGetModel() {
    const saved = localStorage.getItem("ulmet_ai_model");
    if (!saved || !AI_ALLOWED_MODELS.includes(saved)) {
        localStorage.setItem("ulmet_ai_model", DEFAULT_MODEL);
        return DEFAULT_MODEL;
    }
    return saved;
}

function aiChangeModel(model) {
    localStorage.setItem("ulmet_ai_model", model);
    aiUpdateModelUI(model);
}

function aiUpdateModelUI(model) {
    const headerSelect = document.getElementById('ai-widget-header-model');
    const modalSelect = document.getElementById('ai-modal-model-select');
    const badge = document.getElementById('ai-widget-model-badge');
    const headerLabel = document.getElementById('ai-header-model-label');
    const welcomeLabel = document.getElementById('ai-welcome-model');

    if (headerSelect) headerSelect.value = model;
    if (modalSelect) modalSelect.value = model;
    if (badge) badge.textContent = model;

    const optText = headerSelect?.querySelector(`option[value="${model}"]`)?.textContent || model;
    if (headerLabel) headerLabel.textContent = optText.replace(/^[^\w]+/, '');
    if (welcomeLabel) welcomeLabel.textContent = optText;
}

function aiToggleModalPwd() {
    const inp = document.getElementById('ai-api-key-input');
    if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
}

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
    const currentSavedKey = localStorage.getItem("ulmet_snifox_api_key");
    if (currentSavedKey && (currentSavedKey.includes('rcENc1') || currentSavedKey.includes('RQjw8'))) {
        localStorage.setItem("ulmet_snifox_api_key", DEFAULT_SNIFOX_KEY);
    }

    const key = aiGetApiKey();
    const model = aiGetModel();
    
    const keyInp = document.getElementById('ai-api-key-input');
    if (keyInp) keyInp.value = key;

    aiUpdateModelUI(model);
    
    // Auto resize
    const tx = document.getElementById('ai-chat-input');
    if (tx) {
        tx.addEventListener("input", function() {
            this.style.height = "auto";
            this.style.height = (this.scrollHeight < 96 ? this.scrollHeight : 96) + "px";
        });
    }

    // Load history
    const histKey = typeof userKey === 'function' ? userKey('ulmet_ai_history') : 'ulmet_ai_history';
    const saved = localStorage.getItem(histKey) || localStorage.getItem('ulmet_ai_history');
    if (saved) {
        try {
            const raw = JSON.parse(saved);
            // Convert old format if needed
            aiChatHistory = raw.map(item => {
                if (item.parts) {
                    const text = item.parts.map(p => p.text || '').join('\n');
                    return { role: item.role === 'model' ? 'assistant' : item.role, content: text };
                }
                return item;
            });
            renderHistory();
        } catch(e) { console.error('Error parsing ai history:', e); }
    }
}

function renderHistory() {
    const c = document.getElementById('ai-chat-container');
    if (!c.firstElementChild) return;
    c.innerHTML = c.firstElementChild.outerHTML; 
    
    aiChatHistory.forEach(msg => {
        if (msg.role === 'user') {
            aiAppendMessage('user', msg.content || '', null, false);
        } else if (msg.role === 'assistant' || msg.role === 'model') {
            aiAppendMessage('assistant', msg.content || '', null, false);
        }
    });
    c.scrollTop = c.scrollHeight;
}

function aiSaveApiKey() {
    const key = document.getElementById('ai-api-key-input').value.trim();
    const model = document.getElementById('ai-modal-model-select').value;
    if (key) {
        localStorage.setItem("ulmet_snifox_api_key", key);
        localStorage.setItem("ulmet_gemini_api_key", key); // fallback
        localStorage.setItem("ulmet_ai_model", model);
        aiUpdateModelUI(model);
        document.getElementById('ai-api-modal').classList.add('hidden');
        alert("✅ Pengaturan SnifoxAI tersimpan!");
    } else {
        alert("⚠️ API Key tidak boleh kosong.");
    }
}

async function aiTestApiConnection() {
    const testBtn = document.getElementById('ai-btn-test');
    const resBox = document.getElementById('ai-widget-test-result');
    const key = (document.getElementById('ai-api-key-input')?.value || aiGetApiKey()).trim();
    const model = document.getElementById('ai-modal-model-select')?.value || aiGetModel();

    if (!key) {
        resBox.className = 'p-2.5 rounded-xl text-[11px] bg-red-950/70 border border-red-500/50 text-red-200';
        resBox.textContent = '⚠️ Harap masukkan API Key terlebih dahulu.';
        resBox.classList.remove('hidden');
        return;
    }

    testBtn.disabled = true;
    testBtn.textContent = 'Menguji... ⏳';
    resBox.className = 'p-2.5 rounded-xl text-[11px] bg-blue-950/70 border border-blue-700/50 text-blue-200';
    resBox.innerHTML = `Menguji koneksi ke <b>${model}</b>...`;
    resBox.classList.remove('hidden');

    try {
        const resp = await fetch(SNIFOX_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: 'Tes koneksi ULMET. Balas: "Online!"' }],
                max_tokens: 15
            })
        });

        const data = await resp.json();
        if (resp.ok && data?.choices?.[0]?.message?.content) {
            resBox.className = 'p-2.5 rounded-xl text-[11px] bg-emerald-950/70 border border-emerald-500/50 text-emerald-200';
            resBox.innerHTML = `✅ <b>Koneksi Berhasil!</b><br>Model merespons: "${data.choices[0].message.content.trim()}". Gateway aktif!`;
        } else {
            const err = data.message || data.error?.message || `HTTP ${resp.status}`;
            resBox.className = 'p-2.5 rounded-xl text-[11px] bg-red-950/70 border border-red-500/50 text-red-200';
            resBox.innerHTML = `⚠️ <b>Gateway Snifox:</b> ${err}.<br><span class="text-[10px] text-red-300">Periksa kembali API Key dari email/dashboard.</span>`;
        }
    } catch (e) {
        resBox.className = 'p-2.5 rounded-xl text-[11px] bg-red-950/70 border border-red-500/50 text-red-200';
        resBox.innerHTML = `❌ <b>Koneksi gagal:</b> ${e.message}`;
    } finally {
        testBtn.disabled = false;
        testBtn.textContent = '⚡ Uji Koneksi';
    }
}

function aiHandleEnter(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        aiSendMessage();
    }
}

async function aiHandleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    aiPendingName = file.name;
    aiPendingMime = file.type || 'application/octet-stream';
    aiPendingText = null;

    document.getElementById('ai-file-name').textContent = `${file.name} (membaca...)`;
    document.getElementById('ai-file-preview').classList.remove('hidden');
    document.getElementById('ai-file-preview').classList.add('flex');

    try {
        if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
            const arrayBuffer = await file.arrayBuffer();
            if (typeof pdfjsLib !== 'undefined') {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                let fullText = "";
                const maxPages = Math.min(pdf.numPages, 40);
                for (let i = 1; i <= maxPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageStr = textContent.items.map(item => item.str).join(" ");
                    if (pageStr.trim()) fullText += `--- Halaman ${i} ---\n${pageStr}\n\n`;
                }
                aiPendingText = fullText.trim() || `[Berkas ${file.name} terbaca]`;
                document.getElementById('ai-file-name').textContent = `${file.name} (${pdf.numPages} hal • Siap)`;
            } else {
                aiPendingText = `[Berkas ${file.name} terlampir]`;
                document.getElementById('ai-file-name').textContent = file.name;
            }
        } else if (file.name.toLowerCase().endsWith('.txt') || file.type.startsWith('text/')) {
            aiPendingText = await file.text();
            document.getElementById('ai-file-name').textContent = `${file.name} (Siap)`;
        } else {
            const raw = await file.text().catch(() => '');
            const clean = raw.replace(/[^\x20-\x7E\t\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
            aiPendingText = clean.length > 50 ? clean.slice(0, 30000) : `[Berkas ${file.name} terlampir]`;
            document.getElementById('ai-file-name').textContent = `${file.name} (Siap)`;
        }
    } catch(err) {
        console.error("Gagal membaca file:", err);
        aiPendingText = `[Berkas ${file.name} terlampir]`;
        document.getElementById('ai-file-name').textContent = file.name;
    }
}

function aiRemoveFile() {
    aiPendingBase64 = null; 
    aiPendingName = null; 
    aiPendingMime = null;
    aiPendingText = null;
    const uploadInp = document.getElementById('ai-file-upload');
    if (uploadInp) uploadInp.value = '';
    const prev = document.getElementById('ai-file-preview');
    if (prev) {
        prev.classList.add('hidden');
        prev.classList.remove('flex');
    }
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
    const panel = document.getElementById('ai-panel');
    if (panel) panel.classList.add('border-yellow-400');
};

window.aiHandleDragLeave = function(e) {
    e.preventDefault();
    const panel = document.getElementById('ai-panel');
    if (panel && !panel.contains(e.relatedTarget)) {
        panel.classList.remove('border-yellow-400');
    }
};

window.aiHandleDrop = function(e) {
    e.preventDefault();
    const panel = document.getElementById('ai-panel');
    if (panel) panel.classList.remove('border-yellow-400');
    
    const fileId = window.aiDraggedFileId || e.dataTransfer.getData('text/plain');
    window.aiDraggedFileId = null;
    
    if (fileId) {
        aiSelectUlmetFile(fileId);
        return;
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        aiHandleFile({ target: { files: [e.dataTransfer.files[0]] } });
    }
};

window.aiOpenUlmetFilesModal = function() {
    const fKey = typeof userKey === 'function' ? userKey('ulmet_files') : 'ulmet_files';
    const files = JSON.parse(localStorage.getItem(fKey) || '[]');
    const container = document.getElementById('ai-ulmet-files-list');
    
    if (files.length === 0) {
        container.innerHTML = `<div class="text-center py-6 text-blue-400 text-sm">Belum ada file di ULMET. <br><br>
        <button onclick="document.getElementById('ai-file-upload').click(); document.getElementById('ai-ulmet-files-modal').classList.add('hidden')" class="px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-lg mt-2 transition text-xs">Upload dari Perangkat</button></div>`;
    } else {
        const courses = [...new Set(files.map(f => f.course || 'Tanpa Mata Kuliah'))];
        
        container.innerHTML = courses.map(course => {
            const courseFilesCount = files.filter(f => (f.course || 'Tanpa Mata Kuliah') === course).length;
            return `
            <div onclick="aiShowUlmetFolder('${course}')" class="p-3 bg-blue-900/30 hover:bg-blue-800/50 border border-blue-800/40 rounded-xl cursor-pointer flex items-center gap-3 transition">
                <div class="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-lg border border-yellow-500/40 flex-shrink-0 text-yellow-400">📁</div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-white font-bold truncate">${course}</p>
                    <p class="text-[10px] text-blue-400 truncate">${courseFilesCount} file</p>
                </div>
                <div class="text-blue-500 font-bold">❯</div>
            </div>
            `;
        }).join('') + `<div class="pt-4 border-t border-blue-800/50 mt-4"><button onclick="document.getElementById('ai-file-upload').click(); document.getElementById('ai-ulmet-files-modal').classList.add('hidden')" class="w-full py-2 bg-blue-950 hover:bg-blue-900 text-blue-300 rounded-lg transition text-xs flex items-center justify-center gap-2"><span>📤</span> Atau Upload dari Perangkat</button></div>`;
    }
    
    document.querySelector('#ai-ulmet-files-modal h3').innerHTML = `<span>📂</span> Pilih Folder Mata Kuliah`;
    document.getElementById('ai-ulmet-files-modal').classList.remove('hidden');
};

window.aiShowUlmetFolder = function(courseName) {
    const fKey = typeof userKey === 'function' ? userKey('ulmet_files') : 'ulmet_files';
    const files = JSON.parse(localStorage.getItem(fKey) || '[]');
    const folderFiles = files.filter(f => (f.course || 'Tanpa Mata Kuliah') === courseName);
    const container = document.getElementById('ai-ulmet-files-list');
    
    document.querySelector('#ai-ulmet-files-modal h3').innerHTML = `<button onclick="aiOpenUlmetFilesModal()" class="mr-2 text-blue-400 hover:text-white transition">⬅️</button> <span>📁</span> ${courseName}`;
    
    if (folderFiles.length === 0) {
        container.innerHTML = `<p class="text-center text-blue-400 text-sm py-4">Folder kosong.</p>`;
    } else {
        container.innerHTML = folderFiles.map(f => `
            <div onclick="aiSelectUlmetFile('${f.id}')" class="p-3 bg-blue-900/30 hover:bg-blue-800/50 border border-blue-800/40 rounded-xl cursor-pointer flex items-center gap-3 transition">
                <div class="w-8 h-8 rounded-lg bg-blue-950 flex items-center justify-center text-xs border border-blue-700/50 flex-shrink-0 text-blue-300">📄</div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-white font-medium truncate">${f.name}</p>
                    <p class="text-[10px] text-blue-400 truncate">${f.size || ''}</p>
                </div>
            </div>
        `).join('');
    }
};

window.aiSelectUlmetFile = async function(fileId) {
    const fKey = typeof userKey === 'function' ? userKey('ulmet_files') : 'ulmet_files';
    const files = JSON.parse(localStorage.getItem(fKey) || '[]');
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
            input.placeholder = "File " + file.name + " siap didiskusikan...";
            input.focus();
            
            document.getElementById('ai-ulmet-files-modal').classList.add('hidden');
        } else if (file.storage_path) {
            try {
                let blob = null;
                if (typeof getDeviceFileBlob === 'function') {
                    blob = await getDeviceFileBlob(file.storage_path);
                }
                if (!blob && typeof getOrFetchFileUrl === 'function') {
                    const url = await getOrFetchFileUrl(file.storage_path);
                    if (url) {
                        const resp = await fetch(url);
                        if (resp.ok) blob = await resp.blob();
                    }
                }
                if (blob) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        aiPendingName = file.name;
                        aiPendingMime = blob.type || (file.ext === 'pdf' ? 'application/pdf' : 'application/octet-stream');
                        aiPendingBase64 = reader.result.split(',')[1];
                        document.getElementById('ai-file-name').textContent = file.name;
                        document.getElementById('ai-file-preview').classList.remove('hidden');
                        document.getElementById('ai-file-preview').classList.add('flex');
                        const input = document.getElementById('ai-chat-input');
                        input.placeholder = "File " + file.name + " siap didiskusikan...";
                        input.focus();
                        document.getElementById('ai-ulmet-files-modal').classList.add('hidden');
                    };
                    reader.readAsDataURL(blob);
                } else {
                    alert("Berkas tidak ditemukan di penyimpanan lokal.");
                }
            } catch (err) {
                console.warn('Gagal memuat file lokal untuk AI:', err);
                alert("Gagal memuat file dari penyimpanan lokal.");
            }
        } else {
            alert("Maaf, file ini tidak memiliki isi berkas yang dapat dibaca.");
        }
    }
};

function aiClearChat() {
    if (confirm('Hapus semua riwayat obrolan AI?')) {
        aiChatHistory = [];
        const histKey = typeof userKey === 'function' ? userKey('ulmet_ai_history') : 'ulmet_ai_history';
        localStorage.removeItem(histKey);
        localStorage.removeItem('ulmet_ai_history');
        renderHistory();
    }
}

function aiAppendMessage(role, content, fileName = null, scroll = true) {
    const c = document.getElementById('ai-chat-container');
    const div = document.createElement('div');
    const isUser = role === 'user';
    div.className = "flex gap-3 " + (isUser ? "flex-row-reverse" : "");
    
    const avatar = document.createElement('div');
    avatar.className = `w-8 h-8 rounded-xl flex items-center justify-center text-xs flex-shrink-0 shadow-sm border ${
        isUser ? "bg-gradient-to-tr from-yellow-500 to-yellow-300 border-yellow-400 text-blue-950 font-bold" : "bg-gradient-to-br from-blue-600 to-blue-800 border-blue-500"
    }`;
    avatar.textContent = isUser ? "A" : "🤖";

    const msgBox = document.createElement('div');
    msgBox.className = `border rounded-2xl p-3 text-[12px] shadow-sm ai-prose max-w-[85%] overflow-hidden ${
        isUser ? "bg-blue-900/40 border-blue-700/50 text-white rounded-tr-sm" : "bg-blue-950/60 border-blue-800/50 text-blue-100 rounded-tl-sm"
    }`;

    let html = "";
    if (fileName) {
        html += `<div class="mb-1.5 bg-blue-950/60 border border-blue-800/40 px-2 py-1 rounded text-[10px] text-blue-200 inline-flex items-center gap-1"><span class="text-yellow-400">📄</span> ${fileName}</div><br>`;
    }
    
    if (isUser) {
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
    const apiKey = aiGetApiKey();
    const model = aiGetModel();

    if (!text && !aiPendingName) return;
    if (!apiKey) {
        document.getElementById('ai-api-modal').classList.remove('hidden');
        return;
    }

    const fname = aiPendingName;
    aiAppendMessage('user', text, fname);
    
    let userPrompt = text;
    if (aiPendingText) {
        userPrompt += `\n\n[DOKUMEN TERLAMPIR: "${fname}"]:\n${aiPendingText.slice(0, 35000)}\n[AKHIR DOKUMEN: "${fname}"]\n(Penting untuk AI: Dokumen di atas telah diekstrak dan siap dibaca. Analisis, rangkum, atau jawab pertanyaan mahasiswa berdasarkan isi dokumen tersebut.)`;
    } else if (fname) {
        userPrompt += `\n\n[DOKUMEN TERLAMPIR: "${fname}"]`;
    }

    // Prepare messages array
    const messages = [
        { role: "system", content: SYSTEM_PROMPT }
    ];
    aiChatHistory.forEach(h => messages.push({ role: h.role, content: h.content }));
    messages.push({ role: "user", content: userPrompt });

    input.value = ''; 
    input.style.height = "auto";
    aiRemoveFile();

    const loading = aiAppendMessage('assistant', '<span class="text-yellow-400 font-semibold animate-pulse tracking-wide">Thingking...</span>');

    try {
        const response = await fetch(SNIFOX_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const errMsg = data.message || data.error?.message || `HTTP ${response.status}`;
            throw new Error(errMsg);
        }

        const aiReply = data.choices?.[0]?.message?.content || "Maaf, AI tidak memberikan respons.";

        aiChatHistory.push({ role: "user", content: text || `[Membahas file ${fname}]` });
        aiChatHistory.push({ role: "assistant", content: aiReply });
        const histKeySave = typeof userKey === 'function' ? userKey('ulmet_ai_history') : 'ulmet_ai_history';
        const now = Date.now();
        localStorage.setItem(histKeySave, JSON.stringify(aiChatHistory));
        localStorage.setItem(histKeySave + '_time', String(now));

        // Backup ke Supabase Cloud Storage untuk sinkronisasi antar HP & Laptop
        try {
            if (typeof getSupabase === 'function' && typeof getCurrentUserId === 'function') {
                const sb = getSupabase();
                const uid = getCurrentUserId();
                if (sb && uid) {
                    const filePath = `${uid}/_system_ai_history.json`;
                    const blob = new Blob([JSON.stringify({ updated_at: now, messages: aiChatHistory })], { type: 'application/json' });
                    sb.storage.from('materi').remove([filePath]).then(() => {
                        sb.storage.from('materi').upload(filePath, blob, { contentType: 'application/json', cacheControl: '0' });
                    }).catch(() => {});
                }
            }
        } catch(e) {}

        if (typeof BroadcastChannel !== 'undefined') {
            try {
                const bc = new BroadcastChannel('ulmet_ai_sync');
                bc.postMessage({ type: 'AI_HISTORY_UPDATED', updated_at: now });
            } catch(e) {}
        }

        loading.innerHTML = typeof marked !== 'undefined' ? marked.parse(aiReply) : aiReply;
        const c = document.getElementById('ai-chat-container');
        c.scrollTop = c.scrollHeight;
    } catch (e) {
        loading.innerHTML = `
            <div class="text-red-400 space-y-1">
                <p><strong>⚠️ Gagal menghubungi SnifoxAI:</strong></p>
                <p class="text-[11px] bg-red-950/60 p-2 rounded-lg border border-red-900/50">${e.message}</p>
                <button onclick="document.getElementById('ai-api-modal').classList.remove('hidden')" class="text-[10px] text-yellow-400 hover:underline mt-1 font-semibold">
                    Cek / Ganti API Key di Pengaturan ⚙️
                </button>
            </div>
        `;
    }
}

// Attach immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWidget);
} else {
    injectWidget();
}
