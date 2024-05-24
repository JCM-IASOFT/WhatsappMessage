export interface ResponseModel {
    code: number, success: boolean, message: string, data?: any
}

export const ResponseHandler = (response: ResponseModel) => {
    return {
        code: response.code, success: response.success, message: response.message, data: response.data
    };
}

