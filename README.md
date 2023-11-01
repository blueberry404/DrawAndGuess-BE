# DrawAndGuess-BE
Simple Monolithic Backend for Draw and Guess [Game](https://github.com/blueberry404/DrawAndGuess-Compose) using Node.js, Typescript, Mongo DB, Express and Web Sockets. It also supports multiplayer.

## How to Run?
In order to run directly on your system, you must have installed NPM, Node.js and MongoDB on your system.

Since it uses `Bcrypt`, you are required to install:
- `node-gyp` and `python` on Linux based systems.
- Additionally C# and C++ would be needed for Windows Users. 

Can further check out instructions on Bcrypt's [Github page](https://github.com/kelektiv/node.bcrypt.js#dependencies).


From the terminal in the root of the project, run the following command:
```sh
npm run dev
```

### Using Docker
Above sounds too much? 👀

✨Docker Compose✨ to the rescue!


Run following from the root of the project, and you should be good!
```sh
docker-compose up --build
```

## About

- There is no authentication in the app. When user opens the app for the first time, a guest user is created in the DB.

- Main routes of the app are as follows:

  - [Users](https://github.com/blueberry404/DrawAndGuess-BE/blob/main/src/users/users.route.ts)
  - [Room](https://github.com/blueberry404/DrawAndGuess-BE/blob/main/src/room/room.route.ts)

- Words are seeded into DB when server is started.
- Web Sockets have been used for communication between different users. 
- The user who creates the room is Admin as well as master, that broadcasts to other users about timely events such as timer start, next turn, navigation etc.

You can check sockets event management [here](https://github.com/blueberry404/DrawAndGuess-BE/blob/main/src/socket/index.ts).

### Information ℹ️

These APIs have been created for the Kotlin Compose Multiplatform Mobile game which you can check [here](https://github.com/blueberry404/DrawAndGuess-Compose).

