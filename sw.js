// =============================================
// ULMET Service Worker — Notifikasi Background & Network First
// =============================================
const CACHE_NAME = 'ulmet-v92';
const SHARED_CACHE_NAME = 'ulmet-shared-cache';
const ASSETS = [
    './',
    './index.html',
    './pages/jadwal.html',
    './pages/dashboard.html',
    './pages/catatan.html',
    './pages/materi.html',
    './pages/keuangan.html',
    './pages/ai.html',
    './pages/profil.html',
    './pages/login.html',
    './pages/admin.html',
    './manifest.json',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    './assets/img/mascot-happy.jpg',
    './assets/img/mascot-angry.jpg',
    './assets/img/mascot-worried.jpg',
    './assets/js/local-db.js',
    './assets/js/ai-widget.js'
];

// ===== INSTALL: cache semua asset =====
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// ===== ACTIVATE: hapus semua cache lama (kecuali shared cache) =====
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(k => {
                if (k !== CACHE_NAME && k !== SHARED_CACHE_NAME) {
                    return caches.delete(k);
                }
            }))
        )
    );
    self.clients.claim();
});

// ===== FETCH: Network First (selalu ambil versi terbaru dari server) =====
const saveSharedFile = async (fileObj, customName) => {
    try {
        let name = (fileObj && fileObj.name) || customName || ('Dokumen_WhatsApp_' + Date.now() + '.pdf');
        let type = (fileObj && fileObj.type) || 'application/pdf';
        let size = (fileObj && fileObj.size) || 0;
        let arrayBuffer = null;

        // Ekstraksi binary ArrayBuffer secara aman
        if (fileObj && typeof fileObj.arrayBuffer === 'function') {
            try {
                arrayBuffer = await fileObj.arrayBuffer();
                size = arrayBuffer.byteLength || size;
            } catch (e) {
                console.warn("ArrayBuffer extraction failed:", e);
            }
        }

        const binaryBody = arrayBuffer || fileObj;

        // 1. Simpan ke Cache Storage (Paling reliabel & kebal issue IndexedDB di Android)
        try {
            const cache = await caches.open(SHARED_CACHE_NAME);
            const headers = new Headers({
                'Content-Type': type,
                'X-File-Name': encodeURIComponent(name),
                'X-File-Type': type,
                'X-File-Size': String(size),
                'X-Timestamp': String(Date.now())
            });
            const fileResponse = new Response(binaryBody, { headers });
            await cache.put('/pending-shared-file', fileResponse);
        } catch (err) {
            console.warn("Gagal simpan shared file ke Cache Storage:", err);
        }

        // 2. Simpan juga ke IndexedDB sebagai cadangan multi-layer
        try {
            await new Promise((resolve, reject) => {
                const req = indexedDB.open('ULMET_Share_DB', 2);
                req.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('shared_files')) {
                        db.createObjectStore('shared_files', { keyPath: 'id' });
                    }
                };
                req.onsuccess = (e) => {
                    const db = e.target.result;
                    const tx = db.transaction('shared_files', 'readwrite');
                    const store = tx.objectStore('shared_files');
                    const dataObj = {
                        id: 'pending_share',
                        name: name,
                        type: type,
                        size: size,
                        buffer: arrayBuffer,
                        timestamp: Date.now()
                    };
                    store.put(dataObj);
                    tx.oncomplete = () => resolve();
                    tx.onerror = () => reject(tx.error);
                };
                req.onerror = () => reject(req.error);
            });
        } catch (err) {
            console.warn("Gagal simpan shared file ke IndexedDB:", err);
        }

        // 3. Notifikasi ke semua window client yang terbuka
        try {
            const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
            for (const client of clients) {
                client.postMessage({ type: 'PENDING_SHARE_READY', name: name, size: size, mimeType: type });
            }
        } catch (e) { }
    } catch (fatalErr) {
        console.error("Fatal error in saveSharedFile:", fatalErr);
    }
};

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (event.request.method === 'POST' && (url.pathname.endsWith('/share-target') || url.pathname.endsWith('share-target') || url.pathname.includes('share-target'))) {
        event.respondWith((async () => {
            let sharedFileName = 'Dokumen_WhatsApp.pdf';
            let sharedFileSize = 0;
            try {
                const formData = await event.request.formData();
                let file = formData.get('shared_file');
                const title = formData.get('title');
                const text = formData.get('text');

                if (!file) {
                    for (const [key, val] of formData.entries()) {
                        if (val && typeof val === 'object' && ('arrayBuffer' in val || 'stream' in val || val.size > 0 || val.name)) {
                            file = val;
                            break;
                        }
                    }
                }

                if (file) {
                    sharedFileName = file.name || (title ? title + '.pdf' : 'Dokumen_WhatsApp.pdf');
                    sharedFileSize = file.size || 0;
                    await saveSharedFile(file, sharedFileName);
                } else if (text || title) {
                    const textContent = (title ? title + "\n" : "") + (text || "");
                    const textBlob = new Blob([textContent], { type: 'text/plain' });
                    sharedFileName = (title ? String(title).replace(/[^a-zA-Z0-9_-]/g, '_') : 'Catatan_WhatsApp') + '.txt';
                    sharedFileSize = textBlob.size || 0;
                    await saveSharedFile(textBlob, sharedFileName);
                }
            } catch (err) {
                console.error("Error processing share target in SW:", err);
            }
            const redirectUrl = new URL('./pages/materi.html?shared=1&fn=' + encodeURIComponent(sharedFileName) + '&sz=' + sharedFileSize, self.location.href).href;
            return Response.redirect(redirectUrl, 303);
        })());
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

// ===== NOTIFIKASI DEADLINE (dipanggil dari halaman) =====
self.addEventListener('message', event => {
    const { type, payload } = event.data || {};

    if (type === 'SCHEDULE_DEADLINE_NOTIF') {
        const { taskId, taskName, matkul, msUntil, urgency } = payload;
        if (msUntil <= 0) return;

        setTimeout(() => {
            self.registration.showNotification(
                urgency === 'urgent' ? '🚨 DEADLINE HARI INI!' : '⚠️ Deadline Mendekat!',
                {
                    body: `"${taskName}"${matkul ? ` (${matkul})` : ''} — ${urgency === 'urgent' ? 'Kurang dari 24 jam!' : 'Deadline dalam beberapa hari!'}`,
                    icon: './assets/icons/icon-192.png',
                    badge: './assets/icons/icon-192.png',
                    tag: 'deadline-' + taskId,
                    requireInteraction: urgency === 'urgent',
                    vibrate: urgency === 'urgent' ? [200, 100, 200, 100, 400] : [200, 100, 200],
                    data: { url: './pages/jadwal.html', taskId },
                    actions: [
                        { action: 'open', title: '📋 Buka Tugas' },
                        { action: 'dismiss', title: 'Nanti Saja' }
                    ]
                }
            );
        }, msUntil);
    }

    if (type === 'SCHEDULE_HABIT_NOTIF') {
        const { habitName, icon, msUntil } = payload;
        if (msUntil <= 0) return;
        setTimeout(() => {
            self.registration.showNotification('📿 Pengingat Kebiasaan Harian', {
                body: `${icon} ${habitName} — Jangan lupa selesaikan hari ini!`,
                icon: './assets/icons/icon-192.png',
                badge: './assets/icons/icon-192.png',
                tag: 'habit-' + habitName,
                vibrate: [100, 50, 100],
                data: { url: './pages/jadwal.html#kebiasaan' },
            });
        }, msUntil);
    }
});

// ===== Klik notifikasi → buka halaman =====
self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || './pages/jadwal.html';
    if (event.action === 'dismiss') return;
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if (client.url.includes('jadwal') && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});
