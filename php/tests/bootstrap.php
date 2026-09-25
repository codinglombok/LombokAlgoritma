<?php

// LombokAlgoritma — PHPUnit bootstrap: Composer autoloader when installed, else a PSR-4 fallback
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

$composer = dirname(__DIR__, 2) . '/vendor/autoload.php';
if (is_file($composer)) {
    require $composer;
    return;
}

spl_autoload_register(static function (string $class): void {
    $map = [
        'LombokAlgoritma\\Tests\\' => __DIR__ . '/',
        'LombokAlgoritma\\' => dirname(__DIR__) . '/src/LombokAlgoritma/',
    ];
    foreach ($map as $prefix => $dir) {
        if (str_starts_with($class, $prefix)) {
            $path = $dir . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
            if (is_file($path)) {
                require $path;
            }
            return;
        }
    }
});
