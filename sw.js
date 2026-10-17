// =============================================
// ULMET Service Worker — Notifikasi Background & Network First
// =============================================
const CACHE_NAME = 'ulmet-v57';
const ASSETS = [
    './',
    './jadwal.html',
    './dashboard.html',
    './widget.html',
    './materi.html',
    './keuangan.html',
    './ai.html',
    './profil.html',
    './login.html',
    './admin.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './mascot-happy.jpg',
    './mascot-angry.jpg',
    './mascot-worried.jpg',
    './supabase-config.js',
    './ai-widget.js'
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

// ===== ACTIVATE: hapus semua cache lama =====
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// ===== FETCH: Network First (selalu ambil versi terbaru dari server) =====
const saveSharedFile = async (file) => {
    return new Promise(async (resolve, reject) => {
        try {
            let arrayBuffer = null;
            try {
                if (typeof file.arrayBuffer === 'function') {
                    arrayBuffer = await file.arrayBuffer();
                }
            } catch(e) {
                console.warn("ArrayBuffer convert failed:", e);
            }

            const req = indexedDB.open('ULMET_Share_DB', 1);
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
                    name: file.name || ('Dokumen_WhatsApp_' + Date.now() + '.pdf'),
                    type: file.type || 'application/pdf',
                    size: file.size || (arrayBuffer ? arrayBuffer.byteLength : 0),
                    buffer: arrayBuffer,
                    timestamp: Date.now() 
                };
                store.put(dataObj);
                tx.oncomplete = () => {
                    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
                        clients.forEach(c => c.postMessage({ type: 'PENDING_SHARE_READY', name: dataObj.name }));
                    }).catch(() => {});
                    resolve();
                };
                tx.onerror = () => reject(tx.error);
            };
            req.onerror = () => reject(req.error);
        } catch(err) {
            reject(err);
        }
    });
};

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (event.request.method === 'POST' && (url.pathname.endsWith('/share-target') || url.pathname.endsWith('share-target'))) {
        event.respondWith((async () => {
            try {
                const formData = await event.request.formData();
                let file = formData.get('shared_file');
                if (!file) {
                    for (const val of formData.values()) {
                        if (val instanceof File || (val && typeof val === 'object' && val.name)) {
                            file = val;
                            break;
                        }
                    }
                }
                if (file) {
                    await saveSharedFile(file);
                }
            } catch (err) {
                console.error("Error processing share target in SW:", err);
            }
            const redirectUrl = new URL('./materi.html?shared=1', self.location.href).href;
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
                    icon: './icon-192.png',
                    badge: './icon-192.png',
                    tag: 'deadline-' + taskId,
                    requireInteraction: urgency === 'urgent',
                    vibrate: urgency === 'urgent' ? [200, 100, 200, 100, 400] : [200, 100, 200],
                    data: { url: './jadwal.html', taskId },
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
                icon: './icon-192.png',
                badge: './icon-192.png',
                tag: 'habit-' + habitName,
                vibrate: [100, 50, 100],
                data: { url: './jadwal.html#kebiasaan' },
            });
        }, msUntil);
    }
});

// ===== Klik notifikasi → buka halaman =====
self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || './jadwal.html';
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
