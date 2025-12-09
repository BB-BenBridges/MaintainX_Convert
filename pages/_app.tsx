import '@mantine/core/styles.layer.css';

import type { AppProps } from "next/app";
import { MantineProvider } from '@mantine/core';
import { theme } from "@/theme";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider defaultColorScheme="auto" theme={theme} >
      <Component {...pageProps} />
    </MantineProvider>
  );
}
