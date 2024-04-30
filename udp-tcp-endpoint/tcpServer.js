const net = require("net");

const PORT = 5000;
const ADDRESS = "localhost";

const tcpServer = net.createServer((socket) => {
    console.log("A client just connected.");

    // Handle incoming data from clients
    socket.on("data", (clientData) => {
        console.log(`Received data from client: ${clientData}`);
        try {

            const randomNumber = Math.floor(Math.random() * 100) + 1;
            switch (true) {
              case randomNumber >= 1 && randomNumber <= 15:
                // induce timeout by sleeping for 10seconds
                setTimeout(() => {
                    console.log("sending response: induced timeout")
                    socket.write("induced timeout");
                }, 10000); // 10 seconds in milliseconds
               
                break;

              case randomNumber >= 16 && randomNumber <= 40:
                // induce stringMatch
                console.log("sending response:induced unexpected response");
                socket.write("induced unexpected response");
                break;

              default:
                console.log("sending response:correct response");
                socket.write("correct response");
                break;
            }
            const responseData = {
                message: "Data received successfully",
            };

            socket.write(JSON.stringify(responseData));
           
        } catch (error) {
            console.error("Error parsing JSON:", error.message);
            socket.write(JSON.stringify({ error: "Invalid JSON format" }));
        
        }
       

    });

    // Handle client disconnection
    socket.on("end", () => {
        console.log("Client disconnected.");
    });

    // Handle socket errors
    socket.on("error", (err) => {
        console.error("Socket error:", err.message);
    });
});

// Handle server errors
tcpServer.on("error", (err) => {
    console.error("Server error:", err.message);
});

// Start the server
tcpServer.listen(PORT, ADDRESS, () => {
    console.log(`Server is listening on ${ADDRESS}:${PORT}`);
});
