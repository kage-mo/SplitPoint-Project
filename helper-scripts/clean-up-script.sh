#!/bin/bash


sudo systemctl stop influxdb
sudo systemctl stop telegraf
sudo systemctl stop grafana-server
sudo apt-get remove --purge influxdb telegraf grafana


sudo rm -rf /etc/influxdb /var/lib/influxdb
sudo rm -rf /etc/telegraf /var/log/telegraf
sudo rm -rf /etc/grafana /var/lib/grafana /var/log/grafana


sudo apt-get autoremove --purge


sudo apt-get clean
echo "InfluxDB, Telegraf, and Grafana have been removed from your system."
