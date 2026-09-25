<?php

// LombokAlgoritma — error type carrying the canonical SPEC §2 error code
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma;

/**
 * Every error LombokAlgoritma throws is an AlgoException whose {@see getErrorCode()} is one of the
 * canonical codes of SPEC §2 (identical in every port). Branch on the code, never on the message.
 */
final class AlgoException extends \InvalidArgumentException
{
    public const INVALID_INPUT = 'INVALID_INPUT';
    public const OUT_OF_RANGE = 'OUT_OF_RANGE';
    public const EMPTY_INPUT = 'EMPTY_INPUT';
    public const NEGATIVE_WEIGHT = 'NEGATIVE_WEIGHT';
    public const NO_INVERSE = 'NO_INVERSE';
    public const NOT_COPRIME = 'NOT_COPRIME';
    public const OVERFLOW = 'OVERFLOW';
    public const OUT_OF_BOUNDS = 'OUT_OF_BOUNDS';
    public const UNSUPPORTED = 'UNSUPPORTED';

    private const CODES = [
        self::INVALID_INPUT,
        self::OUT_OF_RANGE,
        self::EMPTY_INPUT,
        self::NEGATIVE_WEIGHT,
        self::NO_INVERSE,
        self::NOT_COPRIME,
        self::OVERFLOW,
        self::OUT_OF_BOUNDS,
        self::UNSUPPORTED,
    ];

    private readonly string $errorCode;

    public function __construct(string $errorCode, string $message, ?\Throwable $previous = null)
    {
        if (!in_array($errorCode, self::CODES, true)) {
            throw new \LogicException("unknown LombokAlgoritma error code {$errorCode}");
        }
        parent::__construct($message, 0, $previous);
        $this->errorCode = $errorCode;
    }

    /** Canonical error code (SPEC §2), e.g. `OUT_OF_RANGE`. */
    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public static function invalidInput(string $message): self
    {
        return new self(self::INVALID_INPUT, $message);
    }

    public static function outOfRange(string $message): self
    {
        return new self(self::OUT_OF_RANGE, $message);
    }

    public static function emptyInput(string $context): self
    {
        return new self(self::EMPTY_INPUT, "Not enough input elements for {$context}");
    }

    public static function negativeWeight(string $context): self
    {
        return new self(self::NEGATIVE_WEIGHT, "{$context}: negative edge weight");
    }

    public static function noInverse(string $message): self
    {
        return new self(self::NO_INVERSE, $message);
    }

    public static function notCoprime(string $message): self
    {
        return new self(self::NOT_COPRIME, $message);
    }
}
