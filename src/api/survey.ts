import axios, { HttpStatusCode } from "axios"
import e, { Request, Response } from "express"
import { MessageApi } from "../core/constant/MessageApi"
import { SurveyModel } from "../core/interface/survey.interface"

export class SurveyMiddleware{
    private static instance: SurveyMiddleware
    public static getInstance(){
        if(!this.instance) this.instance = new SurveyMiddleware()
            return this.instance
    }

    private externalUrl = `${process.env.API_URL}/survey`

    async apiFindSurvey(phone: string, currentDate: Date = new Date(), lastDate: Date = new Date(), state: boolean = false): Promise<SurveyModel[]>{

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

        if(!findResponse) Promise.reject({error: MessageApi.NOT_CONTENT})

        return Promise.resolve(findResponse.data)     
    }
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
            
            if(!createResponse) Promise.reject({error: MessageApi.NOT_CONTENT})
                
            return createResponse.data
        } catch (error) {
            throw new Error(MessageApi.ERROR_SERVER)
        }
    }

    async apiUpdateSurveyByCode(survey: SurveyModel){
        try {
            if(!survey) throw {error: MessageApi.NOT_PARAMETER}

            const updateUrl = `${this.externalUrl}/update`

            const axiosConfig = {
                survey: {
                    surveyId: survey.surveyId,
                    codeSurvey: survey.codeSurvey,
                }
            }

            const updateResponse = await axios.put(updateUrl, axiosConfig)

            if(!updateResponse) throw {error: MessageApi.NOT_CONTENT}

            return updateResponse.data
        } catch (error) {
            throw { error: MessageApi.ERROR_SERVER };
        }
    }

    async apiUpdateSurvey(survey: SurveyModel){
        try {
            if(!survey) throw {error: MessageApi.NOT_PARAMETER}

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

            if(!updateResponse) throw {error: MessageApi.NOT_CONTENT}

            return updateResponse.data
        } catch (error) {
            throw error;
        }
    }

    
}

export const surveyMiddleware = SurveyMiddleware.getInstance()

