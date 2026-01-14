#!/bin/bash
set -e

CERT_DIR="$(dirname "$0")"
KEY_FILE="$CERT_DIR/key.pem"
CERT_FILE="$CERT_DIR/cert.pem"

if [ -f "$KEY_FILE" ] || [ -f "$CERT_FILE" ]; then
  echo "Certificate files already exist. Remove $KEY_FILE and $CERT_FILE to regenerate."
  exit 1
fi

echo "Generating private key..."
openssl genrsa -out "$KEY_FILE" 2048

echo "Generating self-signed certificate..."
openssl req -new -x509 -key "$KEY_FILE" -out "$CERT_FILE" -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

echo "Certificate generated:"
echo "  Key: $KEY_FILE"
echo "  Cert: $CERT_FILE"
echo ""
echo "To use with a server, point to these files for HTTPS."
