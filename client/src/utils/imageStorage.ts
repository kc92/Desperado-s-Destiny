/**
 * Image Storage Utility
 * Uses IndexedDB to store large image data that exceeds localStorage limits
 */

const DB_NAME = 'desperados-art-assets-db';
const DB_VERSION = 1;
const STORE_NAME = 'images';

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Initialize the IndexedDB database
 */
function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[ImageStorage] Failed to open database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('[ImageStorage] Database opened successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        console.log('[ImageStorage] Object store created');
      }
    };
  });

  return dbPromise;
}

/**
 * Save an image to IndexedDB
 */
export async function saveImage(assetId: string, imageData: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ id: assetId, data: imageData, timestamp: Date.now() });

      request.onsuccess = () => {
        console.log('[ImageStorage] Image saved:', assetId);
        resolve();
      };

      request.onerror = () => {
        console.error('[ImageStorage] Failed to save image:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[ImageStorage] Save error:', error);
    throw error;
  }
}

/**
 * Load an image from IndexedDB
 */
export async function loadImage(assetId: string): Promise<string | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(assetId);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          console.log('[ImageStorage] Image loaded:', assetId);
          resolve(result.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('[ImageStorage] Failed to load image:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[ImageStorage] Load error:', error);
    return null;
  }
}

/**
 * Delete an image from IndexedDB
 */
export async function deleteImage(assetId: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(assetId);

      request.onsuccess = () => {
        console.log('[ImageStorage] Image deleted:', assetId);
        resolve();
      };

      request.onerror = () => {
        console.error('[ImageStorage] Failed to delete image:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[ImageStorage] Delete error:', error);
    throw error;
  }
}

/**
 * Load all images from IndexedDB
 */
export async function loadAllImages(): Promise<Map<string, string>> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result;
        const imageMap = new Map<string, string>();
        for (const item of results) {
          imageMap.set(item.id, item.data);
        }
        console.log('[ImageStorage] Loaded', imageMap.size, 'images');
        resolve(imageMap);
      };

      request.onerror = () => {
        console.error('[ImageStorage] Failed to load all images:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[ImageStorage] LoadAll error:', error);
    return new Map();
  }
}

/**
 * Clear all images from IndexedDB
 */
export async function clearAllImages(): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('[ImageStorage] All images cleared');
        resolve();
      };

      request.onerror = () => {
        console.error('[ImageStorage] Failed to clear images:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[ImageStorage] Clear error:', error);
    throw error;
  }
}
