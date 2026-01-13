document.addEventListener('DOMContentLoaded', function () {

    /**
     * Mengambil parameter tracking (UTM & Ads)
     * dari URL saat ini
     *
     * Parameter yang didukung:
     * - utm_source
     * - utm_medium
     * - utm_campaign
     * - utm_term
     * - utm_content
     * - gclid
     * - gbraid
     */
    function getLeadMagnetParameters() {
        const params = new URLSearchParams(window.location.search);

        return {
            utm_source: params.get('utm_source') || '',
            utm_medium: params.get('utm_medium') || '',
            utm_campaign: params.get('utm_campaign') || '',
            utm_term: params.get('utm_term') || '',
            utm_content: params.get('utm_content') || '',
            gclid: params.get('gclid') || '',
            gbraid: params.get('gbraid') || '',
        };
    }

    /**
     * Mengisi otomatis field input tersembunyi
     * pada Contact Form 7 berdasarkan parameter URL
     *
     * Mendukung format nama field:
     * - utm_source
     * - utm-source
     */
    function populateLeadMagnetFields() {
        const leadMagnetParams = getLeadMagnetParameters();

        Object.entries(leadMagnetParams).forEach(([key, value]) => {
            if (!value) return;

            const finalKey = key.includes('_') ? key.replaceAll('_', '-') : key;

            const input = document.querySelector(
                `input[name="${finalKey}"], input[name="${key}"]`
            );

            if (input) {
                input.value = value;
            }
        });
    }

    populateLeadMagnetFields();

});