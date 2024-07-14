import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.js'
import '@fontsource-variable/nunito'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import './index.css'

const theme = extendTheme({
    styles: {
        global: {
            body: {
                bg: "gray.100", // Change this to the desired background color token or hex code
            },
        },
    },
    fonts: {
        heading: `'Nunito Variable', sans-serif`,
        body: `'Nunito Variable', sans-serif`,
    },
});

export default theme

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App/>
    </ChakraProvider>
  </React.StrictMode>,
)
