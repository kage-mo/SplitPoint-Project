#!/bin/bash

# Step 1: Install InfluxDB
sudo apt-get update
sudo apt-get install -y influxdb2
sudo systemctl enable influxdb
sudo systemctl start influxdb

# Step 2: Setup InfluxDB
influx setup \
  --org kagiso-org \
  --bucket telegraf \
  --username admin \
  --password admin123 \
  --force  

# Step 3: Create an API Token for Telegram and store in ENV
token_output=$(influx auth create -d Telegraf-Token --all-access)
export TOKEN_INFLUX=$(echo "$token_output" | awk 'NR==2 {print $3}')
export TOKEN_INFLUX_ID=$(echo "$token_output" | awk 'NR==2 {print $1}')

# Step 4: Activate the Token 
influx auth active --id $TOKEN_INFLUX_ID 

# Step 5: Get the config file from GitHub
sudo apt install git -y
TARGET_DIR="/home/kage/Downloads/splitpoint-project"
REPO_URL="https://github.com/kage-mo/SplitPoint-Project"
git clone "$REPO_URL" "$TARGET_DIR"

# Step 6: Create configurations for Telegraf 
influx telegrafs create \
  --name "network-monitoring" \
  --description "split-point-project-telegraf-config" \
  --file $TARGET_DIR/configs/telegraf-splitpoint-config.conf

echo "InfluxDB installed, configured, and setup successfully."
