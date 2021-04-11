export default [
    {
        header: "User Settings",
        content: [
            {
                title: "Privacy",
                type: "submenu",
                to: "privacy"
            }
        ]
    },
    {
        content: [
            {
                title: "About",
                type: "submenu",
                to: "about"
            },
            {
                title: "Log Out",
                type: "nuxt",
                to: "/logout",
                color: "#fb4934",
            }
        ]
    }
];
