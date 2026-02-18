(function () {
    'use strict';

    const UTM_FIELDS = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'gclid',
        'gbraid'
    ];

    /**
     * Simpan UTM dari URL ke localStorage
     */
    function storeUTMFromURL() {
        const params = new URLSearchParams(window.location.search);

        UTM_FIELDS.forEach(function (field) {
            const value = params.get(field);
            if (value) {
                localStorage.setItem(field, value);
            }
        });
    }

    /**
     * Isi semua hidden input dari localStorage
     */
    function fillUTMFields() {
        UTM_FIELDS.forEach(function (field) {
            const value = localStorage.getItem(field);
            if (!value) return;

            document.querySelectorAll('input[name="' + field + '"]').forEach(function (input) {
                if (input.value !== value) {
                    input.value = value;
                }
            });
        });
    }

    /**
     * Observe perubahan DOM (untuk Divi & CF7 AJAX re-render)
     */
    function observeDOMChanges() {
        const observer = new MutationObserver(function () {
            fillUTMFields();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Init
     */
    function init() {
        storeUTMFromURL();
        fillUTMFields();
        observeDOMChanges();
    }

    // Delay sedikit supaya aman dari NitroPack defer
    window.addEventListener('load', function () {
        setTimeout(init, 500);
    });

})();