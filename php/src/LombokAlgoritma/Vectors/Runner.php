<?php

// LombokAlgoritma — shared-vector runner (SPEC §4.3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Vectors;

/**
 * Runs every case of `vectors/lombokalgoritma-vectors-v1.json`, producing one line
 * `group<TAB>id<TAB>canonical(actual)` per case (groups sorted, cases in file order).
 */
final class Runner
{
    /** Default vector file, relative to this source file (php/src/LombokAlgoritma/Vectors → repo root). */
    public static function defaultFile(): string
    {
        return dirname(__DIR__, 4) . '/vectors/lombokalgoritma-vectors-v1.json';
    }

    /**
     * @return array{lines: list<string>, failures: list<string>, missing: list<string>, cases: int}
     * @throws \JsonException|\UnexpectedValueException for an unreadable / unsupported vector file
     */
    public static function run(?string $file = null): array
    {
        $file ??= self::defaultFile();
        $text = @file_get_contents($file);
        if ($text === false) {
            throw new \UnexpectedValueException("cannot read vector file {$file}");
        }
        $doc = Input::obj(Json::parse($text));
        if (($doc['format'] ?? null) !== 'lombokalgoritma-vectors' || ($doc['version'] ?? null) !== 1) {
            throw new \UnexpectedValueException('unsupported vector file');
        }
        $groups = Input::obj(Input::get($doc, 'groups'));
        $names = array_map('strval', array_keys($groups));
        sort($names, SORT_STRING);
        $lines = [];
        $failures = [];
        $missing = [];
        $cases = 0;
        foreach ($names as $group) {
            if (!Dispatch::has($group)) {
                $missing[] = $group;
                continue;
            }
            foreach (Input::list($groups[$group]) as $c) {
                $c = Input::obj($c);
                $cases++;
                $id = Input::str(Input::get($c, 'id'));
                $got = Json::canonical(Dispatch::run($group, Input::get($c, 'input')));
                $lines[] = "{$group}\t{$id}\t{$got}";
                $want = Json::canonical(Input::get($c, 'expected'));
                if ($got !== $want) {
                    $failures[] = "{$group}/{$id}: expected {$want}, got {$got}";
                }
            }
        }
        return ['lines' => $lines, 'failures' => $failures, 'missing' => $missing, 'cases' => $cases];
    }
}
