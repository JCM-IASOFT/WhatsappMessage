import { Router } from 'express'
import { whatsappController } from '../controller/whatsapp.controller';
import multer from 'multer';
import { upload } from '../core/helpers/multer.helper';

export const whatsappRoute = Router();

whatsappRoute.post('/text', whatsappController.sendMsgTextCtrl)
whatsappRoute.post('/file', upload.single('file'), whatsappController.sendMsgFileCtrl)
whatsappRoute.post('/chat', whatsappController.getMsgCtrl)
whatsappRoute.get('/client', whatsappController.getClient)
whatsappRoute.post('/close', whatsappController.closeSession)
whatsappRoute.get('/status', whatsappController.getStatus)

