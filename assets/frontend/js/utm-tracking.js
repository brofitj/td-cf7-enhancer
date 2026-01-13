document.addEventListener('DOMContentLoaded', function () {

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
