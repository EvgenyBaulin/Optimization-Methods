#!/bin/bash
# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Evgeny Baulin
#
# Installs or updates course-deploy. Run as root from the uploaded kit folder:
#   bash install.sh "ssh-ed25519 AAAA... comment"     (or the path to a .pub file)
# A second run refreshes the code, the hooks, the units, the sudoers file and the key line;
# the configuration in /etc/course-deploy is created once and never overwritten.

set -euo pipefail
umask 022

KIT=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
DATA=/srv/course-deploy
REPO=$DATA/site.git
LIB=/usr/local/lib/course-deploy
BIN=/usr/local/bin/course-deploy
ETC=/etc/course-deploy
UNITS=/etc/systemd/system
SUDOERS=/etc/sudoers.d/course-deploy
STUB=/usr/local/bin/atlas-deploy
BACKUP=/root/atlas-deploy.old
SHELL_PATH=/usr/bin/git-shell
PACKAGES=(git python3 curl sudo openssh-server util-linux ca-certificates tzdata)
KIT_FILES=(course-deploy forbidden.txt pre-receive post-receive sudoers course-deploy.service
           course-deploy.timer course-deploy.conf sites.conf atlas-deploy
           course_deploy/__init__.py course_deploy/cli.py course_deploy/filters.py
           course_deploy/manifest.py course_deploy/notify.py course_deploy/pages.py
           course_deploy/release.py course_deploy/sitecheck.py)

say() { printf '%s\n' "$*"; }
die() { printf 'install.sh: %s\n' "$*" >&2; exit 1; }

[[ $# -eq 1 ]] || die 'usage: bash install.sh "<Mac public key>" (the key text or the path to a .pub file)'
[[ $(id -u) -eq 0 ]] || die "run it as root"
grep -qx 'ID=ubuntu' /etc/os-release 2>/dev/null || die "this installer is written for Ubuntu"
for f in "${KIT_FILES[@]}"; do
    [[ -f $KIT/$f ]] || die "$KIT/$f is missing; upload the whole course-deploy-kit folder again"
done

# 1. Packages, only the missing ones.
missing=()
for p in "${PACKAGES[@]}"; do
    if ! dpkg-query -W -f='${Status}' "$p" 2>/dev/null | grep -q 'install ok installed'; then
        missing+=("$p")
    fi
done
if (( ${#missing[@]} )); then
    say "Installing ${missing[*]}"
    apt-get update -q
    DEBIAN_FRONTEND=noninteractive apt-get install -y -q --no-install-recommends "${missing[@]}"
fi

# 2. The Mac key: ssh-ed25519 or ssh-rsa, and ssh-keygen must accept it.
if [[ -f $1 ]]; then
    key_line=$(grep -v -e '^[[:space:]]*$' -e '^[[:space:]]*#' -- "$1" | head -n 1 || true)
else
    key_line=$1
fi
key_line=${key_line//$'\r'/}
[[ $key_line != *PRIVATE* ]] || die "this is a private key; pass the .pub file or its text"
read -r key_type key_body key_comment <<< "$key_line" || true
case ${key_type:-} in
    ssh-ed25519 | ssh-rsa) ;;
    *) die "the key must be an ssh-ed25519 or ssh-rsa public key, got '${key_type:-nothing}'" ;;
esac
[[ ${key_body:-} =~ ^[A-Za-z0-9+/]+=*$ ]] || die "the key text after $key_type is not base64"
key_file=$(mktemp)
printf '%s %s\n' "$key_type" "$key_body" > "$key_file"
if ! key_fingerprint=$(ssh-keygen -lf "$key_file" 2>/dev/null); then
    rm -f "$key_file"
    die "ssh-keygen does not accept this key"
fi
rm -f "$key_file"
say "Mac key: $key_fingerprint"

# 3. The deploy user: git-shell only, the key restricted.
if ! id deploy > /dev/null 2>&1; then
    useradd --system --user-group --create-home --home-dir /home/deploy --shell "$SHELL_PATH" deploy
    usermod -p '*' deploy
    say "Created the user deploy."
fi
if [[ $(getent passwd deploy | cut -d: -f7) != "$SHELL_PATH" ]]; then
    usermod -s "$SHELL_PATH" deploy
    say "Set the shell of deploy to $SHELL_PATH."
fi
install -d -m 0700 -o deploy -g deploy /home/deploy/.ssh
keys=/home/deploy/.ssh/authorized_keys
keys_new=$(mktemp)
if [[ -f $keys ]]; then
    awk -v body="$key_body" '{ for (i = 1; i <= NF; i++) if ($i == body) next; print }' "$keys" > "$keys_new"
fi
printf 'restrict %s %s%s\n' "$key_type" "$key_body" "${key_comment:+ $key_comment}" >> "$keys_new"
install -m 0600 -o deploy -g deploy "$keys_new" "$keys"
rm -f "$keys_new"

# 4. The bare repository: owned by deploy, its config and hooks by root.
install -d -m 0755 -o root -g root "$DATA"
if [[ ! -d $REPO ]]; then
    git init --quiet --bare --initial-branch=site "$REPO"
    say "Created $REPO."
fi
repo_git=(git -c "safe.directory=$REPO" --git-dir="$REPO")
"${repo_git[@]}" config receive.denyNonFastForwards true
"${repo_git[@]}" config receive.denyDeletes true
"${repo_git[@]}" config receive.fsckObjects true
chown -R deploy:deploy "$REPO"
chown root:root "$REPO/config"
chmod 0644 "$REPO/config"
rm -rf "$REPO/hooks"
install -d -m 0755 -o root -g root "$REPO/hooks"
install -m 0755 -o root -g root "$KIT/pre-receive" "$REPO/hooks/pre-receive"
install -m 0755 -o root -g root "$KIT/post-receive" "$REPO/hooks/post-receive"

# 5. The code, the units and the sudoers rule.
install -m 0755 -o root -g root "$KIT/course-deploy" "$BIN"
rm -rf "$LIB/course_deploy"
install -d -m 0755 -o root -g root "$LIB" "$LIB/course_deploy"
install -m 0644 -o root -g root "$KIT"/course_deploy/*.py "$LIB/course_deploy/"
install -m 0644 -o root -g root "$KIT/forbidden.txt" "$LIB/forbidden.txt"
install -m 0644 -o root -g root "$KIT/course-deploy.service" "$UNITS/course-deploy.service"
install -m 0644 -o root -g root "$KIT/course-deploy.timer" "$UNITS/course-deploy.timer"
sudoers_new=$(mktemp)
cp "$KIT/sudoers" "$sudoers_new"
if ! visudo -cqf "$sudoers_new"; then
    rm -f "$sudoers_new"
    die "the sudoers rule does not validate; nothing was changed in /etc/sudoers.d"
fi
# sudo skips names with a dot, so the file is only read once it is complete
install -m 0440 -o root -g root "$sudoers_new" "/etc/sudoers.d/.course-deploy.new"
rm -f "$sudoers_new"
mv -f /etc/sudoers.d/.course-deploy.new "$SUDOERS"
if ! visudo -cq; then
    rm -f "$SUDOERS"
    die "sudo rejects its configuration with the new rule; the rule was removed again"
fi

# 6. Configuration (created once) and the data folders.
install -d -m 0700 -o root -g root "$ETC"
if [[ ! -e $ETC/course-deploy.conf ]]; then
    install -m 0600 -o root -g root "$KIT/course-deploy.conf" "$ETC/course-deploy.conf"
    say "Created $ETC/course-deploy.conf (e-mail alerts are off until it is filled in)."
fi
if [[ ! -e $ETC/sites.conf ]]; then
    install -m 0644 -o root -g root "$KIT/sites.conf" "$ETC/sites.conf"
    say "Created $ETC/sites.conf."
fi
install -d -m 0755 -o root -g root "$DATA/releases"
install -d -m 0700 -o root -g root "$DATA/state" "$DATA/work"
if [[ ! -e $DATA/lock ]]; then
    install -m 0600 -o root -g root /dev/null "$DATA/lock"
fi

# 7. The old manual deploy script gives way to a stub.
if [[ -e $STUB ]] && ! cmp -s "$KIT/atlas-deploy" "$STUB"; then
    if [[ ! -e $BACKUP ]]; then
        mv "$STUB" "$BACKUP"
        say "Moved the old $STUB to $BACKUP."
    elif ! cmp -s "$STUB" "$BACKUP"; then
        extra=$BACKUP.$(date +%Y%m%d%H%M%S)
        mv "$STUB" "$extra"
        say "$BACKUP already exists; kept the current $STUB as $extra."
    fi
fi
install -m 0755 -o root -g root "$KIT/atlas-deploy" "$STUB"

# 8. sshd settings that would lock deploy out.
if sshd_settings=$(sshd -T 2> /dev/null); then
    read -r -a deploy_groups <<< "$(id -nG deploy)"
    allow_users=() allow_groups=() deny_users=() deny_groups=()
    while read -r keyword rest; do
        read -r -a values <<< "$rest"
        case $keyword in
            allowusers) allow_users+=("${values[@]}") ;;
            allowgroups) allow_groups+=("${values[@]}") ;;
            denyusers) deny_users+=("${values[@]}") ;;
            denygroups) deny_groups+=("${values[@]}") ;;
        esac
    done <<< "$sshd_settings"
    matches_user() {
        local pattern
        for pattern in "$@"; do
            # shellcheck disable=SC2053 # sshd patterns are globs
            [[ deploy == ${pattern%%@*} ]] && return 0
        done
        return 1
    }
    matches_group() {
        local pattern group
        for pattern in "$@"; do
            for group in "${deploy_groups[@]}"; do
                # shellcheck disable=SC2053 # sshd patterns are globs
                [[ $group == $pattern ]] && return 0
            done
        done
        return 1
    }
    blocking=()
    if (( ${#allow_users[@]} )) && ! matches_user "${allow_users[@]}"; then
        blocking+=("AllowUsers ${allow_users[*]}")
    fi
    if (( ${#allow_groups[@]} )) && ! matches_group "${allow_groups[@]}"; then
        blocking+=("AllowGroups ${allow_groups[*]}")
    fi
    if (( ${#deny_users[@]} )) && matches_user "${deny_users[@]}"; then
        blocking+=("DenyUsers ${deny_users[*]}")
    fi
    if (( ${#deny_groups[@]} )) && matches_group "${deny_groups[@]}"; then
        blocking+=("DenyGroups ${deny_groups[*]}")
    fi
    for setting in "${blocking[@]}"; do
        say "Warning: sshd will refuse the deploy user because of '$setting'."
        say "  Allow deploy in /etc/ssh/sshd_config (or a file in sshd_config.d), then: systemctl reload ssh"
    done
else
    say "Note: 'sshd -T' failed, so the sshd settings for deploy were not checked."
fi

# 9. systemd: load the units; the timer is enabled by hand after the first publish.
if [[ -d /run/systemd/system ]]; then
    systemctl daemon-reload
else
    say "Note: systemd is not running here; the units were copied but not loaded."
fi

say ""
say "Server is ready."
say ""
say "Host key fingerprints (compare them on the first connection from the Mac):"
for f in /etc/ssh/ssh_host_*_key.pub; do
    if [[ -e $f ]]; then
        say "  $(ssh-keygen -lf "$f")"
    fi
done
say ""
say "On the Mac:"
say '  ssh course-deploy                      # expect "Interactive git shell is not enabled"'
say "  python3 Deploy/publish.py --dry-run"
say "  python3 Deploy/publish.py"
say ""
say "Then on the server:"
say "  systemctl enable --now course-deploy.timer"
