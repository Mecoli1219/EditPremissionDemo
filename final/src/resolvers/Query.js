const Query = {
    async users(parent, args, {db}){
        const users = await db.User.find()
        return users
    },
    async user(parent, args, {db, userID}){
        const user = await db.User.findOne({userID});
        return user
    },
};

export { Query as default };