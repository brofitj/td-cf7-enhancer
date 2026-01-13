(function($) {
    'use strict';

    /**
     * Initialize Select2 untuk elemen select wilayah (regency)
     * - Mencegah double initialization
     * - Mendukung pencarian case-insensitive
     * - Menyesuaikan teks UI ke Bahasa Indonesia
     * - Auto-focus ke input pencarian saat dropdown dibuka
     * - Menjaga kompatibilitas validasi Contact Form 7
     */
    function initRegencySelect() {
        $('.regency-select').each(function() {
            const $select = $(this);

            if ($select.hasClass('select2-hidden-accessible')) {
                return;
            }

            $select.select2({
                placeholder: 'Ketik untuk mencari...',
                allowClear: true,
                width: '100%',
                minimumInputLength: 0,
                dropdownAutoWidth: true,
                language: {
                    noResults: () => 'Tidak ada hasil ditemukan',
                    searching: () => 'Mencari...',
                    inputTooShort: () => 'Ketik untuk mencari',
                    loadingMore: () => 'Memuat lebih banyak...'
                },
                matcher: function(params, data) {
                    if ($.trim(params.term) === '') return data;
                    if (typeof data.text === 'undefined') return null;

                    const term = params.term.toLowerCase();
                    const text = data.text.toLowerCase();

                    return text.includes(term) ? data : null;
                }
            });

            $select.on('select2:open', function() {
                setTimeout(() => {
                    const searchField = document.querySelector('.select2-search__field');
                    if (searchField) searchField.focus();
                }, 50);
            });

            $select.on('select2:select select2:clear', function() {
                $(this).trigger('change');
            });
        });
    }

    /**
     * Menangani reset form Contact Form 7
     * - Reset Select2 setelah form berhasil dikirim
     * - Re-initialize Select2 setelah validasi error
     */
    function handleFormReset() {
        document.addEventListener('wpcf7mailsent', function() {
            $('.regency-select').val('').trigger('change');
        });

        document.addEventListener('wpcf7invalid', function() {
            initRegencySelect();
        });
    }

    /**
     * Re-initialize Select2 ketika form CF7 dimuat ulang melalui AJAX
     */
    function handleAjaxFormLoad() {
        $(document).on('wpcf7:init', function() {
            initRegencySelect();
        });
    }

    /**
     * Handler input WhatsApp / Telepon
     * - Menampilkan prefix +62 secara visual
     * - Menyimpan nomor bersih (tanpa +62) ke hidden input
     * - Mencegah penghapusan prefix +62
     * - Memastikan input hanya berupa angka
     */
    function initWhatsAppInput() {
        const phoneInputs = document.querySelectorAll(
            'input[name="whatsapp"], input[name="phone"], input[name="telepon"]'
        );

        phoneInputs.forEach(function(phoneInput) {
            let hiddenInput = phoneInput.parentElement.querySelector('.cf7-phone-hidden');

            if (!hiddenInput) {
                hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = phoneInput.name;
                hiddenInput.className = 'cf7-phone-hidden';
                phoneInput.parentElement.appendChild(hiddenInput);

                phoneInput.name = phoneInput.name + '_display';
            }

            phoneInput.addEventListener('focus', function() {
                if (!this.value) this.value = '+62';
            });

            phoneInput.addEventListener('blur', function() {
                if (this.value === '+62' || this.value === '') {
                    this.value = '';
                    hiddenInput.value = '';
                }
            });

            phoneInput.addEventListener('input', function() {
                if (this.value && !this.value.startsWith('+62')) {
                    this.value = '+62' + this.value.replace(/^\+?62?/, '');
                }

                let cleanValue = this.value.replace(/^\+62/, '');
                hiddenInput.value = cleanValue.replace(/\D/g, '');
            });

            phoneInput.addEventListener('keypress', function(e) {
                if (![8, 46, 37, 39].includes(e.keyCode) && !/[0-9]/.test(String.fromCharCode(e.which))) {
                    e.preventDefault();
                }
            });

            phoneInput.addEventListener('keydown', function(e) {
                if ((e.keyCode === 8 || e.keyCode === 46) && this.selectionStart <= 3) {
                    e.preventDefault();
                }
            });
        });
    }

    $(document).ready(function() {
        initRegencySelect();
        handleFormReset();
        handleAjaxFormLoad();
        initWhatsAppInput();
    });

    $(window).on('load', function() {
        setTimeout(function() {
            initRegencySelect();
            initWhatsAppInput();
        }, 100);
    });

})(jQuery);