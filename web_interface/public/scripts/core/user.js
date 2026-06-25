export const User = {
    get() {
        return window.user || {};
    },

    avatar(user = window.user) {
        return user.avatar ||
            "https://cdn.discordapp.com/embed/avatars/0.png";
    }
};
