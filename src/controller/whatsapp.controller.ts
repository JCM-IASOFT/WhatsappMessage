import { Request, Response } from "express";
import fs from "fs"
import { MessageModel } from "../model/message.model";
import { whatsappService } from "../service/whatsapp.service";
import { ResponseWtsp } from "../core/interface/response.interface";

class WhatsappController {

    // ** Singleton
    private static instance?: WhatsappController;
    public static getInstance(): WhatsappController {
        if (!this.instance) this.instance = new WhatsappController();
        return this.instance;
    }

    public sendMsgFileCtrl = async ({ body, file }: Request, res: Response) => {
        const { message, phone } = body;
        const uploadedFile = file as Express.Multer.File;

        const fileBuffer = uploadedFile.path;

        const imageBuffer = fs.readFileSync(fileBuffer);

        const base64Image = imageBuffer.toString('base64');

        const messageModel: MessageModel = {
            message: message,
            phone: phone,
            file: base64Image
        }

        const response: ResponseWtsp = await whatsappService.sendMsgFile(messageModel)
        res.send(response);
    };


    public sendMsgTextCtrl = async (req: Request, res: Response) => {
        const { message, phone } = req.body;
        const response: ResponseWtsp = await whatsappService.sendMsgText({ message, phone })
        res.send(response);
    };

    public getClient = async (req: Request, res: Response) => {
        const response: ResponseWtsp = await whatsappService.getClientSession()
        res.send(response);
    };

    public closeSession = async (req: Request, res: Response) => {
        const response = await whatsappService.closeSession()
        res.send(response);
    };

    public getStatus = async (req: Request, res: Response) => {
        const response = whatsappService.getStatus()
        res.send(response);
    };


    public getMsgCtrl = async (req: Request, res: Response) => {
        try {
            const { id } = req.body;
            const response = await whatsappService.getMsg(id)
            res.send(response);
        } catch (error) {
            console.log(error)
        }
    };


    public qrCtrl = async ({ body, file }: Request, res: Response) => {
        const path = `${process.cwd()}/tmp/qr.svg`;
        const imageBuffer = fs.readFileSync(path); // Asegúrate de que la ruta sea correcta

        // Convierte el contenido de la imagen a una cadena base64
        const base64Image = imageBuffer.toString('base64');

        res.send(base64Image)
    }

}

export const whatsappController = WhatsappController.getInstance();