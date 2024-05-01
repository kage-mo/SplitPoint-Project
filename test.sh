#!/bin/bash
mkdir configs
touch configs/ec2-influxdb.conf
cat # Configuration for telegraf agent
[agent]
  interval = "30s"
  round_interval = true
  metric_batch_size = 1000
  metric_buffer_limit = 10000
  collection_jitter = "0s"
  flush_interval = "10s"
  flush_jitter = "0s"
  precision = ""
  hostname = ""
  omit_hostname = false

# Output plugin for sending metrics to InfluxDB
[[outputs.influxdb_v2]]
  urls = ["http://localhost:8086"]
  token = "$INFLUX_TOKEN"
  organization = "kagiso-org"
  bucket = "telegraf"
  timeout = "60s"

# Input plugin for reading formatted metrics from HTTP endpoints
[[inputs.http]]
  urls = [
    "http://localhost:3001/monitoring/icmptests",
    "http://localhost:3001/monitoring/icmptests/packetTrace",
  ]
  method = "GET"
  timeout = "60s"
  data_format = "json"

# Input plugin for collecting response time of a TCP connection
[[inputs.net_response]]
  protocol = "tcp"
  address = "localhost:5000"
  timeout = "2s"
  read_timeout = "2s"
  send = "message from telegraph agent"
  expect = "correct response"

[[inputs.dns_query]]
  ## servers to query
  servers = ["8.8.8.8"]
>> configs/ec2-influxdb.conf