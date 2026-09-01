<?php
declare(strict_types=1);

// Site owner: change this single constant to update the destination address.
const RECIPIENT = 'sumyeungai@gmail.com';

// Site owner: replace this placeholder with a real domain mailbox after DNS/SPF is configured.
// Must be a real address on THIS site's own domain: mail sent from a domain
// that does not exist fails SPF/DMARC and is bounced or filed as spam.
// Update this when the site moves to a custom domain.
const FROM_ADDRESS = 'no-reply@red-eland-359073.hostingersite.com';

const MAX_MESSAGE_LENGTH = 5000;
const MAX_NAME_LENGTH = 200;
const MIN_RENDER_SECONDS = 2;
const RATE_LIMIT_SECONDS = 45;

header('Content-Type: application/json');

function respond_success()
{
    echo json_encode(['ok' => true], JSON_UNESCAPED_SLASHES);
    exit;
}

function respond_error(string $error, int $status = 400)
{
    http_response_code($status);
    echo json_encode(['ok' => false, 'error' => $error], JSON_UNESCAPED_SLASHES);
    exit;
}

function normalize_host(string $host): string
{
    $host = strtolower(trim($host));
    $host = preg_replace('/:\d+$/', '', $host) ?? $host;

    if (str_starts_with($host, 'www.')) {
        return substr($host, 4);
    }

    return $host;
}

function same_origin_headers_look_valid(): bool
{
    $siteHost = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
    $siteHost = normalize_host((string) $siteHost);

    if ($siteHost === '') {
        return true;
    }

    foreach (['HTTP_ORIGIN', 'HTTP_REFERER'] as $headerName) {
        $value = $_SERVER[$headerName] ?? '';

        if (!is_string($value) || trim($value) === '') {
            continue;
        }

        $submittedHost = parse_url($value, PHP_URL_HOST);

        if (!is_string($submittedHost) || normalize_host($submittedHost) !== $siteHost) {
            return false;
        }
    }

    return true;
}

function post_field(string $key): ?string
{
    if (!array_key_exists($key, $_POST)) {
        return '';
    }

    $value = $_POST[$key];

    if (is_array($value)) {
        return null;
    }

    return (string) $value;
}

function header_value(string $value, int $maxLength = 200): string
{
    $value = preg_replace('/[\x00-\x1F\x7F]+/', ' ', $value) ?? '';
    $value = preg_replace('/[ \t]+/', ' ', $value) ?? '';
    $value = trim($value);

    return limit_text($value, $maxLength);
}

function body_value(string $value, int $maxLength): string
{
    $value = preg_replace('/[\x00-\x1F\x7F]+/', ' ', $value) ?? '';
    $value = preg_replace('/[ \t]+/', ' ', $value) ?? '';
    $value = trim($value);

    return limit_text($value, $maxLength);
}

function text_length(string $value): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($value, 'UTF-8');
    }

    return strlen($value);
}

function limit_text(string $value, int $maxLength): string
{
    if (text_length($value) <= $maxLength) {
        return $value;
    }

    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $maxLength, 'UTF-8');
    }

    return substr($value, 0, $maxLength);
}

function rendered_too_fast(string $renderedAt): bool
{
    if ($renderedAt === '' || !is_numeric($renderedAt)) {
        return true;
    }

    $timestamp = (float) $renderedAt;

    if ($timestamp > 100000000000) {
        $timestamp = $timestamp / 1000;
    }

    $now = time();

    if ($timestamp <= 0 || $timestamp > ($now + 5)) {
        return true;
    }

    return ($now - $timestamp) < MIN_RENDER_SECONDS;
}

function rate_limited(): bool
{
    try {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';

        if (!is_string($ip) || $ip === '') {
            return false;
        }

        $directory = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'hktax-contact-rate-limit';

        if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
            return false;
        }

        $path = $directory . DIRECTORY_SEPARATOR . hash('sha256', $ip) . '.txt';
        $handle = @fopen($path, 'c+');

        if ($handle === false) {
            return false;
        }

        if (!@flock($handle, LOCK_EX)) {
            @fclose($handle);
            return false;
        }

        $contents = stream_get_contents($handle);
        $lastSubmittedAt = is_string($contents) ? (int) trim($contents) : 0;
        $now = time();

        if ($lastSubmittedAt > 0 && ($now - $lastSubmittedAt) < RATE_LIMIT_SECONDS) {
            @flock($handle, LOCK_UN);
            @fclose($handle);
            return true;
        }

        if (@ftruncate($handle, 0) === false || @rewind($handle) === false || @fwrite($handle, (string) $now) === false) {
            @flock($handle, LOCK_UN);
            @fclose($handle);
            return false;
        }

        @fflush($handle);
        @flock($handle, LOCK_UN);
        @fclose($handle);
    } catch (Throwable) {
        return false;
    }

    return false;
}

function allowed_subject_label(string $kind, string $subject): ?string
{
    $subjects = [
        'contact' => [
            'general' => 'General enquiry',
            'tax-question' => 'Tax question',
            'technical' => 'Technical issue',
            'privacy' => 'Privacy question',
            'other' => 'Other',
        ],
        'feedback' => [
            'bug' => 'Bug report',
            'calculation' => 'Calculation query',
            'ui' => 'UI suggestion',
            'content' => 'Content suggestion',
            'other' => 'Other',
        ],
    ];

    return $subjects[$kind][$subject] ?? null;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond_error('method', 405);
}

if (!same_origin_headers_look_valid()) {
    respond_error('invalid');
}

$rawName = post_field('name');
$rawEmail = post_field('email');
$rawKind = post_field('kind');
$rawSubject = post_field('subject');
$rawMessage = post_field('message');
$honeypot = post_field('website');
$renderedAt = post_field('rendered_at');

if ($rawName === null || $rawEmail === null || $rawKind === null || $rawSubject === null || $rawMessage === null || $honeypot === null || $renderedAt === null) {
    respond_error('invalid');
}

if (trim($honeypot) !== '') {
    respond_error('spam');
}

if (rendered_too_fast(trim($renderedAt))) {
    respond_error('spam');
}

$kind = header_value($rawKind, 20);

if ($kind !== 'contact' && $kind !== 'feedback') {
    respond_error('invalid');
}

$subject = header_value($rawSubject, 80);

if ($subject === '') {
    $subject = $kind === 'contact' ? 'general' : 'other';
}

$subjectLabel = allowed_subject_label($kind, $subject);

if ($subjectLabel === null) {
    respond_error('invalid');
}

$name = body_value($rawName, MAX_NAME_LENGTH);
$email = header_value($rawEmail, 254);
$message = body_value($rawMessage, MAX_MESSAGE_LENGTH);

if ($message === '' || text_length($rawMessage) > MAX_MESSAGE_LENGTH || text_length($rawName) > MAX_NAME_LENGTH) {
    respond_error('invalid');
}

$validEmail = '';

if ($email !== '') {
    $filteredEmail = filter_var($email, FILTER_VALIDATE_EMAIL);

    if ($filteredEmail === false) {
        respond_error('invalid');
    }

    $validEmail = $filteredEmail;
}

if (rate_limited()) {
    respond_error('rate_limited', 429);
}

$submittedAt = gmdate('Y-m-d H:i:s') . ' UTC';
$remoteIp = body_value((string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 80);
$mailSubject = header_value('HK Tax Assistant ' . $kind . ': ' . $subjectLabel, 160);
$body = implode("\n", [
    'New HK Tax Assistant form submission',
    '',
    'Kind: ' . $kind,
    'Subject/category: ' . $subjectLabel,
    'Name: ' . ($name !== '' ? $name : 'Not provided'),
    'Email: ' . ($validEmail !== '' ? $validEmail : 'Not provided'),
    'Submitted at: ' . $submittedAt,
    'Remote IP: ' . ($remoteIp !== '' ? $remoteIp : 'unknown'),
    '',
    'Message:',
    $message,
]);

$headers = [
    'From: HK Tax Assistant <' . FROM_ADDRESS . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
];

if ($validEmail !== '') {
    $headers[] = 'Reply-To: ' . $validEmail;
}

if (!mail(RECIPIENT, $mailSubject, $body, $headers)) {
    respond_error('send_failed', 500);
}

respond_success();
