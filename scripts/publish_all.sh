#!/usr/bin/env bash
# LombokAlgoritma — Publish to All 11 Registries
# Apache-2.0 — @codinglombok
# Usage: bash scripts/publish_all.sh [--dry-run]
set -euo pipefail

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true
[[ "$DRY_RUN" == "true" ]] && echo "[DRY RUN] No packages will actually be published."

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

tag=$(git describe --tags --exact-match 2>/dev/null || echo "")
[[ -z "$tag" ]] && { echo "Error: not on a release tag. Run from a v* tag."; exit 1; }
VERSION="${tag#v}"
echo "Publishing LombokAlgoritma v$VERSION to all 11 registries..."
echo ""

run() { [[ "$DRY_RUN" == "true" ]] && echo "[DRY] $*" || eval "$@"; }

# 1. npm
echo "[1/11] npm — lombokalgoritma"
npm run build && run npm publish --access public
echo ""

# 2. JSR (Deno)
echo "[2/11] JSR — @codinglombok/lombokalgoritma"
run npx jsr publish --directory ports/ts
echo ""

# 3. crates.io
echo "[3/11] crates.io — lombokalgoritma"
run cargo publish --token "$CARGO_REGISTRY_TOKEN"
echo ""

# 4. PyPI
echo "[4/11] PyPI — lombokalgoritma"
pip install hatch && hatch build
run python3 -m twine upload dist/*
echo ""

# 5. Packagist (auto-update via webhook)
echo "[5/11] Packagist — codinglombok/lombokalgoritma"
run curl -XPOST -H 'content-type:application/json' \
  "https://packagist.org/api/update-package?username=codinglombok&apiToken=${PACKAGIST_TOKEN}" \
  -d '{"repository":{"url":"https://github.com/codinglombok/LombokAlgoritma"}}'
echo ""

# 6. Go pkg.dev (auto-indexed on tag push)
echo "[6/11] Go — github.com/codinglombok/lombokalgoritma"
run curl "https://sum.golang.org/lookup/github.com/codinglombok/lombokalgoritma@v$VERSION"
echo ""

# 7. Maven Central
echo "[7/11] Maven Central — com.codinglombok:lombokalgoritma"
run mvn deploy --no-transfer-progress -pl ports/java \
  -Dgpg.passphrase="$GPG_PASSPHRASE"
echo ""

# 8. NuGet
echo "[8/11] NuGet — CodingLombok.LombokAlgoritma"
dotnet pack ports/csharp --configuration Release -o nupkgs
run dotnet nuget push nupkgs/*.nupkg \
  --api-key "$NUGET_API_KEY" \
  --source https://api.nuget.org/v3/index.json
echo ""

# 9. CPAN
echo "[9/11] CPAN — LombokAlgoritma"
echo "  Manual: cd ports/perl && cpan-upload -u codinglombok LombokAlgoritma-$VERSION.tar.gz"
echo ""

# 10. Swift Package Index (auto-indexed on tag push)
echo "[10/11] Swift Package Index — LombokAlgoritma"
echo "  Auto-indexed from GitHub tag $tag"
echo ""

# 11. vcpkg
echo "[11/11] vcpkg — lombokalgoritma"
echo "  Submit PR to microsoft/vcpkg with ports/vcpkg/lombokalgoritma/"
echo ""

echo "=== Publish complete for LombokAlgoritma v$VERSION ==="
echo ""
echo "Required secrets:"
echo "  NPM_TOKEN, CARGO_REGISTRY_TOKEN, PACKAGIST_TOKEN"
echo "  OSSRH_USERNAME, OSSRH_TOKEN, GPG_PASSPHRASE"
echo "  NUGET_API_KEY"
