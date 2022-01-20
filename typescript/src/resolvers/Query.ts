const Query = {
    async users(){
        const users = "await db.User.find()"
        return users
    }
};

export { Query as default };