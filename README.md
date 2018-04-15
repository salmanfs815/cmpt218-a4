# 3D Tic Tac Toe Game
### Assignment 4 (CMPT 218)

Online multiplayer 3D Tic Tac Toe. User login, registration and realtime gameplay.


## Instructions

### Installation
```bash
git clone https://github.com/salmanfs815/cmpt218-a4.git
cd cmpt218-a4
npm install
```

### Configure Environment
Create a file called `.env` in the root project folder (same directory as `server.js`).  
The file must contain 2 environment variables: `PORT` and `DB_URL`.  
It must be in the following format:  
```
PORT=<port_number>
DB_URL=mongodb://<db_user>:<db_pass>@<db_url>:<db_port>/<db_name>
```

### Run Server
```bash
npm start
```
