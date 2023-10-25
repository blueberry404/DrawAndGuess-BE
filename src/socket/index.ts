import { plainToInstance } from 'class-transformer';
import * as http from 'http';
import WebSocket from 'ws';

import { WSMessage, WSPayload } from './message';
import { removeRoom, removeUserFromRoom, updateRoomForStart } from '../room/room.service';

declare interface Socket extends WebSocket {
    isAlive: boolean;
    userId: string;
}

declare interface SocketHeader extends http.IncomingMessage {
    room_id: string;
    user_id: string;
}

export class SocketServer {

    private wss: WebSocket.Server<typeof WebSocket, typeof http.IncomingMessage>
    private timer?: NodeJS.Timer
    private rooms: Map<string, Socket[]> = new Map();

    constructor(server: http.Server) {
        this.wss = new WebSocket.Server({ server });
        this.initSockets();
    }

    private initSockets = () => {
        this.wss.on("connection", (ws: Socket, request: http.IncomingMessage) => {

            const headers = request.headers as unknown as SocketHeader
            const userId = headers.user_id
            const roomId = headers.room_id

            this.replaceExistingStaleConnection(ws, roomId, userId);

            ws.isAlive = true;

            ws.on('pong', () => {
                ws.isAlive = true;
            });

            ws.on("message", (message: string) => {
                this.processMessage(message, ws);
            });
        
            console.log(`Received a new connection :: ${JSON.stringify(headers)}`);
        });
        this.pingForHeartbeat();
    };

    private replaceExistingStaleConnection = (ws: Socket, roomId: string, userId: string) => {
        console.log(`room: ${roomId}, user: ${userId}`);
        if (this.rooms.has(roomId)) {
            const sockets = this.rooms.get(roomId);
            if (sockets != null) {
                const index = sockets.findIndex(so => so.userId == ws.userId);
                if (index != undefined && index > -1) {
                    console.log(`Socket:: Room ${roomId} with old socket ${userId} found`);
                    sockets[index] = ws
                }
            }
        }
    }

    private pingForHeartbeat = () => {
        this.timer = setInterval(() => {
            this.wss.clients.forEach((ws: WebSocket) => {

                const client = ws as Socket
                if (!client.isAlive) {
                    this.cleanupSocket(client);
                    return;
                }

                client.isAlive = false;
                client.ping(null, false);
            });
        }, 30000);
    };

    private processMessage = (msgStr: string, ws: WebSocket) => {
        const jsonObject = JSON.parse(msgStr);
        const message: WSMessage = plainToInstance(WSMessage, jsonObject as WSMessage);
        
        switch (message.type) {
            case "create":
                this.createRoom(message.payload, ws as Socket);
                break;
            case "join":
                this.joinRoom(message.payload, ws as Socket);
                break;
            case "leave":
                this.leaveRoom(message.payload, ws);
                break;
            case "PrepareGame":
                this.prepareForGame(message.payload);
                break;
            case "info":
                this.sendRoomInfo(ws as Socket, message.payload.roomId);
                break;
            case "StartGame":
                this.startGame(message.payload);
                break;
            case "Sync": {
                const converted = JSON.stringify(message);
                this.broadcast(message.payload.roomId, ws as Socket, converted);
                break;
            }
            case "CorrectGuess":
                this.turnOver(message.payload, true);
                break;
            case "WrongGuess":
                break;
            case "EndTurn":
                this.turnOver(message.payload, false);
                break;
            case "NextTurn":
            case "NextRound": {
                const payload = message.payload;
                const newMessage = new WSMessage(message.type, new WSPayload({
                    userId: payload.userId,
                    roomId: payload.roomId,
                }));
                this.broadcastAll(message.payload.roomId, JSON.stringify(newMessage));
                break;
            }
            case "EndGame": {
                this.cleanupGame(message.payload);
                break;
            }
            default:
                break;
        }
    };

    private createRoom =  (payload: WSPayload, ws: Socket) => {
        ws.userId = payload.userId;
        const roomId = payload.roomId;
        this.rooms.set(roomId, [ws]);
    }

    private joinRoom = (payload: WSPayload, ws: Socket) => {
        ws.userId = payload.userId;
        const roomId = payload.roomId;

        if (this.rooms.has(roomId)) {
            console.log("Socket:: Room found");
            const sockets = this.rooms.get(roomId);
            //same user should not be saved again
            const socket = sockets?.find(so => so.userId == ws.userId)
            if (!socket) {
                console.log("Socket:: User not joined");
                this.rooms.get(roomId)?.push(ws);
            }
            const users: string[] = []             
            sockets?.forEach(function each(client) {
                const s: Socket = client as Socket
                users.push(s.userId);
            })
            console.log(`Sockets:: ${users}`)
            const joinRoomMessage = new WSMessage("Join", new WSPayload({
                userId: payload.userId,
                roomId: roomId,
                userIds: users
            }));
            this.broadcastAll(roomId, JSON.stringify(joinRoomMessage));
        }
        else {
            console.log("Sockets:: Room Id not found")
            const message = new WSMessage("error", new WSPayload({
                error: "Room doesn't exist",
                roomId: roomId,
            }));
            ws.send(JSON.stringify(message));
            ws.terminate();
        }
    }

    private leaveRoom = (payload: WSPayload, ws: WebSocket) => {

        (async () => {
            
            const roomId = payload.roomId;
            console.log(`Cleaning up for user: ${payload.userId}`);
            await removeUserFromRoom(payload.userId);
            const filtered = this.rooms.get(roomId)?.filter(so => so !== ws);
            if (filtered) {
                if (filtered.length > 0) {
                    this.rooms.set(roomId, filtered);
                }
                else {
                    this.rooms.delete(roomId);
                }
                const users: string[] = []
                const sockets = this.rooms.get(roomId);
                sockets?.forEach(function each(client) {
                    const s: Socket = client as Socket
                    users.push(s.userId);
                });
                const leaveRoomMessage = new WSMessage("Leave", new WSPayload({
                    userId: payload.userId,
                    roomId: roomId,
                    userIds: users
                }));
                this.broadcastAll(roomId, JSON.stringify(leaveRoomMessage));
            }
            ws.terminate();
        })();
    }

    private prepareForGame = (payload: WSPayload) => {
        console.log("Prepare!!!!");
        (async () => {
            await updateRoomForStart(payload.roomId);
            const sockets = this.rooms.get(payload.roomId);
            const users: string[] = []
            sockets?.forEach(function each(client) {
                const s: Socket = client as Socket
                users.push(s.userId);
            });
            const prepareGameMessage = new WSMessage("PrepareForGame", new WSPayload({
                userId: payload.userId,
                roomId: payload.roomId,
                userIds: users
            }));
            this.broadcastAll(payload.roomId, JSON.stringify(prepareGameMessage));
        })();
    };

    private sendRoomInfo = (ws: Socket, roomId: string) => {
        const sockets = this.rooms.get(roomId);
        const users: string[] = []             
        sockets?.forEach(function each(client) {
            const s: Socket = client as Socket
            users.push(s.userId);
        })
        const message = new WSMessage("Info", new WSPayload({
            userId: ws.userId,
            roomId: roomId,
            userIds: users,
        }))
        ws.send(JSON.stringify(message));
    };

    private startGame = (payload: WSPayload) => {
        const sockets = this.rooms.get(payload.roomId);
        const users: string[] = []
        sockets?.forEach(function each(client) {
            const s: Socket = client as Socket
            users.push(s.userId);
        });
        const startGameMessage = new WSMessage("StartGame", new WSPayload({
            userId: payload.userId,
            roomId: payload.roomId,
            userIds: users
        }));
        this.broadcastAll(payload.roomId, JSON.stringify(startGameMessage));
    };

    private turnOver = (payload: WSPayload, hasWon: boolean) => {
        const newPayload = new WSPayload({
            userId: payload.userId,
            roomId: payload.roomId,
            wonRound: hasWon ?? undefined
        })
        console.log(`Round over: ${JSON.stringify(newPayload)}`);
        const message = new WSMessage("TurnOver", newPayload);
        this.broadcastAll(payload.roomId, JSON.stringify(message));
    };

    private cleanupGame = (payload: WSPayload) => {
        console.log(`Cleaning the room: ${payload.roomId}`);
        (async () => {
            await removeRoom(payload.roomId);
            if (this.rooms.has(payload.roomId)) {
                const sockets = this.rooms.get(payload.roomId);
                sockets?.forEach(function each(client) {
                    client.terminate();
                });
                this.rooms.delete(payload.roomId);
            }
        });
    };

    private cleanupSocket = (ws: Socket) => {
        //if user is admin, might be delay cleanup and make someone else admin?
        (async () => {
            console.log(`Cleaning up for user: ${ws.userId}`);
            const room = await removeUserFromRoom(ws.userId);
            if (room) {
                this.leaveRoom(new WSPayload({
                    roomId: room._id,
                    userId: ws.userId,
                }), ws);
            }
            ws.terminate();
        })();
    };

    private broadcast = (roomId: string, ws:Socket, message: string) => {
        const sockets = this.rooms.get(roomId);
        sockets?.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(message);
            }
          });
    };

    private broadcastAll = (roomId: string, message: string) => {
        const sockets = this.rooms.get(roomId);
        sockets?.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(message);
            }
          });
    };


    close = () => {
        clearInterval(this.timer);
        this.wss.close();
    };
}