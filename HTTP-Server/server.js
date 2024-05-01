const express = require('express');
const {queryGPT } = require('./utils/OpenAi');
const {performICMPTests ,performICMPIntervalTests, performNetworkPath, addICMPRequestAndHops } = require('./utils/ICMPTests');
const {insertICMPRequest,insertICMPRequestHops,getLastPacketTraces} = require('./database/dbQueries')

const app = express();
const port = 3001;


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
        const icmpRequestId = await insertICMPRequest(packetTrace.host,packetTrace.response_time_ms,packetTrace.packet_loss,packetTrace.response_output);
        await insertICMPRequestHops(icmpRequestId,packetTrace.hops);
        console.log(`sending packet trace: ${packetTrace.hops.length} hops`);
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

app.get('/gptPacketTraceSummarise', async (req, res) => {
  try {
      // Call the /monitoring/icmptests endpoint internally

      //const icmpResponse = await fetch('http://localhost:3001/monitoring/icmptests');
      //const icmpData = await icmpResponse.json();
      const networkHops = await getLastPacketTraces();
      // console.log(networkHops);

      // const targetEndpoint = ""
      // const results = await performNetworkPath(targetEndpoint);
      const systemContext = `As a packet tracing analyst, you're poised to produce detailed and extensive reports based on your thorough analysis of the icmp_requests 
      and network_hops data. These reports can delve deep into the intricacies of network pathways, offering comprehensive insights into connectivity, latency, and performance.

      Harnessing HTML tables and paragraphs, you can create expansive documents that meticulously map out the journey of data packets, identifying patterns, anomalies,
      and optimization opportunities across various network nodes.
      Your commitment to producing comprehensive reports not only showcases your expertise but also provides invaluable resources for stakeholders to understand network health and make informed decisions.
      So, dive into the data, explore its depths, and craft reports that are as exhaustive as they are enlightening.`;
      

      const userContext = `Below is a list of ICMP ping network packet hops. Please ensure your response is in HTML format. You are encouraged to use multiple paragraphs.

      Please analyze the results and generate a detailed report written in HTML:
      
      ${JSON.stringify(networkHops)}`;
      

      const gptResponse = await queryGPT(systemContext,userContext);

      // console.log('printing gpt Response');
      // console.log(gptResponse);

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
