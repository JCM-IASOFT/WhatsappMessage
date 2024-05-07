import axios, { HttpStatusCode } from "axios"
import e, { Request, Response } from "express"
import { MessageApi } from "../core/constant/MessageApi"
import { SurveyModel } from "../core/interface/survey.interface"
import { ResponseItem } from "../core/interface/responseItem.interface"

export class SurveyMiddleware{
    private static instance: SurveyMiddleware
    public static getInstance(){
        if(!this.instance) this.instance = new SurveyMiddleware()
            return this.instance
    }

    private externalUrl = `${process.env.API_URL}/survey`

    async apiFindSurvey(phone: string, currentDate: Date = new Date(), lastDate: Date = new Date(), state: boolean = false): Promise<SurveyModel[]>{

        try {
            lastDate.setDate(currentDate.getDate() - 2);

            const findUrl = `${this.externalUrl}/phone`

            const axiosConfig = {
                params: {
                    phone: phone,
                    currentDate: currentDate,
                    lastDate: lastDate,
                    state: state
                }
            }

            const findResponse = await axios.get(findUrl, axiosConfig)

            if(!findResponse) console.log({error: MessageApi.NOT_CONTENT})

            return findResponse.data
        } catch (error) {
            console.log(error)
            return []
        }
    }

    async apiCreateSurvey(survey: SurveyModel): Promise<ResponseItem>{
        try {
    
            if(!survey) console.log(MessageApi.NOT_PARAMETER)
            
            const createUrl = `${this.externalUrl}/create`
    
            const axiosConfig = {
                survey: survey as SurveyModel
            }
    
            const createResponse = await axios.post(createUrl, axiosConfig)
            
            if(!createResponse) console.log({error: MessageApi.NOT_CONTENT})
                
            return createResponse.data
        } catch (error: any) {
            console.log(MessageApi.ERROR_SERVER)
            return {
                code: 500,
                message: error.message,
                success: false,
                data: error
            }
        }
    }

    async apiUpdateSurveyByCode(survey: SurveyModel): Promise<ResponseItem>{
        try {
            if(!survey) console.log(MessageApi.NOT_CONTENT)

            const updateUrl = `${this.externalUrl}/update`

            const axiosConfig = {
                survey: {
                    surveyId: survey.surveyId,
                    codeSurvey: survey.codeSurvey,
                }
            }

            const updateResponse = await axios.put(updateUrl, axiosConfig)

            if(!updateResponse) console.log(MessageApi.ERROR_SERVER)

            return updateResponse.data
        } catch (error: any) {
            console.log(error)
            return {code: 500, message: error.message, success: false, data: error}
        }
    }

    async apiUpdateSurvey(survey: SurveyModel): Promise<ResponseItem>{
        try {
            if(!survey) console.log(MessageApi.NOT_CONTENT)

            const updateUrl = `${this.externalUrl}/update`

            const axiosConfig = {
                survey: {
                    surveyId: survey.surveyId,
                    codeSurvey: survey.codeSurvey,
                    complete: survey.complete,
                    rating: survey.rating,
                    date: survey.date,
                    clientId: survey.clientId,
                    userTechnicalId: survey.userTechnicalId,
                    campusId: survey.campusId
                }
            }

            const updateResponse = await axios.put(updateUrl, axiosConfig)

            if(!updateResponse) console.log(MessageApi.ERROR_SERVER)

            return updateResponse.data
        } catch (error: any) {
            console.log(error)
            return {code: 500, message: error.message, success: false, data: error}
        }
    }

    
}

export const surveyMiddleware = SurveyMiddleware.getInstance()

