export const black = {
    base: "#282828",
    lighten: "#32302f",
    darken: "#1d2021"
};

export const white = {
    base: "#ebdbb2",
    lighten: "#fbf1c7",
    darken: "#d5c4a1"
};

export const greys = {
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

export const red = {
    darken: "#cc214d",
    lighten: "#fb4934",
}

export const orange = {
    darken: "#d65d0e",
    lighten: "#fe8019",
}

export const yellow = {
    darken: "#d79921",
    lighten: "#fabd2f",
}

export const green = {
    darken: "#98971a",
    lighten: "#b8bb26",
}

export const aqua = {
    darken: "#689d6a",
    lighten: "#8ec07c",
}

export const blue = {
    darken: "#458558",
    lighten: "#83a598",
}

export const purple = {
    darken: "#b16286",
    lighten: "#d3869b",
}

const generateGreys = greys => {
    let r = {};
    for(const color in greys) {
        if(greys.hasOwnProperty(color)) {
            r[`grey-${color}`] = greys[color];
        }
    }
    return r;
}

export default {
    primary: green.darken,
    secondary: orange.darken,

    accent: greys[400],

    white: white.lighten,
    black: black.base,

    info: aqua.lighten,
    warning: yellow.darken,
    error: red.lighten,
    success: green.lighten,

    online: green.lighten,
    away: yellow.lighten,
    xa: orange.lighten,
    dnd: red.lighten,
    offline: greys[500],

    ...generateGreys(greys),
}
