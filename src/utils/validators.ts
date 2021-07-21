class Validators {
    constructor() { }

    validateUsername(username: string) {
        var re = /^[a-z0-9_\.]+$/;
        return re.test(username);
    }

    validateEmail(email: string) {
        var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return re.test(email)
    };
}

export default Validators;