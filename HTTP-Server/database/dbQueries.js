var mysql2 = require('mysql2');
require('dotenv').config();
const pool = mysql2.createPool({
    host: '127.0.0.1',
    user: process.env.SQL_USR,
    password: process.env.SQL_PASS,
    database: 'splitpoint_project',
    
}).promise();


async function insertICMPRequest(target,response_time_ms,packet_loss,response_output){
    try {

      const results = await pool.query(
        "INSERT INTO icmp_requests (target, response_time_ms, packet_loss, response_output) VALUES (?, ?, ?, ?)",
        [target, response_time_ms, packet_loss, response_output]
      );
      
      const icmpRequestId = results[0].insertId;
      console.log("Inserted ICMP request ID:", icmpRequestId);
      return icmpRequestId;
        
    } catch (error) {
        console.error("Error Inserting ICMPQuery:", error);
        throw error; // Re-throw the error to propagate it
        
    }
    
}

async function insertICMPRequestHops(icmpRequestId, hops) {
    try {
        let query = `INSERT INTO network_hops (icmp_request_id, ip, isp, latency, latitude, longitude, city, country) VALUES ?`;
        const values = hops.map(hop => [
            icmpRequestId,
            hop.ip,
            hop.isp,
            hop.latency,
            hop.lat,
            hop.long,
            hop.city || null,
            hop.country || null
        ]);
        const results = await pool.query(query, [values]);
        return true;
    } catch (error) {
        console.error('Error inserting hops:', error);
        throw error;
    }
}


async function getLastPacketTraces(){
    try {
        let queryString = `
        SELECT network_hops.*
        FROM network_hops
        JOIN (
            SELECT id
            FROM icmp_requests
            ORDER BY id DESC
            LIMIT 10
        ) AS last_icmp_request
        ON network_hops.icmp_request_id = last_icmp_request.id
        ORDER BY network_hops.created_at;
        `;
        const results = await pool.query(queryString);
        const rows = results[0];
        return rows;
        
    } catch (error) {
        throw error;
    }
}

module.exports = {
    insertICMPRequest,
    insertICMPRequestHops,
    getLastPacketTraces
}