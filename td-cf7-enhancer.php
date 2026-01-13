<?php
/**
 * Plugin Name: TebarDigital - Contact Form 7 Enhancer
 * Plugin URI: #
 * Description: Plugin ini menambahkan peningkatan fitur pada Contact Form 7 berupa integrasi Select2, kustomisasi WhatsApp untuk lead handling, validasi tambahan, tracking UTM, serta perbaikan UI agar form lebih modern dan user-friendly.
 * Version: 1.0
 * Author: TebarDigital
 * Author URI: https://tebardigital.co.id
 * License: GPL2
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Membuat default Contact Form 7 saat plugin diaktifkan
 * jika form default belum tersedia
 */
register_activation_hook(__FILE__, 'cf7_regency_create_default_form');
function cf7_regency_create_default_form()
{
    if (!function_exists('wpcf7_contact_form')) {
        return;
    }

    $existing_forms = get_posts([
        'post_type'      => 'wpcf7_contact_form',
        'meta_key'       => '_cf7_regency_default_form',
        'meta_value'     => '1',
        'posts_per_page' => 1
    ]);

    if (!empty($existing_forms)) {
        return;
    }

    $form_template = <<<CF7
    <label> Nama
    [text* nama autocomplete:name] </label>

    <label> Email
    [email email autocomplete:email] </label>

    <label> Telepon
    [text telepon autocomplete:tel placeholder "+62..."] </label>

    <label> WhatsApp
    [text whatsapp autocomplete:whatsapp placeholder "+62..."] </label>

    <label> Perusahaan
    [text perusahaan autocomplete:organization] </label>

    <label> Karyawan
    [number karyawan] </label>

    <label> Kota/Kab.
    [regency_select kota-kab] </label>

    <label> Website
    [text website] </label>

    <label hidden> UTM Source [text utm_source] </label>
    <label hidden> UTM Medium [text utm_medium] </label>
    <label hidden> UTM Campaign [text utm_campaign] </label>
    <label hidden> UTM Term [text utm_term] </label>
    <label hidden> UTM Content [text utm_content] </label>
    <label hidden> GCLID [text gclid] </label>
    <label hidden> GBRAID [text gbraid] </label>

    <div class="tbr_btn__wrap">[submit "Submit"]</div>
    CF7;

    $mail_template = <<<MAIL
    Nama : [nama]
    Email : [email]
    Telepon : [telepon]
    WhatsApp : [whatsapp]
    Perusahaan : [perusahaan]
    Karyawan : [karyawan]
    Kota/Kab. : [kota-kab]
    Website : [website]
    MAIL;

    $form_id = wp_insert_post([
        'post_title'  => 'Lead Magnet Form',
        'post_status' => 'publish',
        'post_type'   => 'wpcf7_contact_form'
    ]);

    if (!$form_id) {
        return;
    }

    update_post_meta($form_id, '_form', $form_template);

    update_post_meta($form_id, '_mail', [
        'subject'            => 'Lead Magnet Form',
        'sender'             => '[nama] <[email]>',
        'body'               => $mail_template,
        'recipient'          => get_option('admin_email'),
        'additional_headers' => 'Reply-To: [email]',
        'attachments'        => '',
        'use_html'           => 0,
        'exclude_blank'      => 0
    ]);

    update_post_meta($form_id, '_mail_2', [
        'active'    => 1,
        'subject'   => 'Terima kasih atas minat Anda',
        'sender'    => get_bloginfo('name') . ' <' . get_option('admin_email') . '>',
        'recipient' => '[email]',
        'body'      => <<<EOT
        Halo [nama],

        Terima kasih telah menghubungi kami. Kami akan segera menghubungi Anda melalui WhatsApp di nomor [whatsapp].

        Salam,
        Tim {get_bloginfo('name')}
        EOT,
        'use_html' => 0
    ]);

    update_post_meta($form_id, '_messages', [
        'mail_sent_ok'     => 'Terima kasih! Pesan Anda telah terkirim.',
        'mail_sent_ng'     => 'Terjadi kesalahan. Silakan coba lagi.',
        'validation_error' => 'Ada kesalahan pada form. Mohon periksa kembali.',
        'spam'             => 'Terjadi kesalahan. Silakan coba lagi.',
        'accept_terms'     => 'Anda harus menyetujui syarat dan ketentuan.',
        'invalid_required' => 'Field ini wajib diisi.',
        'invalid_too_long' => 'Field ini terlalu panjang.',
        'invalid_too_short'=> 'Field ini terlalu pendek.'
    ]);

    update_post_meta($form_id, '_cf7_regency_default_form', '1');

    if (function_exists('wpcf7_contact_form')) {
        $contact_form = wpcf7_contact_form($form_id);
        if ($contact_form) {
            $contact_form->save();
        }
    }

    set_transient('cf7_regency_form_created', $form_id, 60);
}

/**
 * Menampilkan notifikasi admin setelah aktivasi plugin
 */
add_action('admin_notices', 'cf7_regency_activation_notice');
function cf7_regency_activation_notice()
{
    $form_id = get_transient('cf7_regency_form_created');
    if (!$form_id) {
        return;
    }

    $edit_url  = admin_url('admin.php?page=wpcf7&post=' . $form_id . '&action=edit');
    $shortcode = '[contact-form-7 id="' . $form_id . '" title="Lead Magnet Form"]';

    echo '<div class="notice notice-success is-dismissible">
        <p><strong>✅ CF7 Enhancer:</strong> Form berhasil dibuat.</p>
        <p><input type="text" value="' . esc_attr($shortcode) . '" readonly onclick="this.select()" style="width:400px"></p>
        <p>
            <a href="' . esc_url($edit_url) . '" class="button button-primary">Edit Form</a>
            <button class="button" onclick="navigator.clipboard.writeText(\'' . esc_js($shortcode) . '\')">Copy Shortcode</button>
        </p>
    </div>';

    delete_transient('cf7_regency_form_created');
}

/**
 * Registrasi custom form tag CF7 untuk select kabupaten/kota
 */
add_action('wpcf7_init', function () {
    wpcf7_add_form_tag(
        ['regency_select', 'regency_select*'],
        'cf7_regency_select_handler',
        ['name-attr' => true]
    );
});

/**
 * Enqueue asset frontend (Select2 & custom asset)
 */
add_action('wp_enqueue_scripts', function () {
    if (!function_exists('wpcf7_enqueue_scripts')) {
        return;
    }

    wp_enqueue_style('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', [], '4.1.0');
    wp_enqueue_script('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', ['jquery'], '4.1.0', true);

    wp_enqueue_style('cf7-regency-select', plugin_dir_url(__FILE__) . 'assets/frontend/css/frontend.css', ['select2'], '2.0.0');
    wp_enqueue_script('cf7-regency-select', plugin_dir_url(__FILE__) . 'assets/frontend/js/frontend.js', ['jquery', 'select2'], '2.0.0', true);
});

/**
 * Mengambil data kabupaten/kota dari file data terpisah
 */
function cf7_get_regencies_data()
{
    static $regencies = null;

    if ($regencies !== null) {
        return $regencies;
    }

    $file = plugin_dir_path(__FILE__) . 'data/regencies.php';
    $regencies = file_exists($file) ? include $file : [];

    return $regencies;
}

/**
 * Render HTML select untuk custom CF7 tag regency_select
 */
function cf7_regency_select_handler($tag)
{
    $name     = $tag->name;
    $required = $tag->is_required() ? 'required' : '';
    $class    = 'regency-select wpcf7-form-control wpcf7-select';

    $options = '<option value="">Pilih Kabupaten / Kota</option>';
    foreach (cf7_get_regencies_data() as $regency) {
        $label = esc_html($regency['type'] . ' ' . $regency['name']);
        $options .= '<option value="' . esc_attr($regency['id']) . '">' . $label . '</option>';
    }

    return '<span class="wpcf7-form-control-wrap ' . esc_attr($name) . '">
        <select name="' . esc_attr($name) . '" class="' . esc_attr($class) . '" ' . $required . '>' . $options . '</select>
    </span>';
}

/**
 * Validasi field regency_select
 */
add_filter('wpcf7_validate_regency_select', 'cf7_regency_select_validation', 10, 2);
add_filter('wpcf7_validate_regency_select*', 'cf7_regency_select_validation', 10, 2);
function cf7_regency_select_validation($result, $tag)
{
    $value = trim($_POST[$tag->name] ?? '');
    if ($tag->is_required() && $value === '') {
        $result->invalidate($tag, 'Silakan pilih kabupaten/kota');
    }
    return $result;
}

/**
 * Validasi CF7: minimal salah satu field kontak harus diisi
 * (email / telepon / WhatsApp)
 */
add_filter('wpcf7_validate', 'td_cf7_validate_min_one_contact', 10, 2);
function td_cf7_validate_min_one_contact($result, $tags)
{
    $submission = WPCF7_Submission::get_instance();
    if (!$submission) {
        return $result;
    }

    $data = $submission->get_posted_data();

    if (
        trim($data['email'] ?? '') === '' &&
        trim($data['telepon'] ?? '') === '' &&
        trim($data['whatsapp'] ?? '') === ''
    ) {
        $message = 'Minimal salah satu: Email, Telepon, atau WhatsApp harus diisi.';
        $result->invalidate('email', $message);
        $result->invalidate('telepon', $message);
        $result->invalidate('whatsapp', $message);
    }

    return $result;
}

/**
 * Enqueue script validasi frontend CF7
 */
add_action('wp_enqueue_scripts', 'td_cf7_enqueue_assets');
function td_cf7_enqueue_assets()
{
    if (!function_exists('wpcf7')) {
        return;
    }

    wp_enqueue_script('td-cf7-validation', plugin_dir_url(__FILE__) . 'assets/frontend/js/cf7-validation.js', [], '1.0.0', true);
}

/**
 * Enqueue script tracking UTM untuk Contact Form 7
 */
add_action('wp_enqueue_scripts', 'td_cf7_enqueue_utm_tracking');
function td_cf7_enqueue_utm_tracking()
{
    if (!defined('WPCF7_VERSION')) {
        return;
    }

    wp_enqueue_script('td-cf7-utm-tracking', plugin_dir_url(__FILE__) . 'assets/frontend/js/utm-tracking.js', [], '1.0.0', true);
}

/**
 * Menonaktifkan auto-formatting bawaan Contact Form 7
 */
add_filter('wpcf7_autop_or_not', '__return_false');