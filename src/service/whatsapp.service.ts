import { Client, LocalAuth, Message, MessageMedia, MessageSendOptions } from "whatsapp-web.js";
import { image as imageQr } from "qr-image";
import fs from "fs/promises"
import { MessageModel } from "../model/message.model";
import { surveyMiddleware } from "../api/survey";
import { SurveyModel } from "../core/interface/survey";

/**
 * Extendemos los super poderes de whatsapp-web
 */
class WhatsappService extends Client {

    // ** Singleton
    private static instance?: WhatsappService;
    public static getInstance(): WhatsappService {
        if (!this.instance) this.instance = new WhatsappService();
        return this.instance;
    }
    private status = false;

    constructor() {
        super({
            authStrategy: new LocalAuth(),
            restartOnAuthFail: true,
            puppeteer: {
                headless: true,
                args: ['--no-sandbox'],
                //, '--disable-setuid-sandbox', '--unhandled-rejections=strict'
                //executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            },
            webVersionCache: {
                type: 'remote',
                remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
            },
        });
        console.log("Iniciando....");

        this.initialize();

        this.on("ready", () => {
            this.status = true;
            console.log("LOGIN_SUCCESS");
        });

        this.on("auth_failure", () => {
            this.status = false;
            console.log("LOGIN_FAIL");
        });

        this.on("qr", (qr) => {
            console.log("Escanea el codigo QR que esta en la carepta tmp");
            this.generateImage(qr);
        });

        this.on('message', async (msg: Message) => {
            // Verificar si el mensaje recibido es de un chat individual y no un mensaje del sistema
            if (msg.fromMe || msg.from.includes('g.us')) {
                // Si el mensaje es propio o de un grupo, ignorarlo
                return;
            }
            console.log(msg)
            const phone = msg.from.replace(/^\d{2}|\D+/g, '');
            console.log(phone)

            const survey: SurveyModel = {
                campusId: 1,
                clientId: 2,
                userTechnicalId: 0,
                rating: Number(msg.body)
            }
            await surveyMiddleware.apiCreateSurvey(survey)
        });
    }
 

    async getClientSession(): Promise<any> {
        try {
            if (!this.status) return Promise.resolve({ error: "SIN INICIO DE SESION" });

            const response = this.info;
            return response;
        } catch (e: any) {
            console.log(e.message)
            return Promise.resolve({ error: e.message });
        }
    }

    async closeSession() {
        try {

            this.logout()
                .then(() => {
                    console.log("Sesión cerrada correctamente.");
                    this.status = false
                })
                .catch((error) => {
                    console.error("Error al cerrar sesión:", error);
                });

            return true;
        } catch (error) {
            console.error('Error al cerrar la conexión:', error);
            return false;
        }
    }

    async initializeServer() {
        console.log("Iniciando....");

        this.initialize();

        this.on("ready", () => {
            this.status = true;
            console.log("REINICIO::::: LOGIN_SUCCESS");
        });

        this.on("auth_failure", () => {
            this.status = false;
            console.log("REINICIO::::: LOGIN_FAIL");
        });

        this.on("qr", (qr) => {
            console.log("REINICIO::::: Escanea el codigo QR que esta en la carepta tmp");
            this.generateImage(qr);
        });

        return this.status;
    }

    async sendMsgText(message: MessageModel): Promise<any> {
        try {
            if (!this.status) return Promise.resolve({ error: "SIN INICIO DE SESION" });

            const response = await this.sendMessage(`${message.phone}@c.us`, message.message);
            return response.id;
        } catch (e: any) {
            console.log(e.message)
            return Promise.resolve({ error: e.message });
        }
    }


    async sendMsgFile(message: MessageModel): Promise<any> {
        try {
            if (!this.status) return Promise.resolve({ error: "SIN INICIO DE SESION" });

            const media = new MessageMedia("application/pdf", message.file!, "document")


            const messageOption: MessageSendOptions = {
                media
            }

            const response = await this.sendMessage(`${message.phone}@c.us`, message.message, messageOption);
            return response.id.id;
        } catch (e: any) {
            console.log(e.message)
            return Promise.resolve({ error: e.message });
        }
    }

    async getMsg(id: string) {
        try {
            if (!this.status) return Promise.resolve({ error: "SIN INICIO DE SESION" });

            const message = await this.getMessageById(id)

            return message;
        } catch (e: any) {
            console.log(e.message)
            return Promise.resolve({ error: e.message });
        }
    }

    getStatus(): boolean {
        return this.status;
    }



    private generateImage = (base64: string) => {
        const path = `${process.cwd()}/tmp`;
        let qr_svg = imageQr(base64, { type: "png", margin: 4 });
        qr_svg.pipe(require("fs").createWriteStream(`${path}/qr.png`));
        console.log(`⚡ Recuerda que el QR se actualiza cada minuto ⚡'`);
        console.log(`⚡ Actualiza F5 el navegador para mantener el mejor QR⚡`);
    };
}

export const whatsappService = WhatsappService.getInstance();