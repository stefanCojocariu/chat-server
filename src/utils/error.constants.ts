const error = {
    client: {
        SERVER_ERROR: 'Error occurred on the server.',
        MESSAGE_NOT_FOUND: 'Message can not be empty.',
        INCORRECT_CREDENTIALS: 'Username or Password is invalid',
    },
    server: {
        ERROR_NEEDS_SIGNIN: 'NeedSignIn',
        AUTHORIZATION_ERROR: 'Error in authorizing.',
        FROMID_NOT_FOUND: 'From id can not be empty.',
        TOID_NOT_FOUND: 'To id can not be empty.',
        JWT_NOSECRET: 'No JWT secret.',
        JWT_TOKENEXPIREDERROR: 'TokenExpiredError'
    }
};

export default error;