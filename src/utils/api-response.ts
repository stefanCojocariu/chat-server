interface SuccessResponse {
    data: any
};

interface ErrorResponse {
    error: string
}

class ApiResponse {
    constructor() {
    }

    format(data: any, error?: string): SuccessResponse | ErrorResponse {
        return error ? { error } : { data };
    }
}

export default ApiResponse;