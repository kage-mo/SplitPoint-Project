Steps to install Grafana
Step 1: prerequisite packagessudo apt-get install -y apt-transport-https
sudo apt-get install -y software-properties-common wget
sudo wget -q -O /usr/share/keyrings/grafana.key https://apt.grafana.com/gpg.key
echo "deb [signed-by=/usr/share/keyrings/grafana.key] https://apt.grafana.com stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list


Step 2: Add grafana as a service
sudo apt-get install grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
