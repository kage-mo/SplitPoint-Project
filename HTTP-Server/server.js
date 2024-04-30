const express = require('express');
const {queryGPT } = require('./utils/OpenAi');
const {performICMPTests ,performICMPIntervalTests, performNetworkPath } = require('./utils/ICMPTests');

const app = express();
const port = 3001;

// Define a function to perform ICMP tests
// async function performICMPTests() {
//   const targets = ['example.org']; // List of endpoints to test
//   const icmpResults = [];
  
//   for (const target of targets) {
//     try {
//       const res = await ping.promise.probe(target);
//       const icmpObject = {
//         //target: target,
//         //alive: res.alive,
//         test_value2: 0.5,
//         responseTime: res.alive ? res.time : null,
//         //packetLoss: res.packetLoss,
//         reachability: 100 - (parseFloat(res.packetLoss) || 0),

//       };
//       console.log(typeof icmpObject.reachability)
//       //console.log(icmpObject);
//       icmpResults.push({
//         target: target,
//         //alive: res.alive,
//         ping_responseTime: parseFloat(res.time),
//         packetLoss: parseFloat(res.packetLoss),
//         reachability: 100 - (parseFloat(res.packetLoss) || 0),

//       });
//     } catch (error) {
//       console.error(`Error testing ICMP for ${target}:`, error);
//       icmpResults.push({
//         target: target,
//         error: error.message
//       });
//     }
//   }
  
//   return icmpResults;
// }

// async function performICMPIntervalTests(iterations) {
//   const results = [];
//   for (let i = 0; i < iterations; i++) {
//       try {
//           // Call the endpoint
//           const response = await fetch('http://localhost:3001/monitoring/icmptests');
//           const data = await response.json();
//           results.push(data);
//       } catch (error) {
//           console.error('Error performing ICMP test:', error);
//           results.push({ error: 'Internal server error' });
//       }
//       // Wait for 4 seconds before next call
//       await new Promise(resolve => setTimeout(resolve, 4000));
//   }
//   return results;
// }

// // Function to perform ping and traceroute
// async function performNetworkPath(target) {
//     console.log(`Pinging ${target}...`);
//     const pingResult = await ping.promise.probe(target, { timeout: 10 });
//     //console.log('Ping result:', pingResult);

//     console.log(`Tracerouting to ${target}...`);
//     const hops = await new Promise((resolve, reject) => {
//         traceroute.trace(target, (err, hops) => {
//             if (err) {
//                 console.error('Traceroute error:', err);
//                 reject(err);
//                 return;
//             }
//             resolve(hops);
//         });
//     });

//     console.log('Traceroute result:');
//     let packetHops = [];
//     for (const hop of hops) {
//         if (typeof hop === 'object') {
//             // Handle JSON objects with IP addresses and latencies
//             const ip = Object.keys(hop)[0];
//             const latency = hop[ip];
//             // Assuming you have the geoip module imported and configured
//             const geoInfo = await geoip.lookup(ip);
//             const hopInfo = {
//                 ip: ip,
//                 latency: parseFloat(latency),
//                 lat:  parseFloat(geoInfo.ll[0]),
//                 long: parseFloat(geoInfo.ll[1]),
//                 city: geoInfo.city,
//                 country: geoInfo.country,
//             };
//             packetHops.push(hopInfo);
//             //console.log('pushing object to list: ', hopInfo);
//         }
//     }
//     return packetHops;
// }

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.get('/monitoring/icmptests/packetTrace', async(req,res) =>{
    try {
        const packetTrace = await performNetworkPath('example.org');
        console.log(`sending packet trace: ${packetTrace.length} hops`);
        //console.log(packetTrace);
        res.json(packetTrace);
    } catch (error) {
        console.error('Error performing ICMP tests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});
// Define the /monitoring/icmptests endpoint
app.get('/monitoring/icmptests', async (req, res) => {
  try {
    const icmpResults = await performICMPTests();
    res.json(icmpResults);
  } catch (error) {
    console.error('Error performing ICMP tests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/gptSummarise', async (req, res) => {
  try {
      // Call the /monitoring/icmptests endpoint internally

      //const icmpResponse = await fetch('http://localhost:3001/monitoring/icmptests');
      //const icmpData = await icmpResponse.json();
      
      const results = await performICMPIntervalTests(5);
      const systemContext = `As an expert in network monitoring, you excel in conducting ICMP ping tests to assess the connectivity and response times of target hosts.
       Following rigorous testing, you meticulously scrutinize the gathered data, pinpointing any anomalies or performance bottlenecks with precision.

      Your expertise lies in interpreting these results, uncovering the underlying causes of network disruptions or latency issues. 
      Leveraging your insights, you compile a comprehensive report that delves into the performance metrics of each tested host.
      This report serves as a valuable resource, not only shedding light on the network's overall health but also offering 
      actionable recommendations for enhancing performance and resolving identified issues. 
      
      To ensure clarity and accessibility, your report is presented in HTML format, enveloped within <div> tags for effortless readability and seamless distribution.
      Furthermore, adhering to standardized practices, you consistently utilize HTML tables to organize data and employ <h2> tags to label distinct sections, fostering a structured and navigable report layout.
      `;
      

      const userContext = `Below is the list of ICMP ping tests. Please analyze the results and generate a detailed report: ${JSON.stringify(results)}`;
      const gptResponse = await queryGPT(systemContext,userContext);

      console.log('printing gpt Response');
      console.log(gptResponse);

      // Return a response including data from both endpoints
      res.send(`
          ${gptResponse}
      `);
  } catch (error) {
      console.error('Error in /gptSummarise:', error);
      res.status(500).send(`Error in /gptSummarise: ${error}`);
  }
});



// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
