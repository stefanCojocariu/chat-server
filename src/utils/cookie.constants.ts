const accessToken = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRESIN,
    httpOnly: true,
    secure: true
};
const refreshToken = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRESIN,
    httpOnly: true,
    secure: true
};

const cookieOptions = {
    accessToken,
    refreshToken
}

export default cookieOptions;
