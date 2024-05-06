import axios, { HttpStatusCode } from "axios";
import { Response, Request } from "express";
import { MessageApi } from "../core/constant/MessageApi";

export class ParametersMiddleware{
    private static instance: ParametersMiddleware
    public static getInstance(): ParametersMiddleware{
        if(!this.instance) this.instance = new ParametersMiddleware()
            return this.instance
    }

    private externalUrl = `${process.env.API_URL}/parameter`

    async apiFindParametersMessage(group: string, campusId: number){
        try {

            if(!group && !campusId){
                throw new Error(MessageApi.NOT_PARAMETER)
            }

            const axiosConfig = {
                params: {
                    group: group,
                    campusId: campusId
                }
            }

            const findResponse = await axios.get(this.externalUrl, axiosConfig)
            if(!findResponse){
                throw new Error(MessageApi.NOT_CONTENT)
            }

            return findResponse.data
        } catch (error) {
            throw new Error(MessageApi.ERROR_SERVER)
        }
    }
}

export const parametersMiddleware = ParametersMiddleware.getInstance()