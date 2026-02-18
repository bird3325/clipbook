export type StorageKey =
    | 'clippings'
    | 'history'
    | 'apiKey'
    | 'openaiApiKey'
    | 'claudeApiKey'
    | 'notionToken'
    | 'notionDbId'
    | 'showFloatingButton'
    | 'aiModel'
    | 'theme'; // Future proofing

interface StorageData {
    [key: string]: any;
}

export const storageService = {
    get: async (keys: StorageKey[]): Promise<StorageData> => {
        return new Promise((resolve) => {
            // Priority 1: chrome.storage.local (Most reliable for extension pages)
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(keys, (chromeResult) => {
                    // Also sync to localStorage for faster initial loads next time or fallback
                    Object.keys(chromeResult).forEach(k => {
                        const val = chromeResult[k];
                        localStorage.setItem(k, typeof val === 'string' ? val : JSON.stringify(val));
                    });
                    resolve(chromeResult);
                });
                return;
            }

            // Priority 2: localStorage (Web app or fallback)
            const result: StorageData = {};
            keys.forEach(key => {
                const item = localStorage.getItem(key);
                if (item !== null) {
                    try {
                        result[key] = JSON.parse(item);
                    } catch (e) {
                        result[key] = item;
                    }
                }
            });
            resolve(result);
        });
    },

    set: async (data: StorageData): Promise<void> => {
        return new Promise((resolve, reject) => {
            try {
                // 1. Save to localStorage (Local access)
                Object.keys(data).forEach(key => {
                    const value = data[key];
                    if (value === undefined || value === null) {
                        localStorage.removeItem(key);
                    } else {
                        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                    }
                });

                // 2. Save to chrome.storage if available (Primary & Sync)
                if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                    chrome.storage.local.set(data, () => {
                        if (chrome.runtime.lastError) {
                            console.error('[Storage] Chrome storage error:', chrome.runtime.lastError);
                        }
                        resolve();
                    });
                } else {
                    resolve();
                }
            } catch (error) {
                console.error('[Storage] LocalStorage error:', error);
                reject(error);
            }
        });
    },

    // Subscribe to changes (Sync between tabs and with extension storage)
    onChange: (callback: (changes: { [key: string]: any }) => void) => {
        const listeners: (() => void)[] = [];

        // Extension storage changes
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
            const chromeListener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
                const simplifiedChanges: { [key: string]: any } = {};
                Object.keys(changes).forEach(key => {
                    const newVal = changes[key].newValue;
                    simplifiedChanges[key] = newVal;

                    // CRITICAL: Sync back to localStorage so UI stays updated across origins/reloads
                    if (newVal === undefined || newVal === null) {
                        localStorage.removeItem(key);
                    } else {
                        localStorage.setItem(key, typeof newVal === 'string' ? newVal : JSON.stringify(newVal));
                    }
                });
                callback(simplifiedChanges);
            };
            chrome.storage.onChanged.addListener(chromeListener);
            listeners.push(() => chrome.storage.onChanged.removeListener(chromeListener));
        }

        // LocalStorage changes (cross-tab sync for non-extension environments)
        const storageListener = (e: StorageEvent) => {
            if (e.key && e.newValue !== null) {
                try {
                    callback({ [e.key]: JSON.parse(e.newValue) });
                } catch (err) {
                    callback({ [e.key]: e.newValue });
                }
            }
        };
        window.addEventListener('storage', storageListener);
        listeners.push(() => window.removeEventListener('storage', storageListener));

        return () => listeners.forEach(unsub => unsub());
    }
};
