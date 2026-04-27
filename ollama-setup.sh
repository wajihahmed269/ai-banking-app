#!/bin/bash
# automated-ollama-setup.sh
# This script is designed to be used as AWS EC2 User Data for the AI Tier.

# Export HOME for cloud-init environment to prevent Ollama panic
export HOME=/root

# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Wait for Ollama to be available
sleep 10

# 3. Configure Ollama to listen on all interfaces (0.0.0.0)
mkdir -p /etc/systemd/system/ollama.service.d
cat << 'EOF' > /etc/systemd/system/ollama.service.d/override.conf
[Service]
Environment="OLLAMA_HOST=0.0.0.0"
EOF

# 4. Reload and restart Ollama
systemctl daemon-reload
systemctl restart ollama

# 5. Pull the TinyLlama model
sleep 5
ollama pull tinyllama

# 6. Verify
ollama list
