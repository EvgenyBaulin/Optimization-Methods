#!/bin/bash
# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
#
# Every test of the deploy pipeline, run on the Mac: bash Deploy/tests/run-tests.sh
#   1. unit tests
#   2. publish.py --dry-run against this repository (read-only, no network)
#   3. unit tests and a dry run on a fixture repository in python:3.9-slim
#   4. the end-to-end scenarios in ubuntu:22.04 (in-container.sh), the repository mounted read-only
# The dry-run output of step 2 is kept in $TMPDIR/course-deploy-tests/. Needs Docker for 3 and 4.

set -uo pipefail
# no __pycache__ in the kit folder that is uploaded to the server
export PYTHONDONTWRITEBYTECODE=1

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
repo=$(cd "$here/../.." && pwd)
out=${TMPDIR:-/tmp}/course-deploy-tests
mkdir -p "$out"
cd "$repo" || exit 1
failed=()

step() { printf '\n=== %s\n' "$*"; }

step "1. Unit tests"
if ! python3 -m unittest discover -s Deploy/tests; then
    failed+=("unit tests")
fi

step "2. publish.py --dry-run against this repository"
dry_ok=yes
for args in "--dry-run" "--dry-run --allow-dirty"; do
    printf -- '--- python3 Deploy/publish.py %s\n' "$args"
    # shellcheck disable=SC2086 # two plain flags
    python3 Deploy/publish.py $args > "$out/dry-run${args//[ -]/_}.txt" 2>&1
    code=$?
    cat "$out/dry-run${args//[ -]/_}.txt"
    printf -- '--- exit %s\n' "$code"
    # a refusal (1) is an answer about the working tree; a crash or a usage error is not
    if [[ $code -gt 1 ]] || grep -q Traceback "$out/dry-run${args//[ -]/_}.txt"; then
        dry_ok=no
    fi
done
[[ $dry_ok == yes ]] || failed+=("dry run against this repository")
echo "Kept in $out"

if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running: steps 3 and 4 were skipped."
    failed+=("docker steps skipped")
else
    step "3. Python 3.9 compatibility (python:3.9-slim)"
    docker build -q -t course-deploy-test-py39:1 - > /dev/null <<'EOF' || failed+=("python 3.9 image")
FROM python:3.9-slim
RUN apt-get update -q && apt-get install -y -q --no-install-recommends git && rm -rf /var/lib/apt/lists/*
EOF
    docker run --rm -v "$repo/Deploy:/deploy:ro" course-deploy-test-py39:1 bash -euc '
        python3 --version
        cp -r /deploy /tmp/Deploy
        cd /tmp && python3 -m unittest discover -s Deploy/tests
        git config --global user.name Test && git config --global user.email test@example.org
        git config --global init.defaultBranch main
        mkdir -p /tmp/course/Atlas/js "/tmp/course/Seminars/Evgeny Baulin/web/02. Convexity, Constraints and Optimality Conditions" \
                 "/tmp/course/Seminars/Evgeny Baulin/web/vendor"
        cd /tmp/course && cp -r /tmp/Deploy Deploy && rm -rf Deploy/tests
        printf "<!doctype html><script src=\"js/app.js\"></script><a href=\"/seminars/\">Seminars</a>\n" > Atlas/index.html
        echo "console.log(1);" > Atlas/js/app.js
        echo "# notes" > Atlas/README.md
        web="Seminars/Evgeny Baulin/web"
        printf "<!doctype html><script src=\"../vendor/katex.js\"></script>\n" > "$web/02. Convexity, Constraints and Optimality Conditions/main.html"
        echo "var k;" > "$web/vendor/katex.js"
        echo "MIT" > "$web/vendor/LICENSE"
        cat > Deploy/publish.conf <<CONF
course | / | Atlas | now
course | /seminars/vendor/ | Seminars/Evgeny Baulin/web/vendor | now
course | /seminars/02/ | Seminars/Evgeny Baulin/web/vendor | now
course | /seminars/02/ | Seminars/Evgeny Baulin/web/02. Convexity, Constraints and Optimality Conditions | 2099-09-01 18:10
CONF
        git init -q . && git add -A && git commit -q -m "Fixture"
        python3 Deploy/publish.py --dry-run
    ' || failed+=("python 3.9 compatibility")

    step "4. End-to-end scenarios (ubuntu:22.04)"
    docker build -q -t course-deploy-test-e2e:1 - > /dev/null <<'EOF' || failed+=("ubuntu image")
FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update -q && apt-get install -y -q --no-install-recommends \
      nginx openssl curl git python3 openssh-server sudo systemd shellcheck ca-certificates tzdata git-lfs \
    && rm -rf /var/lib/apt/lists/*
EOF
    docker run --rm -v "$repo:/repo:ro" course-deploy-test-e2e:1 bash /repo/Deploy/tests/in-container.sh \
        || failed+=("end-to-end scenarios")
fi

step "Result"
if (( ${#failed[@]} )); then
    printf 'FAILED: %s\n' "${failed[@]}"
    exit 1
fi
echo "All tests passed."
