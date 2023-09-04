import { plainToInstance } from 'class-transformer';
import * as http from 'http';
import WebSocket from 'ws';

import { WSMessage, WSPayload } from './message';
import { removeUserFromRoom } from '../room/room.service';

declare interface Socket extends WebSocket {
    isAlive: boolean;
    userId: string;
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
        this.wss.on("connection", (ws: Socket) => {

            ws.isAlive = true;

            ws.on('pong', () => {
                ws.isAlive = true;
            });

            ws.on("message", (message: string) => {
                this.processMessage(message, ws);
            });
            console.log(`Received a new connection: ${ws}`);
        });
        this.pingForHeartbeat();
    };

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
        
        console.log(`received message: ${JSON.stringify(message)}`);
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
            case "InitGame":
                this.prepareForGame(message.payload);
                break;
            case "info":
                this.sendRoomInfo(ws as Socket, message.payload.roomId);
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
        const roomId = payload.roomId;
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
            })
            const leaveRoomMessage = new WSMessage("Leave", new WSPayload({
                userId: payload.userId,
                roomId: roomId,
                userIds: users
            }));
            this.broadcastAll(roomId, JSON.stringify(leaveRoomMessage));
        }
    }

    private prepareForGame = (payload: WSPayload) => {
        console.log("Prepare!!!!")
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

    private cleanupSocket = (ws: Socket) => {
        //if user is admin, might be delay cleanup and make someone else admin?
        (async () => {
            const room = await removeUserFromRoom(ws.userId);
            if (room) {
                this.leaveRoom(new WSPayload({
                    roomId: room._id,
                    userId: ws.userId,
                }), ws);
            }
            ws.terminate();
        });
    };

    private broadcast = (roomId: string, ws:Socket, message: string) => {
        const sockets = this.rooms.get(roomId);
        sockets?.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(message));
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