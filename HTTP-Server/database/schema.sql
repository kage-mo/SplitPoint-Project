CREATE DATABASE splitpoint_project:
USE splitpoint_project;


CREATE TABLE icmp_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    target VARCHAR(255) NOT NULL,
    response_time_ms FLOAT NOT NULL,
    packet_loss FLOAT NOT NULL,
    response_output TEXT NULL
);
CREATE TABLE network_hops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    icmp_request_id INT NOT NULL,
    ip VARCHAR(255) NOT NULL,
    isp VARCHAR(255) NOT NULL,
    latency FLOAT NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    city VARCHAR(255) NULL,
    country VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (icmp_request_id) REFERENCES icmp_requests(id)
);


-- Insert dummy ICMP requests
INSERT INTO icmp_requests (target, request_time) VALUES
('example.com', '2024-04-30 12:00:00'),
('google.com', '2024-04-30 12:15:00'),
('yahoo.com', '2024-04-30 12:30:00');

-- Insert dummy network hops for ICMP request with ID 1
INSERT INTO network_hops (icmp_request_id, ip, latency, latitude, longitude, city, country) VALUES
(1, '192.0.2.1', 10.5, 37.7749, -122.4194, 'San Francisco', 'USA'),
(1, '198.51.100.1', 15.2, 34.0522, -118.2437, 'Los Angeles', 'USA'),
(1, '203.0.113.1', 20.9, 40.7128, -74.0060, 'New York', 'USA');

INSERT INTO network_hops (icmp_request_id, ip, latency, latitude, longitude, city, country) VALUES
(2, '192.0.2.1', 8.3, 37.7749, -122.4194, 'San Francisco', 'USA'),
(2, '198.51.100.1', 12.6, 34.0522, -118.2437, 'Los Angeles', 'USA');

INSERT INTO network_hops (icmp_request_id, ip, latency, latitude, longitude, city, country) VALUES
(3, '192.0.2.1', 11.8, 37.7749, -122.4194, 'San Francisco', 'USA'),
(3, '198.51.100.1', 18.4, 34.0522, -118.2437, 'Los Angeles', 'USA'),
(3, '203.0.113.1', 22.1, 40.7128, -74.0060, 'New York', 'USA');

