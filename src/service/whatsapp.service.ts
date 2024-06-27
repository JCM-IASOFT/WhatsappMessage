import { Client, LocalAuth, Message, MessageMedia, MessageSendOptions } from "whatsapp-web.js";
import { image as imageQr } from "qr-image";
import fs from "fs/promises"
import { MessageModel } from "../model/message.model";
import { surveyMiddleware } from "../api/survey";
import { SurveyModel } from "../core/interface/survey.interface";
import { parametersMiddleware } from "../api/parameters";
import { parametersConst } from "../core/constant/parameters";
import { ResponseModel } from "../core/handler/response.handler";

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

        this.on('message', async (message: Message) => {
            // Verificar si el mensaje recibido es de un chat individual y no un mensaje del sistema
            if (message.fromMe || message.from.includes('status@broadcast') || message.from.includes('@g.us')) {
                // Si el mensaje es propio o de un grupo, ignorarlo
                return;
            }

            const phone = message.from.replace(/^\d{2}|\D+/g, '');

            if (!phone) Promise.reject({ error: 'Numero invalido' })

            const validateNumber = (number: number) => {
                if (typeof number === 'number' && (number >= 1 && number <= 10)) {
                    return true
                }

                return false
            }

            if (!validateNumber(Number(message.body))) return;

            const survey = await surveyMiddleware.apiFindSurvey(phone)

            if (survey.length === 0) return;

            if (survey && survey.length === 1) {
                if (survey[0].codeSurvey && survey[0].codeSurvey !== '') {
                    if (this.validateFormatIdMessage(survey[0].codeSurvey)) {
                        const surveySent = await this.getMsg(survey[0].codeSurvey)
                        const parseSurveyNumber = surveySent.to.replace(/^\d{2}|\D+/g, '');

                        if (phone === parseSurveyNumber) {
                            this.updateSurveyAndFarewellMessage(phone, survey, message)
                        } else {
                            return;
                        }
                    } else {
                        console.log('Codigo de encuesta invalido')
                        return;
                    }
                } else {
                    console.log('Codigo de encuesta no existe o esta vacio')
                }
            } else if (survey && survey.length > 1) {
                const currentDate = new Date();

                /**
                 * @closeDate => fecha cercana a la actual
                 * @minorDifference => menor diferencia
                 * @currentSurvey => registro de encuesta actual 
                 */
                let closeDate = survey[0].date;
                let minorDifference = Math.abs(currentDate.getTime() - new Date(survey[0].date).getTime());
                let currentSurvey: SurveyModel | undefined

                survey.forEach(item => {
                    if (item.date) {
                        const difference = Math.abs(currentDate.getTime() - new Date(item.date).getTime());
                        if (difference < minorDifference) {
                            minorDifference = difference
                            closeDate = item.date
                            currentSurvey = item
                        }
                    }
                })

                if (currentSurvey?.codeSurvey && currentSurvey?.codeSurvey !== '') {
                    if (this.validateFormatIdMessage(currentSurvey?.codeSurvey)) {
                        const surveySent = await this.getMessageById(currentSurvey?.codeSurvey!)
                        const parseSurveyNumber = surveySent.to.replace(/^\d{2}|\D+/g, '');

                        if (phone === parseSurveyNumber) {
                            this.updateSurveyAndFarewellMessage(phone, [currentSurvey!], message)
                        } else {
                            return;
                        }
                    } else {
                        console.log('Codigo de encuesta invalido')
                        return;
                    }
                } else {
                    console.log('Codigo de encuesta no existe o esta vacio')
                }
            } else {
                return;
            }
        });
    }

    async updateSurveyAndFarewellMessage(phone: string, survey: SurveyModel[], message: Message) {
        const surveyData: SurveyModel = {
            surveyId: survey[0].surveyId,
            clientId: survey[0].clientId,
            userTechnicalId: survey[0].userTechnicalId,
            date: survey[0].date,
            rating: Number(message.body),
            campusId: survey[0].campusId,
            codeSurvey: survey[0].codeSurvey,
            complete: true
        }

        const updateResponse = await surveyMiddleware.apiUpdateSurvey(surveyData)

        if (updateResponse.success) {
            const parameter = await parametersMiddleware.apiFindParametersMessage(parametersConst.CHATBOT, survey[0].campusId)

            if (parameter && parameter.length > 0) {

                await this.sendMsgText({
                    message: parameter[0].value,
                    phone: `51${phone}`
                })

                console.log('todo ok!!!')
            }
        }
    }

    validateFormatIdMessage(id: string): boolean {
        const regex = /^(false|true)_[0-9]+@c\.us_[0-9A-F]+$/;
        return regex.test(id);
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

    async sendMsgText(message: MessageModel): Promise<Message | null> {
        try {
            if (!this.status) return null

            const response = await this.sendMessage(`${message.phone}@c.us`, message.message);
            return response;
        } catch (e: any) {
            console.log(e.message)
            return null
        }
    }


    async sendMsgFile(message: MessageModel, fileName: string): Promise<Message | Error> {
        try {
            if (!this.status) return new Error("SIN INICIO DE SESION");

            const media = new MessageMedia("application/pdf", message.file!, fileName)


            const messageOption: MessageSendOptions = {
                media
            }

            const response = await this.sendMessage(`${message.phone}@c.us`, message.message, messageOption);
            return response;
        } catch (e: any) {
            console.log(e.message)
            return e;
        }
    }

    async getMsg(id: string): Promise<Message> {
        try {
            if (!this.status) return Promise.reject({ error: "SIN INICIO DE SESION" });

            const message = await this.getMessageById(id)

            return message;
        } catch (e: any) {
            console.log(e.message)
            return Promise.reject({ error: e.message });
        }
    }

    getStatus(): boolean {
        console.log("ddd", this.status)

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