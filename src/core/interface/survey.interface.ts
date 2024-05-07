export interface SurveyModel{
    surveyId?: number
    clientId: number
    userTechnicalId: number
    date: Date | string
    rating: number
    campusId: number
    codeSurvey: string,
    complete: boolean
}