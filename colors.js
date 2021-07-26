const black = {
    DEFAULT: "#282828",
    lighten: "#32302f",
    darken: "#1d2021"
};

const white = {
    DEFAULT: "#ebdbb2",
    lighten: "#fbf1c7",
    darken: "#d5c4a1"
};

const grey = {
    100: "#3c3836",
    200: "#504945",
    300: "#665c54",
    400: "#7c6f64",
    500: "#928364",
    600: "#a89984",
    700: "#bdae93",
    800: "#d5c4a1",
    900: "#ebdbb2",
}

const red = {
    darken: "#cc214d",
    lighten: "#fb4934",
}

const orange = {
    darken: "#d65d0e",
    lighten: "#fe8019",
}

const yellow = {
    darken: "#d79921",
    lighten: "#fabd2f",
}

const green = {
    darken: "#98971a",
    lighten: "#b8bb26",
}

const aqua = {
    darken: "#689d6a",
    lighten: "#8ec07c",
}

const blue = {
    darken: "#458558",
    lighten: "#83a598",
}

const purple = {
    darken: "#b16286",
    lighten: "#d3869b",
}

module.exports = {
    primary: green.darken,
    secondary: orange.darken,

    accent: grey[400],

    white, black,

    info: aqua.lighten,
    warning: yellow.darken,
    error: red.lighten,
    success: green.lighten,

    online: green.lighten,
    away: yellow.lighten,
    xa: orange.lighten,
    dnd: red.lighten,
    offline: grey[500],

    red, orange, yellow, green, aqua, blue, purple,

    grey,
}
