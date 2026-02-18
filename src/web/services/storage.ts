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
            const result: StorageData = {};

            // 1. Try localStorage first (Primary)
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

            // 2. If chrome.storage is available and some keys are missing, try chrome.storage (Fallback/Sync)
            const missingKeys = keys.filter(k => result[k] === undefined);

            if (missingKeys.length > 0 && typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(missingKeys, (chromeResult) => {
                    const finalResult = { ...result, ...chromeResult };

                    // Sync back to localStorage if found in chrome.storage
                    missingKeys.forEach(k => {
                        if (chromeResult[k] !== undefined) {
                            const val = chromeResult[k];
                            localStorage.setItem(k, typeof val === 'string' ? val : JSON.stringify(val));
                        }
                    });

                    resolve(finalResult);
                });
            } else {
                resolve(result);
            }
        });
    },

    set: async (data: StorageData): Promise<void> => {
        return new Promise((resolve, reject) => {
            try {
                // 1. Save to localStorage (Primary)
                Object.keys(data).forEach(key => {
                    const value = data[key];
                    if (value === undefined || value === null) {
                        localStorage.removeItem(key);
                    } else {
                        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                    }
                });

                // 2. Save to chrome.storage if available (Mirroring for content scripts)
                if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                    chrome.storage.local.set(data, () => {
                        if (chrome.runtime.lastError) {
                            console.error('[Storage] Chrome storage error:', chrome.runtime.lastError);
                            // We don't reject here because localStorage succeeded
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
                    simplifiedChanges[key] = changes[key].newValue;
                });
                callback(simplifiedChanges);
            };
            chrome.storage.onChanged.addListener(chromeListener);
            listeners.push(() => chrome.storage.onChanged.removeListener(chromeListener));
        }

        // LocalStorage changes (cross-tab sync)
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
