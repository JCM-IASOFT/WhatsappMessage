import axios, { HttpStatusCode } from "axios";
import { Response, Request } from "express";
import { MessageApi } from "../core/constant/MessageApi";
import { ParameterModel } from "../core/interface/parameter.interface";

export class ParametersMiddleware{
    private static instance: ParametersMiddleware
    public static getInstance(): ParametersMiddleware{
        if(!this.instance) this.instance = new ParametersMiddleware()
            return this.instance
    }

    private externalUrl = `${process.env.API_URL}/parameter`

    async apiFindParametersMessage(group: string, campusId: number): Promise<ParameterModel[]>{
        try {

            if(!group && !campusId) console.log(MessageApi.NOT_PARAMETER)

            const axiosConfig = {
                params: {
                    group: group,
                    campusId: campusId
                }
            }

            const findResponse = await axios.get(this.externalUrl, axiosConfig)
            
            if(!findResponse) console.log(MessageApi.NOT_CONTENT)

            return findResponse.data as ParameterModel[]
        } catch (error) {
            // throw new Error(MessageApi.ERROR_SERVER)
            return []
        }
    }
}

export const parametersMiddleware = ParametersMiddleware.getInstance()