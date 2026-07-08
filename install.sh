#!/usr/bin/env bash
# SCS installer entrypoint.
#
# Local use:
#   ./install.sh --target codex --profile full
#
# Raw GitHub use:
#   curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/main/install.sh \
#     | SCS_REPO=<owner>/<repo> bash -s -- --target codex --profile full
#
# Set SCS_REPO_DEFAULT below after creating the new GitHub repository so the
# raw install command can be used without the SCS_REPO environment variable.

set -euo pipefail

SCS_REPO_DEFAULT="stijnswapped/stijncodesetup"
SCS_REF="${SCS_REF:-main}"
SCS_REPO="${SCS_REPO:-$SCS_REPO_DEFAULT}"
SCS_ARCHIVE_URL="${SCS_ARCHIVE_URL:-}"
SCS_KEEP_TEMP="${SCS_KEEP_TEMP:-0}"

resolve_script_dir() {
    local script_path="${BASH_SOURCE[0]:-$0}"

    while [ -L "$script_path" ]; do
        local link_dir
        link_dir="$(cd "$(dirname "$script_path")" && pwd)"
        script_path="$(readlink "$script_path")"
        [[ "$script_path" != /* ]] && script_path="$link_dir/$script_path"
    done

    cd "$(dirname "$script_path")" && pwd
}

ensure_node() {
    if ! command -v node >/dev/null 2>&1; then
        echo "[SCS] Node.js 18+ is required but node was not found on PATH." >&2
        exit 1
    fi
}

ensure_dependencies() {
    local repo_dir="$1"

    if [ ! -d "$repo_dir/node_modules" ]; then
        echo "[SCS] Installing dependencies..."
        (cd "$repo_dir" && npm install --no-audit --no-fund --loglevel=error)
    fi
}

node_installer_path() {
    local repo_dir="$1"

    if command -v cygpath >/dev/null 2>&1; then
        cygpath -w "$repo_dir/scripts/install-apply.js"
    else
        printf '%s\n' "$repo_dir/scripts/install-apply.js"
    fi
}

run_from_repo() {
    local repo_dir="$1"
    shift

    ensure_node
    ensure_dependencies "$repo_dir"

    local node_script
    node_script="$(node_installer_path "$repo_dir")"
    exec node "$node_script" "$@"
}

download_archive() {
    local archive_path="$1"
    local archive_url="$2"

    if command -v curl >/dev/null 2>&1; then
        curl -fsSL "$archive_url" -o "$archive_path"
    elif command -v wget >/dev/null 2>&1; then
        wget -qO "$archive_path" "$archive_url"
    else
        echo "[SCS] curl or wget is required for raw GitHub installs." >&2
        exit 1
    fi
}

bootstrap_from_github() {
    if [ "$SCS_REPO" = "CHANGE_ME/SCS" ] && [ -z "$SCS_ARCHIVE_URL" ]; then
        cat >&2 <<'EOF'
[SCS] Raw install needs a repository source.

Set SCS_REPO when piping from raw.githubusercontent.com:
  curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/main/install.sh \
    | SCS_REPO=<owner>/<repo> bash -s -- --target codex --profile full

Or edit SCS_REPO_DEFAULT inside install.sh after creating the new repository.
EOF
        exit 1
    fi

    local archive_url="${SCS_ARCHIVE_URL:-https://github.com/${SCS_REPO}/archive/${SCS_REF}.tar.gz}"
    local temp_dir archive_path extract_dir repo_dir
    temp_dir="$(mktemp -d "${TMPDIR:-/tmp}/scs-install.XXXXXX")"
    archive_path="$temp_dir/source.tar.gz"
    extract_dir="$temp_dir/source"

    if [ "$SCS_KEEP_TEMP" != "1" ]; then
        trap 'rm -rf "$temp_dir"' EXIT
    else
        echo "[SCS] Keeping temp directory: $temp_dir"
    fi

    echo "[SCS] Downloading $archive_url"
    download_archive "$archive_path" "$archive_url"

    mkdir -p "$extract_dir"
    tar -xzf "$archive_path" -C "$extract_dir" --strip-components=1

    repo_dir="$extract_dir"
    if [ ! -f "$repo_dir/scripts/install-apply.js" ]; then
        echo "[SCS] Downloaded archive does not contain scripts/install-apply.js" >&2
        exit 1
    fi

    run_from_repo "$repo_dir" "$@"
}

main() {
    local script_dir
    script_dir="$(resolve_script_dir)"

    if [ -f "$script_dir/scripts/install-apply.js" ]; then
        run_from_repo "$script_dir" "$@"
    fi

    bootstrap_from_github "$@"
}

main "$@"
