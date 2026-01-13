document.addEventListener('DOMContentLoaded', function () {

    /**
     * Reset nilai hidden field telepon & WhatsApp
     * serta menghapus pesan error custom
     * setelah form Contact Form 7 berhasil dikirim
     */
    function handleMailSentReset() {
        document.addEventListener('wpcf7mailsent', function (event) {
            const form = event.target;

            const hiddenTelepon = form.querySelector('input[type="hidden"][name="telepon"]');
            if (hiddenTelepon) hiddenTelepon.value = '';

            const hiddenWhatsapp = form.querySelector('input[type="hidden"][name="whatsapp"]');
            if (hiddenWhatsapp) hiddenWhatsapp.value = '';

            const error = form.querySelector('.td-cf7-error');
            if (error) error.remove();
        });
    }

    /**
     * Validasi custom Contact Form 7
     * Memastikan minimal salah satu field berikut terisi:
     * - Email
     * - Telepon
     * - WhatsApp
     *
     * Jika semua kosong, submit dibatalkan dan pesan error ditampilkan
     */
    function handleAtLeastOneContactValidation() {
        document.addEventListener('wpcf7submit', function (event) {
            const form = event.target;

            const email = form.querySelector('input[name="email"]');
            const teleponDisplay = form.querySelector('input[name="telepon_display"]');
            const whatsappDisplay = form.querySelector('input[name="whatsapp_display"]');

            if (!email && !teleponDisplay && !whatsappDisplay) return;

            const emailVal = email?.value.trim() || '';
            const teleponVal = teleponDisplay?.value.trim() || '';
            const whatsappVal = whatsappDisplay?.value.trim() || '';

            const oldError = form.querySelector('.td-cf7-error');
            if (oldError) oldError.remove();

            if (emailVal === '' && teleponVal === '' && whatsappVal === '') {
                event.preventDefault();

                const errorDiv = document.createElement('div');
                errorDiv.className = 'td-cf7-error';
                errorDiv.textContent =
                    'Minimal salah satu: Email, Telepon, atau WhatsApp harus diisi.';

                const submitBtn = form.querySelector(
                    'input[type="submit"], button[type="submit"]'
                );

                if (submitBtn) {
                    submitBtn.after(errorDiv);
                } else {
                    form.appendChild(errorDiv);
                }
            }
        });
    }

    handleMailSentReset();
    handleAtLeastOneContactValidation();

});