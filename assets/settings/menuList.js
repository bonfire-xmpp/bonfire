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
                title: "Supported XEPs",
                type: "submenu",
                to: "XEPs"
            },
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
