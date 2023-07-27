import { plainToInstance } from 'class-transformer';
import * as http from 'http';
import WebSocket from 'ws';

import { WSClientMessage, WSClientPayload, WSMessage, WSPayload } from './message';

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
                if (!client.isAlive) return ws.terminate();

                client.isAlive = false;
                client.ping(null, false);
            });
        }, 30000);
    };

    private processMessage = (msgStr: string, ws: WebSocket) => {
        const jsonObject = JSON.parse(msgStr);
        const message = plainToInstance(WSMessage, jsonObject);
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
            default:
                break;
        }
    };

    private createRoom =  (payload: WSPayload, ws: Socket) => {
        ws.userId = payload.userId;
        this.rooms.set(payload.roomId, [ws]);
    }

    private joinRoom = (payload: WSPayload, ws: Socket) => {
        const roomId = payload.roomId;
        if (this.rooms.has(roomId)) {
            const sockets = this.rooms.get(roomId);
            //same user should not be saved again
            const socket = sockets?.find(so => so.userId == ws.userId)
            if (!socket) {
                this.rooms.get(roomId)?.push(ws);
            }
        }
        else {
            const message = new WSClientMessage("error", new WSClientPayload("Room doesn't exist"));
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
        }
    }

    close = () => {
        clearInterval(this.timer);
        this.wss.close();
    };
}