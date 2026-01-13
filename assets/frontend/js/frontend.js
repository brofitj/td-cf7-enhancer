/**
 * CF7 Regency Select - JavaScript Handler
 * Version: 1.0.0
 */

(function($) {
    'use strict';

    /**
     * Initialize Select2 pada regency select
     */
    function initRegencySelect() {
        $('.regency-select').each(function() {
            const $select = $(this);
            
            // Skip jika sudah di-initialize
            if ($select.hasClass('select2-hidden-accessible')) {
                return;
            }

            // Initialize Select2
            $select.select2({
                placeholder: 'Ketik untuk mencari...',
                allowClear: true,
                width: '100%',
                minimumInputLength: 0,
                dropdownAutoWidth: true,
                language: {
                    noResults: function() {
                        return 'Tidak ada hasil ditemukan';
                    },
                    searching: function() {
                        return 'Mencari...';
                    },
                    inputTooShort: function() {
                        return 'Ketik untuk mencari';
                    },
                    loadingMore: function() {
                        return 'Memuat lebih banyak...';
                    }
                },
                // Matcher custom untuk pencarian yang lebih baik
                matcher: function(params, data) {
                    // Jika tidak ada search term, tampilkan semua
                    if ($.trim(params.term) === '') {
                        return data;
                    }

                    // Tidak ada text untuk option ini
                    if (typeof data.text === 'undefined') {
                        return null;
                    }

                    // Search case-insensitive
                    const term = params.term.toLowerCase();
                    const text = data.text.toLowerCase();

                    // Cari di text
                    if (text.indexOf(term) > -1) {
                        return data;
                    }

                    return null;
                }
            });

            // Auto-focus ke search box saat dropdown dibuka
            $select.on('select2:open', function() {
                // Timeout kecil untuk memastikan dropdown sudah render
                setTimeout(function() {
                    const searchField = document.querySelector('.select2-search__field');
                    if (searchField) {
                        searchField.focus();
                    }
                }, 50);
            });

            // Event handler saat select berubah
            $select.on('select2:select', function() {
                // Trigger change untuk CF7 validation
                $(this).trigger('change');
            });

            // Event handler saat clear
            $select.on('select2:clear', function() {
                $(this).trigger('change');
            });
        });
    }

    /**
     * Reset form handler
     */
    function handleFormReset() {
        document.addEventListener('wpcf7mailsent', function(event) {
            // Reset semua regency select
            $('.regency-select').each(function() {
                $(this).val('').trigger('change');
            });
        });

        // Reset saat form di-reset manual
        document.addEventListener('wpcf7invalid', function(event) {
            // Pastikan Select2 tetap berfungsi setelah validation error
            initRegencySelect();
        });
    }

    /**
     * Re-initialize saat form di-load via AJAX
     */
    function handleAjaxFormLoad() {
        // Untuk CF7 yang di-load via AJAX
        $(document).on('wpcf7:init', function() {
            initRegencySelect();
        });
    }

    /**
     * WhatsApp Input Handler - Auto prefix +62 (visual only)
     */
    function initWhatsAppInput() {
        const phoneInputs = document.querySelectorAll('input[name="whatsapp"], input[name="phone"], input[name="telepon"]');
        
        phoneInputs.forEach(function(phoneInput) {
            // Tambahkan hidden input untuk menyimpan value tanpa +62
            let hiddenInput = phoneInput.parentElement.querySelector('.cf7-phone-hidden');
            if (!hiddenInput) {
                hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = phoneInput.name;
                hiddenInput.className = 'cf7-phone-hidden';
                phoneInput.parentElement.appendChild(hiddenInput);
                
                // Ubah name input asli agar tidak terkirim
                phoneInput.name = phoneInput.name + '_display';
            }

            // Saat kolom diklik/fokus
            phoneInput.addEventListener('focus', function() {
                if (!this.value) {
                    this.value = '+62';
                }
            });

            // Saat klik di luar kolom/blur
            phoneInput.addEventListener('blur', function() {
                if (this.value === '+62' || this.value === '') {
                    this.value = '';
                    hiddenInput.value = '';
                }
            });

            // Update hidden input dengan value tanpa +62
            phoneInput.addEventListener('input', function() {
                // Pastikan selalu ada +62 di depan
                if (this.value && !this.value.startsWith('+62')) {
                    this.value = '+62' + this.value.replace(/^\+?62?/, '');
                }

                // Simpan ke hidden input tanpa +62
                let cleanValue = this.value.replace(/^\+62/, '');
                // Hanya simpan angka
                cleanValue = cleanValue.replace(/\D/g, '');
                hiddenInput.value = cleanValue;
            });

            // Validasi hanya angka setelah +62
            phoneInput.addEventListener('keypress', function(e) {
                const char = String.fromCharCode(e.which);
                // Allow backspace, delete, arrow keys
                if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 37 || e.keyCode === 39) {
                    return true;
                }
                // Only allow numbers after +62
                if (!/[0-9]/.test(char)) {
                    e.preventDefault();
                }
            });

            // Prevent deleting +62 prefix
            phoneInput.addEventListener('keydown', function(e) {
                const cursorPos = this.selectionStart;
                // Prevent backspace/delete if cursor before position 3 (+62)
                if ((e.keyCode === 8 || e.keyCode === 46) && cursorPos <= 3) {
                    e.preventDefault();
                }
            });
        });
    }

    /**
     * Initialize saat document ready
     */
    $(document).ready(function() {
        initRegencySelect();
        handleFormReset();
        handleAjaxFormLoad();
        initWhatsAppInput();
    });

    /**
     * Re-initialize saat window loaded (fallback)
     */
    $(window).on('load', function() {
        // Delay untuk memastikan CF7 sudah selesai load
        setTimeout(function() {
            initRegencySelect();
            initWhatsAppInput();
        }, 100);
    });

})(jQuery);