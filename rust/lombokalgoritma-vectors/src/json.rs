// LombokAlgoritma — minimal JSON parser + canonical serializer (SPEC §3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! A dependency-free JSON value, parser and canonical serializer.
//!
//! Numbers are parsed like ECMAScript `JSON.parse` (to `f64`, correctly rounded, `-0` kept),
//! so `canonical(parse(expected))` reproduces the TypeScript reference exactly.
use std::fmt::Write as _;

/// A JSON value. [`Value::Int`] only appears in computed outputs (SPEC §3.1 integer rule).
#[derive(Debug, Clone, PartialEq)]
pub enum Value {
    /// `null`
    Null,
    /// `true` / `false`
    Bool(bool),
    /// A double (formatted per SPEC §3.2).
    Num(f64),
    /// An exact integer: a JSON number when `|v| ≤ 2^53 − 1`, else a decimal string.
    Int(i128),
    /// A string.
    Str(String),
    /// An array.
    Arr(Vec<Value>),
    /// An object (keys sorted on output).
    Obj(Vec<(String, Value)>),
}

impl Value {
    /// Field `key` of an object.
    pub fn get(&self, key: &str) -> Option<&Value> {
        match self {
            Value::Obj(kv) => kv.iter().find(|(k, _)| k == key).map(|(_, v)| v),
            _ => None,
        }
    }

    /// Build an object from `(key, value)` pairs.
    pub fn obj<const N: usize>(pairs: [(&str, Value); N]) -> Value {
        Value::Obj(pairs.into_iter().map(|(k, v)| (k.to_string(), v)).collect())
    }
}

/// Parse a complete JSON document.
///
/// # Errors
/// A message for malformed JSON.
pub fn parse(text: &str) -> Result<Value, String> {
    let mut p = Parser {
        s: text.as_bytes(),
        i: 0,
    };
    let v = p.value()?;
    p.ws();
    if p.i != p.s.len() {
        return Err(format!("trailing data at byte {}", p.i));
    }
    Ok(v)
}

struct Parser<'a> {
    s: &'a [u8],
    i: usize,
}

impl Parser<'_> {
    fn ws(&mut self) {
        while self.i < self.s.len() && matches!(self.s[self.i], b' ' | b'\t' | b'\n' | b'\r') {
            self.i += 1;
        }
    }

    fn peek(&self) -> Option<u8> {
        self.s.get(self.i).copied()
    }

    fn expect(&mut self, c: u8) -> Result<(), String> {
        if self.peek() == Some(c) {
            self.i += 1;
            Ok(())
        } else {
            Err(format!("expected '{}' at byte {}", c as char, self.i))
        }
    }

    fn literal(&mut self, word: &str, v: Value) -> Result<Value, String> {
        if self.s[self.i..].starts_with(word.as_bytes()) {
            self.i += word.len();
            Ok(v)
        } else {
            Err(format!("bad literal at byte {}", self.i))
        }
    }

    fn value(&mut self) -> Result<Value, String> {
        self.ws();
        match self.peek() {
            Some(b'{') => self.object(),
            Some(b'[') => self.array(),
            Some(b'"') => self.string().map(Value::Str),
            Some(b't') => self.literal("true", Value::Bool(true)),
            Some(b'f') => self.literal("false", Value::Bool(false)),
            Some(b'n') => self.literal("null", Value::Null),
            Some(c) if c == b'-' || c.is_ascii_digit() => self.number(),
            _ => Err(format!("unexpected input at byte {}", self.i)),
        }
    }

    fn object(&mut self) -> Result<Value, String> {
        self.expect(b'{')?;
        let mut kv = Vec::new();
        self.ws();
        if self.peek() == Some(b'}') {
            self.i += 1;
            return Ok(Value::Obj(kv));
        }
        loop {
            self.ws();
            let k = self.string()?;
            self.ws();
            self.expect(b':')?;
            let v = self.value()?;
            kv.push((k, v));
            self.ws();
            match self.peek() {
                Some(b',') => self.i += 1,
                Some(b'}') => {
                    self.i += 1;
                    return Ok(Value::Obj(kv));
                }
                _ => return Err(format!("expected ',' or '}}' at byte {}", self.i)),
            }
        }
    }

    fn array(&mut self) -> Result<Value, String> {
        self.expect(b'[')?;
        let mut items = Vec::new();
        self.ws();
        if self.peek() == Some(b']') {
            self.i += 1;
            return Ok(Value::Arr(items));
        }
        loop {
            items.push(self.value()?);
            self.ws();
            match self.peek() {
                Some(b',') => self.i += 1,
                Some(b']') => {
                    self.i += 1;
                    return Ok(Value::Arr(items));
                }
                _ => return Err(format!("expected ',' or ']' at byte {}", self.i)),
            }
        }
    }

    fn hex4(&mut self) -> Result<u32, String> {
        let h = self
            .s
            .get(self.i..self.i + 4)
            .and_then(|b| std::str::from_utf8(b).ok())
            .and_then(|t| u32::from_str_radix(t, 16).ok())
            .ok_or_else(|| format!("bad \\u escape at byte {}", self.i))?;
        self.i += 4;
        Ok(h)
    }

    fn string(&mut self) -> Result<String, String> {
        self.expect(b'"')?;
        let mut out = String::new();
        loop {
            let start = self.i;
            while self.i < self.s.len() && self.s[self.i] != b'"' && self.s[self.i] != b'\\' {
                self.i += 1;
            }
            out.push_str(std::str::from_utf8(&self.s[start..self.i]).map_err(|e| e.to_string())?);
            match self.peek() {
                Some(b'"') => {
                    self.i += 1;
                    return Ok(out);
                }
                Some(b'\\') => {
                    self.i += 1;
                    let c = self.peek().ok_or("unterminated escape")?;
                    self.i += 1;
                    match c {
                        b'"' => out.push('"'),
                        b'\\' => out.push('\\'),
                        b'/' => out.push('/'),
                        b'b' => out.push('\u{8}'),
                        b'f' => out.push('\u{c}'),
                        b'n' => out.push('\n'),
                        b'r' => out.push('\r'),
                        b't' => out.push('\t'),
                        b'u' => {
                            let mut cp = self.hex4()?;
                            if (0xd800..0xdc00).contains(&cp)
                                && self.s[self.i..].starts_with(b"\\u")
                            {
                                self.i += 2;
                                let lo = self.hex4()?;
                                cp = 0x10000
                                    + ((cp - 0xd800) << 10)
                                    + (lo.wrapping_sub(0xdc00) & 0x3ff);
                            }
                            out.push(char::from_u32(cp).ok_or("lone surrogate")?);
                        }
                        _ => return Err(format!("bad escape at byte {}", self.i)),
                    }
                }
                _ => return Err("unterminated string".into()),
            }
        }
    }

    fn number(&mut self) -> Result<Value, String> {
        let start = self.i;
        while self.i < self.s.len()
            && matches!(
                self.s[self.i],
                b'-' | b'+' | b'.' | b'e' | b'E' | b'0'..=b'9'
            )
        {
            self.i += 1;
        }
        let t = std::str::from_utf8(&self.s[start..self.i]).map_err(|e| e.to_string())?;
        t.parse::<f64>()
            .map(Value::Num)
            .map_err(|_| format!("bad number {t:?}"))
    }
}

/// SPEC §3.2: ECMAScript `Number::toString`, except `-0` → `-0`; NaN/±∞ → JSON strings.
pub fn format_number(x: f64) -> String {
    if x.is_nan() {
        return "\"NaN\"".into();
    }
    if x.is_infinite() {
        return if x > 0.0 {
            "\"Infinity\""
        } else {
            "\"-Infinity\""
        }
        .into();
    }
    if x == 0.0 {
        return if x.is_sign_negative() { "-0" } else { "0" }.into();
    }
    if x < 0.0 {
        return format!("-{}", format_number(-x));
    }
    // Rust's `{:e}` gives the shortest round-trip digits: "d.ddde±x"
    let e = format!("{x:e}");
    let (mant, exp) = e.split_once('e').unwrap_or((e.as_str(), "0"));
    let digits: String = mant.chars().filter(char::is_ascii_digit).collect();
    let digits = digits.trim_end_matches('0');
    let digits = if digits.is_empty() { "0" } else { digits };
    let k = digits.len() as i64;
    let n = exp.parse::<i64>().unwrap_or(0) + 1; // x = 0.d1…dk × 10^n
    if k <= n && n <= 21 {
        format!("{digits}{}", "0".repeat((n - k) as usize))
    } else if 0 < n && n <= 21 {
        let (a, b) = digits.split_at(n as usize);
        format!("{a}.{b}")
    } else if -6 < n && n <= 0 {
        format!("0.{}{digits}", "0".repeat((-n) as usize))
    } else {
        let (d1, rest) = digits.split_at(1);
        let sign = if n - 1 < 0 { '-' } else { '+' };
        let dot = if rest.is_empty() {
            String::new()
        } else {
            format!(".{rest}")
        };
        format!("{d1}{dot}e{sign}{}", (n - 1).abs())
    }
}

fn write_str(out: &mut String, s: &str) {
    out.push('"');
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\u{8}' => out.push_str("\\b"),
            '\u{c}' => out.push_str("\\f"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => {
                let _ = write!(out, "\\u{:04x}", c as u32);
            }
            c => out.push(c),
        }
    }
    out.push('"');
}

const MAX_SAFE: i128 = (1 << 53) - 1;

fn write_value(out: &mut String, v: &Value) {
    match v {
        Value::Null => out.push_str("null"),
        Value::Bool(b) => out.push_str(if *b { "true" } else { "false" }),
        Value::Num(x) => out.push_str(&format_number(*x)),
        Value::Int(i) => {
            if (-MAX_SAFE..=MAX_SAFE).contains(i) {
                let _ = write!(out, "{i}");
            } else {
                let _ = write!(out, "\"{i}\"");
            }
        }
        Value::Str(s) => write_str(out, s),
        Value::Arr(items) => {
            out.push('[');
            for (i, x) in items.iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                write_value(out, x);
            }
            out.push(']');
        }
        Value::Obj(kv) => {
            let mut sorted: Vec<&(String, Value)> = kv.iter().collect();
            sorted.sort_by(|a, b| a.0.encode_utf16().cmp(b.0.encode_utf16()));
            out.push('{');
            for (i, (k, x)) in sorted.into_iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                write_str(out, k);
                out.push(':');
                write_value(out, x);
            }
            out.push('}');
        }
    }
}

/// Canonical JSON of `v` (SPEC §3).
pub fn canonical(v: &Value) -> String {
    let mut out = String::new();
    write_value(&mut out, v);
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn numbers() {
        let cases: [(f64, &str); 16] = [
            (0.1, "0.1"),
            (0.1 + 0.2, "0.30000000000000004"),
            (1e20, "100000000000000000000"),
            (1e21, "1e+21"),
            (1e-7, "1e-7"),
            (1.23e-18, "1.23e-18"),
            (5e-324, "5e-324"),
            (f64::MAX, "1.7976931348623157e+308"),
            (9_007_199_254_740_992.0, "9007199254740992"),
            (-0.0, "-0"),
            (0.0, "0"),
            (1234.5678, "1234.5678"),
            (0.000_001_234, "0.000001234"),
            (-1.5e-7, "-1.5e-7"),
            (100.0, "100"),
            (123_456_789_012_345_680_000.0, "123456789012345680000"),
        ];
        for (x, want) in cases {
            assert_eq!(format_number(x), want);
        }
        assert_eq!(format_number(f64::NAN), "\"NaN\"");
        assert_eq!(format_number(f64::INFINITY), "\"Infinity\"");
        assert_eq!(format_number(f64::NEG_INFINITY), "\"-Infinity\"");
    }

    #[test]
    fn roundtrip() {
        let text = r#"{"b":[1,-0,2.5e-3,"x\n\u00e9\ud83d\ude00\u0001",true,false,null],"a":{}}"#;
        let v = parse(text).unwrap();
        assert_eq!(
            canonical(&v),
            "{\"a\":{},\"b\":[1,-0,0.0025,\"x\\n\u{e9}\u{1f600}\\u0001\",true,false,null]}"
        );
        assert_eq!(canonical(&Value::Int(1 << 53)), "\"9007199254740992\"");
        assert_eq!(canonical(&Value::Int(-5)), "-5");
        assert!(parse("[1,]").is_err());
        assert!(parse("{\"a\" 1}").is_err());
        assert!(parse("tru").is_err());
        assert!(parse("1 2").is_err());
        assert!(parse("\"\\q\"").is_err());
        assert!(parse("[1").is_err());
        assert_eq!(v.get("zz"), None);
        assert_eq!(Value::Null.get("a"), None);
    }
}
