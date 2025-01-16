
const fs = require('fs');
const https = require('https')
const http = require('http')
const express = require('express');
const app = express();
const socketio = require('socket.io');
app.use(express.static(__dirname))

//we need a key and cert to run https
//we generated them with mkcert
// $ mkcert create-ca
// $ mkcert create-cert
const key = fs.readFileSync('cert.key');
const cert = fs.readFileSync('cert.crt');

//we changed our express setup so we can use https
//pass the key and cert to createServer on https
//const expressServer = https.createServer({key, cert}, app);
const expressServer = http.createServer(app);
//create our socket.io server... it will listen to our express port
const io = socketio(expressServer,{
    cors: {
        origin: [
            "http://localhost:3000",
            "http://localhost",
            "https://localhost",
            'https://192.168.1.111' //if using a phone or another computer
        ],
        methods: ["GET", "POST"]
    }
});
expressServer.listen(8181);

//offers will contain {}
const offers = [
    // offererUserName
    // offer
    // offerIceCandidates
    // answererUserName
    // answer
    // answererIceCandidates
];
const connectedSockets = [
    //username, socketId
]

io.on('connection',(socket)=>{
    console.log("New connection:", { socketId: socket.id, userName: socket.handshake.auth.userName });
    // console.log("Someone has connected");
    // const userName = socket.handshake.auth.userName;
    const userName = `${socket.handshake.auth.userName}-${socket.id}`;
    const password = socket.handshake.auth.password;

    /* if(password !== "x"){
        socket.disconnect(true);
        return;
    } */
    
    connectedSockets.push({
        socketId: socket.id,
        userName
    })
    console.log(connectedSockets);

    // Handle disconnections
    socket.on('disconnect', () => {
        // Find the disconnected user in connectedSockets
        const index = connectedSockets.findIndex(s => s.socketId === socket.id);
        if (index !== -1) {
            const disconnectedUserName = connectedSockets[index].userName;
            console.log(`Socket disconnected: ${socket.id}, userName: ${disconnectedUserName}`);
            connectedSockets.splice(index, 1); // Remove the socket from the array
            console.log("Updated Connected Sockets:", connectedSockets);

            // Remove stale offers associated with the disconnected user
            for (let i = offers.length - 1; i >= 0; i--) {
                if (offers[i].offererUserName === disconnectedUserName) {
                offers.splice(i, 1); // Remove the offer at index i
                }
            }
            console.log("Updated Offers array:", offers);
        }   else {
            console.log(`Socket disconnected: ${socket.id}, userName: Not found`);
        }
        
    });

    //a new client has joined. If there are any offers available,
    //emit them out
    if(offers.length){
        socket.emit('availableOffers',offers);
    }
    
    socket.on("newOffer", (offer) => {
        console.log("New offer received:", offer);
        // Broadcast the offer to the Electron app
        socket.broadcast.emit("newOfferAwaiting", offer);
      });
      
      socket.on("newAnswer", (answer) => {
        console.log("New answer received:", answer);
        // Broadcast the answer to the Vue app
        socket.broadcast.emit("answerResponse", answer);
      });

      socket.on("iceCandidate", (data) => {
        const { candidate, userName, didIOffer } = data;
        const targetSocket = connectedSockets.find(
          (s) => s.userName !== userName // Forward to the other peer
        );
        if (targetSocket) {
          socket.to(targetSocket.socketId).emit("iceCandidate", {
            candidate,
            didIOffer, // Forward the flag
          });
        }
      });

    socket.on('sendIceCandidateToSignalingServer',iceCandidateObj=>{
        const { didIOffer, iceUserName, iceCandidate } = iceCandidateObj;
        // console.log(iceCandidate);
        if(didIOffer){
            //this ice is coming from the offerer. Send to the answerer
            const offerInOffers = offers.find(o=>o.offererUserName === iceUserName);
            if(offerInOffers){
                offerInOffers.offerIceCandidates.push(iceCandidate)
                // 1. When the answerer answers, all existing ice candidates are sent
                // 2. Any candidates that come in after the offer has been answered, will be passed through
                if(offerInOffers.answererUserName){
                    //pass it through to the other socket
                    const socketToSendTo = connectedSockets.find(s=>s.userName === offerInOffers.answererUserName);
                    if(socketToSendTo){
                        socket.to(socketToSendTo.socketId).emit('receivedIceCandidateFromServer',iceCandidate)
                    }else{
                        console.log("Ice candidate recieved but could not find answere")
                    }
                }
            }
        }else{
            //this ice is coming from the answerer. Send to the offerer
            //pass it through to the other socket
            const offerInOffers = offers.find(o=>o.answererUserName === iceUserName);
            const socketToSendTo = connectedSockets.find(s=>s.userName === offerInOffers.offererUserName);
            if(socketToSendTo){
                socket.to(socketToSendTo.socketId).emit('receivedIceCandidateFromServer',iceCandidate)
            }else{
                console.log("Ice candidate recieved but could not find offerer")
            }
        }
        // console.log(offers)
    })

})