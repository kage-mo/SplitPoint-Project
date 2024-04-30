#!/bin/bash

# Step 1: Install prerequisite packages
echo "Installing prerequisite packages..."
sudo apt-get update
sudo apt-get install -y apt-transport-https software-properties-common wget

# Check if Grafana repository is already added
if ! grep -q "grafana.list" /etc/apt/sources.list.d/*; then
    echo "Adding Grafana repository..."
    sudo wget -q -O /usr/share/keyrings/grafana.key https://apt.grafana.com/gpg.key
    echo "deb [signed-by=/usr/share/keyrings/grafana.key] https://apt.grafana.com stable main" | sudo tee /etc/apt/sources.list.d/grafana.list
else
    echo "Grafana repository already exists."
fi

# Step 2: Install Grafana
echo "Installing Grafana..."
sudo apt-get update
sudo apt-get install -y grafana

# Start and enable Grafana service
echo "Starting Grafana service..."
sudo systemctl start grafana-server
sudo systemctl enable grafana-server

echo "Grafana installation completed."
