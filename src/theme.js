import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#ff5f6d" }, // coral
    secondary: { main: "#ffc371" }, // warm yellow
  },
  typography: {
    fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial',
    button: { fontWeight: 700 },
  },
  shape: { borderRadius: 10 },
});

export default theme;