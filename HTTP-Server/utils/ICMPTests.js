const ping = require('ping'); // Import the 'ping' library for ICMP testing
const traceroute = require('traceroute');
const geoip = require('fast-geoip');

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
  
      console.log('Traceroute result:');
      let packetHops = [];
      for (const hop of hops) {
          if (typeof hop === 'object') {
              // Handle JSON objects with IP addresses and latencies
              const ip = Object.keys(hop)[0];
              const latency = hop[ip];
              // Assuming you have the geoip module imported and configured
              const geoInfo = await geoip.lookup(ip);
              const hopInfo = {
                  ip: ip,
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
      return packetHops;
  }

module.exports = {
    performICMPTests,
    performICMPIntervalTests,
    performNetworkPath
}