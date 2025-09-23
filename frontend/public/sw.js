importScripts('https://cdn.jsdelivr.net/npm/idb@6/build/iife/index-min.js');

const DB_NAME = 'reportsDB';
const STORE_NAME = 'pendingReports';

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
  self.clients.claim();
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reports') {
    event.waitUntil(syncReports());
  }
});

async function syncReports() {
  const db = await idb.openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'reportId' });
      }
    },
  });

  const reports = await db.getAll(STORE_NAME);

  for (const report of reports) {
    try {
      const formData = new FormData();
      formData.append('reporterEmail', report.reporterEmail);
      formData.append('title', report.title);
      formData.append('description', report.description);
      formData.append('location', JSON.stringify(report.location));

      if (report.imageBase64) {
        const res = await fetch(report.imageBase64);
        const blob = await res.blob();
        formData.append('image', blob, 'image.jpg');
      }

      // Use string instead of import.meta.env
      const BACKEND_URL = "http://localhost:3000/api";
      const response = await fetch(`${BACKEND_URL}/reports/${report.nagarId}`, {
        method: "POST",
        body: formData,
      });
      console.log(response) ;
      if (response.ok) {
        await db.delete(STORE_NAME, report.reportId);
        console.log('[SW] Report synced:', report.reportId);
      } else {
        console.error('[SW] Failed to sync report:', report.reportId);
      }
    } catch (err) {
      console.error('[SW] Error syncing report, will retry later:', err);
    }
  }
}
