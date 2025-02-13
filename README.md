### Main obejctove of this project is to calculate the difference between transmission time of HTTP 1, HTTP 2 and a Bittorrent protocol.

1. Installation

- Ensure you have installed node version v20.10.0 and npm version 10.2.3 on your local machine.
- Clone the repository using <br>
  `git clone https://github.com/CSC-573-Internet-Protocol/Project1`
- Go inside project 1 using <br>
  `cd Project1`
- Install necessary packages using <br>
  `npm install`

2. Running the project

- Run http1 server using <br> `npm run http1`
- Run http1 client using <br> `node client`
- Run http2 server using <br> `npm run http2`
- Run http2 client using <br> `node client2`

### File description

| File       | Purpose         |
| ---------- | --------------- |
| client.js  | HTTP 1.1 client |
| client2.js | HTTP 2 client   |
| server.js  | HTTP 1 server   |
| server2.js | HTTP 2 server   |
