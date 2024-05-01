const ping = require('ping'); // Import the 'ping' library for ICMP testing
const traceroute = require('traceroute');
const geoip = require('fast-geoip');
const axios = require('axios');




// Define a function to perform ICMP tests
async function performICMPTests() {
    const targets = ['example.org']; // List of endpoints to test
    const icmpResults = [];
    
    for (const target of targets) {
      try {
        const res = await ping.promise.probe(target);
        const icmpObject = {
          //target: target,
          //alive: res.alive,
          test_value2: 0.5,
          responseTime: res.alive ? res.time : null,
          //packetLoss: res.packetLoss,
          reachability: 100 - (parseFloat(res.packetLoss) || 0),
  
        };
        console.log(typeof icmpObject.reachability)
        //console.log(icmpObject);
        icmpResults.push({
          target: target,
          //alive: res.alive,
          ping_responseTime: parseFloat(res.time),
          packetLoss: parseFloat(res.packetLoss),
          reachability: 100 - (parseFloat(res.packetLoss) || 0),
  
        });
      } catch (error) {
        console.error(`Error testing ICMP for ${target}:`, error);
        icmpResults.push({
          target: target,
          error: error.message
        });
      }
    }
    
    return icmpResults;
  }
  
  async function performICMPIntervalTests(iterations) {
    const results = [];
    for (let i = 0; i < iterations; i++) {
        try {
            // Call the endpoint
            const response = await fetch('http://localhost:3001/monitoring/icmptests');
            const data = await response.json();
            results.push(data);
        } catch (error) {
            console.error('Error performing ICMP test:', error);
            results.push({ error: 'Internal server error' });
        }
        // Wait for 4 seconds before next call
        await new Promise(resolve => setTimeout(resolve, 4000));
    }
    return results;
  }
  
  // Function to perform ping and traceroute
  async function performNetworkPath(target) {
      console.log(`Pinging ${target}...`);
      const pingResult = await ping.promise.probe(target, { timeout: 10 });
      //console.log('Ping result:', pingResult);
      console.log(`Tracerouting to ${target}...`);
      const hops = await new Promise((resolve, reject) => {
          traceroute.trace(target, (err, hops) => {
              if (err) {
                  console.error('Traceroute error:', err);
                  reject(err);
                  return;
              }
              resolve(hops);
          });
      });
  
      
      let packetHops = [];
      for (const hop of hops) {
          if (typeof hop === 'object') {
              
              // Handle JSON objects with IP addresses and latencies
              const ip = Object.keys(hop)[0];
              const latency = hop[ip];
              // Assuming you have the geoip module imported and configured
              const geoInfo = await geoip.lookup(ip);
              const apiUrl = `https://api.iplocation.net/?ip=${ip}`;
              const response = await axios.get(apiUrl);
              const isp = response.data.isp;
              console.log(response.data);
              console.log(isp);
             //console.log('The hop geo : ',geoInfo);
              
              const hopInfo = {
                  ip: ip,
                  isp: isp,
                  latency: parseFloat(latency),
                  lat:  parseFloat(geoInfo.ll[0]),
                  long: parseFloat(geoInfo.ll[1]),
                  city: geoInfo.city,
                  country: geoInfo.country,

              };
             
              packetHops.push(hopInfo);

              //console.log('pushing object to list: ', hopInfo);
          }
      }
      
      return {
        host: pingResult.inputHost,
        response_time_ms: pingResult.time,
        response_output: pingResult.output,
        packet_loss:pingResult.packetLoss,
        hops: packetHops,
      };
  }

  async function addICMPRequestAndHops(target) {
    try {
        // Perform network path to get hop data
        const packetHops = await performNetworkPath(target);

        // Insert ICMP request
        const icmpRequestId = await insertICMPRequest(target);

        // Insert hops associated with the ICMP request
        const insertPromises = packetHops.map(hop => insertHop(icmpRequestId, hop));

        // Wait for all insertions to complete
        await Promise.all(insertPromises);

        console.log("Data added successfully.");
    } catch (error) {
        console.error("Error adding data:", error);
        throw error;
    }
}

module.exports = {
    performICMPTests,
    performICMPIntervalTests,
    performNetworkPath,
    addICMPRequestAndHops
}