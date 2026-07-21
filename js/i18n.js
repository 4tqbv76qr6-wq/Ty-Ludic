function loadI18n(params) {

    const currentLang = localStorage.getItem("lang") || "fr";

    const files = params.files;
    const CACHE_KEY = params.cacheKey;
    const STRUCT_KEY = CACHE_KEY + "_structure";
    const VERSION_KEY = CACHE_KEY + "_version";

    function safeDecompress(key) {
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        const decompressed = LZString.decompressFromUTF16(raw);
        if (!decompressed) return null;

        try {
            return JSON.parse(decompressed);
        } catch {
            return null;
        }
    }

    const cached = safeDecompress(CACHE_KEY);
    const cachedStruct = safeDecompress(STRUCT_KEY);
    const cachedVersion = localStorage.getItem(VERSION_KEY)
        ? LZString.decompressFromUTF16(localStorage.getItem(VERSION_KEY))
        : null;

    if (cached && cachedStruct && cachedVersion) {

        Promise.all(files.map(f => fetch(f).then(r => r.json())))
            .then(jsonFiles => {

                const mergedLive = {};
                jsonFiles.forEach(obj => {
                    Object.keys(obj).forEach(lang => {
                        mergedLive[lang] = {
                            ...(mergedLive[lang] || {}),
                            ...obj[lang]
                        };
                    });
                });

                const liveKeys = Object.keys(mergedLive[currentLang]);
                const sameStructure =
                    cachedStruct.length === liveKeys.length &&
                    cachedStruct.every(k => liveKeys.includes(k));

                const liveVersion = mergedLive[currentLang].i18n_version;

                if (!sameStructure || liveVersion !== cachedVersion) {
                    localStorage.removeItem(CACHE_KEY);
                    localStorage.removeItem(STRUCT_KEY);
                    localStorage.removeItem(VERSION_KEY);
                    loadTranslations();
                } else {
                    applyTranslations(cached);
                }
            });

    } else {
        loadTranslations();
    }

    function loadTranslations() {
        Promise.all(files.map(f => fetch(f).then(r => r.json())))
            .then(jsonFiles => {

                const merged = {};
                jsonFiles.forEach(obj => {
                    Object.keys(obj).forEach(lang => {
                        merged[lang] = {
                            ...(merged[lang] || {}),
                            ...obj[lang]
                        };
                    });
                });

                const structure = Object.keys(merged[currentLang]);
                const version = merged[currentLang].i18n_version;

                localStorage.setItem(CACHE_KEY,
                    LZString.compressToUTF16(JSON.stringify(merged)));

                localStorage.setItem(STRUCT_KEY,
                    LZString.compressToUTF16(JSON.stringify(structure)));

                localStorage.setItem(VERSION_KEY,
                    LZString.compressToUTF16(version));

                applyTranslations(merged);
            });
    }

    function applyTranslations(data) {
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            const text = data[currentLang][key];
            if (text) el.textContent = text;
        });

        document.querySelectorAll(".lang-item").forEach(el => {
            if (el.textContent.includes(currentLang.toUpperCase())) {
                el.classList.add("active");
            }
        });
    }
}
