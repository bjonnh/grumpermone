import express from "express";
import path from "path";
import {textToAudioBuffer} from "./speech";
import {Server} from "socket.io";
import {Client} from "matrix-org-irc";
import * as http from "http";

export class App {
    public static readonly PORT: number = parseInt(process.env.PORT, 10) || 8080;
    private app: express.Application;
    private server: http.Server;
    private io: Server;
    public socketClient: any;
    public baseLang: string;
    private clients: any[] = [];
    private bot: any;

    constructor() {
        this.createApp();
        this.createServer();
        this.sockets();
        this.listen();

        this.baseLang = process.env.LANGUAGE_CODE;
    }

    private createApp(): void {
        this.app = express();
        this.bot = new Client("irc.libera.chat", "grumpermone", {
            channels: ["#pumpingstationone"],
            port: 6697,
            sasl: true,
            secure: true,
            debug:true,
            onNickConflict() {
                return "grumpermone_";
            }
        });

        this.bot.addListener('error', (message: any) => {
            // tslint:disable-next-line:no-console
            console.error('ERROR: %s: %s', message.command, message.args.join(' '));
        });

        this.bot.addListener('message#blah', (from: string, message: any) => {
            // tslint:disable-next-line:no-console
            console.log('<%s> %s', from, message);
        });

        this.bot.addListener('message', (from: string, to: string, message: any) => {
            // tslint:disable-next-line:no-console
            if (from === "grumpermon") this.sayToClients(message)

            // tslint:disable-next-line:no-console
            console.log('%s => %s: %s', from, to, message);
        });

        // this.app.use(cors.default());
        this.app.use((req, res, next) => {
            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', '*');

            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

            // Request headers you wish to allow
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            res.setHeader('Access-Control-Allow-Credentials', "true");

            // Pass to next layer of middleware
            next();
        });

        // this.app.set('trust proxy', true);

        this.app.use((req: any, res: any, next: any) => {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

            if (req.secure) {
                // request was via https, so do no special handling
                next();
            } else {
                if (req.headers.host !== 'localhost:' + App.PORT && req.headers.host !== process.env.EXTERNAL_IP) {
                    // request was via http, so redirect to https
                    // res.redirect('https://' + req.headers.host + req.url)
                    // or not
                    next();
                } else {
                    next();
                }
            }

            // tslint:disable-next-line:no-console
            console.log()
        });
        // this.app.use('/', express.static(path.join(__dirname, '../dist/public')));

        this.app.set("views", path.join(__dirname, "views"));
        this.app.set("view engine", "ejs");

        this.app.use(express.static('public'))

        // define a route handler for the default home page
        this.app.get("/", (req, res) => {
            // render the index template
            res.render("index");
        });

    }

    private createServer(): void {
        this.server = http.createServer(this.app);
    }

    private sockets(): void {
        this.io = new Server(this.server);
    }



    private listen(): void {
        this.server.listen(App.PORT, () => {
            console.log('Running server on port: %s', App.PORT);
        });

        this.io.on('connect', (client: any) => {
            this.socketClient = client;
            this.clients.push(client);
            // tslint:disable-next-line:no-console
            console.log(`Client connected [id=${client.id}]`);
            client.emit('server_setup', `Server connected [id=${client.id}]`);

            client.on('say', async (data: any) => {
                await this.bot.say("#pumpingstationone", "grumpermon: " + data.text);
            });
        });
    }

    private sayToClients(text: string): void {
        // tslint:disable-next-line:no-console
        console.log(`Trying to say ` + text);
        // TTS the answer
        textToAudioBuffer(text).then((audio) => {
            this.clients.forEach((client: any)=> client.emit('audio', audio))

        }).catch((e: any) => {
            // tslint:disable-next-line:no-console
            console.log(e);
        })
    }
}

export const app = new App();
