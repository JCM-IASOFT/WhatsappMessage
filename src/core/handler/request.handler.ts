import { Response } from "express";
import { ResponseHandler, ResponseModel } from "./response.handler";
import { StatusCodes } from "http-status-codes";
import { MessageApi } from "../constant/MessageApi";

/**
 * - Utilizar HandleRequest para manejar errores de manera uniforme
 * @param res - Envia a front el resultado
 * @param action - El accion que retoran por accion
 */
export const HandleRequest = async (res: Response, action: () => Promise<ResponseModel>) => {
    try {
        const response = await action();
        res.status(response.code).json(ResponseHandler(response));
    } catch (error) {
        console.log(error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ResponseHandler({
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: MessageApi.ERROR_SERVER,
            data: error
        }));
    }
}