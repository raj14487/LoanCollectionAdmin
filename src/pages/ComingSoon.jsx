import { motion } from "framer-motion";
import { Box, Text } from "@chakra-ui/react";
import { RiToolsLine } from "react-icons/ri";

export default function ComingSoon({ title }) {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      style={{ background: "#0b1929" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: "center" }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "20px",
            margin: "0 auto 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(212,160,23,0.12)",
            border: "1px solid rgba(212,160,23,0.25)",
          }}
        >
          <RiToolsLine size={32} color="#d4a017" />
        </div>
        <Text fontSize="2xl" fontWeight="800" color="white" mb={2}>
          {title}
        </Text>
        <Text fontSize="sm" style={{ color: "rgba(226,232,240,0.4)" }}>
          This page is coming soon.
        </Text>
      </motion.div>
    </Box>
  );
}
