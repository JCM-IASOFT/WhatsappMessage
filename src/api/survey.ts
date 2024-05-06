import axios, { HttpStatusCode } from "axios"
import { Request, Response } from "express"
import { MessageApi } from "../core/constant/MessageApi"
import { SurveyModel } from "../core/interface/survey"

export class SurveyMiddleware{
    private static instance: SurveyMiddleware
    public static getInstance(){
        if(!this.instance) this.instance = new SurveyMiddleware()
            return this.instance
    }

    private externalUrl = `${process.env.API_URL}/survey`

    async apiCreateSurvey(survey: SurveyModel){
        try {
    
            if(!survey){ 
                throw new Error(MessageApi.NOT_PARAMETER)
            }
            
            const createUrl = `${this.externalUrl}/create`
    
            const axiosConfig = {
                survey: survey as SurveyModel
            }
    
            const createResponse = await axios.post(createUrl, axiosConfig)
            
            if(!createResponse) Promise.resolve({error: MessageApi.NOT_CONTENT})
                
            return createResponse.data
        } catch (error) {
            throw new Error(MessageApi.ERROR_SERVER)
        }
    }
}

export const surveyMiddleware = SurveyMiddleware.getInstance()

