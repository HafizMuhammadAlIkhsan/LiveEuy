#!/usr/bin/env bash
set -e

# ==============================================================================
# Script Instalasi & Konfigurasi Docker untuk CachyOS (Arch Linux)
# Digunakan untuk menjalankan backend microservices LiveEuy secara lokal
# ==============================================================================

echo "============================================================"
echo " [LiveEuy] Memulai Instalasi Docker & Docker Compose di CachyOS"
echo "============================================================"

if [ "$EUID" -ne 0 ]; then
  echo "[-] Script ini memerlukan hak akses root."
  echo "[-] Silakan jalankan dengan: sudo ./scripts/install_docker_cachyos.sh"
  exit 1
fi

TARGET_USER="${SUDO_USER:-$USER}"

echo "[1/4] Memperbarui package database dan menginstal Docker..."
pacman -Sy --noconfirm docker docker-compose

echo "[2/4] Mengaktifkan dan menjalankan Docker service..."
systemctl enable --now docker.service

echo "[3/4] Mendaftarkan pengguna '$TARGET_USER' ke dalam group 'docker'..."
usermod -aG docker "$TARGET_USER"

echo "[4/4] Memeriksa instalasi Docker..."
docker --version
docker compose version

echo "============================================================"
echo "[+] Docker & Docker Compose berhasil diinstal!"
echo "[+] PENTING: Jalankan perintah berikut agar izin grup docker aktif di sesi terminal saat ini:"
echo "      newgrp docker"
echo "    Atau logout dan login kembali ke sesi desktop Anda."
echo "============================================================"
