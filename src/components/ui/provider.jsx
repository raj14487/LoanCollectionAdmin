"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ColorModeProvider } from "./color-mode";

export function Provider({ defaultTheme = "dark", ...props }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider defaultTheme={defaultTheme} {...props} />
    </ChakraProvider>
  );
}
