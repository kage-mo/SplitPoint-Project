#!/bin/bash

# Step 1: Install Telegraf
sudo apt-get update
sudo apt-get install -y telegraf
sudo systemctl enable telegraf
sudo systemctl start telegraf

echo "Telegraf installed and started successfully."
