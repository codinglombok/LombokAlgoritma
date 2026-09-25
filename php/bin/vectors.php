<?php

// LombokAlgoritma — vector runner CLI (SPEC §4.3, §14)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//
// Usage (from the repo root): php php/bin/vectors.php vectors/lombokalgoritma-vectors-v1.json > out/php.txt
// Writes `group<TAB>id<TAB>canonical(actual)` per case to stdout; exits 1 on any mismatch or
// unknown group, 2 on an unexpected error.

declare(strict_types=1);

use LombokAlgoritma\Vectors\Runner;

$autoload = dirname(__DIR__, 2) . '/vendor/autoload.php';
if (is_file($autoload)) {
    require $autoload;
} else {
    spl_autoload_register(static function (string $class): void {
        $prefix = 'LombokAlgoritma\\';
        if (str_starts_with($class, $prefix)) {
            $path = dirname(__DIR__) . '/src/LombokAlgoritma/' . str_replace('\\', '/', substr($class, strlen($prefix)))
                . '.php';
            if (is_file($path)) {
                require $path;
            }
        }
    });
}

try {
    $report = Runner::run($argv[1] ?? null);
} catch (\Throwable $e) {
    fwrite(STDERR, 'vector runner error: ' . get_class($e) . ': ' . $e->getMessage() . PHP_EOL);
    exit(2);
}

foreach ($report['lines'] as $line) {
    echo $line, "\n";
}
foreach ($report['missing'] as $group) {
    fwrite(STDERR, "unknown vector group: {$group}\n");
}
foreach ($report['failures'] as $failure) {
    fwrite(STDERR, "MISMATCH {$failure}\n");
}
fwrite(
    STDERR,
    sprintf(
        "%d cases, %d failures, %d unknown groups\n",
        $report['cases'],
        count($report['failures']),
        count($report['missing']),
    ),
);
exit($report['failures'] === [] && $report['missing'] === [] ? 0 : 1);
