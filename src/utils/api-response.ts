class SuccessResponse {
    isSuccess: boolean;
    data: any;

    constructor(data:any){
        this.isSuccess = true;
        this.data = data;
    }
};

class ErrorResponse {
    isSuccess: boolean;
    error: string;

    constructor(error:string){
        this.isSuccess = false;
        this.error = error;
    }
}

class ApiResponse {
    constructor() {
    }

    format(data: any, error?: string): SuccessResponse | ErrorResponse {
        return error ? new ErrorResponse(error) :  new SuccessResponse(data);
    }
}

export default ApiResponse;