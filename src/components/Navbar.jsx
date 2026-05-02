import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Box, Flex, Text, Button, Badge } from "@chakra-ui/react";
import { ColorModeButton } from "./ui/color-mode";
import { RiLogoutBoxRLine, RiBankLine } from "react-icons/ri";
import Sidebar from "./Sidebar";

const PAGE_TITLES = {
  "/home": "Dashboard",
  "/customers": "Customers",
  "/cashiers": "Cashiers",
  "/loans": "Loans",
  "/collections": "Collections",
  "/cash-box": "Cash Box",
  "/approvals": "Approval Requests",
  "/reports": "Reports",
  "/notifications": "Notifications",
};

const ROLE_LABELS = {
  SUPER_ADMIN: { label: "Super Admin", color: "purple" },
  ADMIN: { label: "Admin", color: "blue" },
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated, user } = useAuth();

  // Hide navbar on login routes
  if (location.pathname === "/" || location.pathname === "/login") return null;

  const pageTitle = PAGE_TITLES[location.pathname] ?? "Page";
  const roleInfo = user ? ROLE_LABELS[user.role] : null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Box
      as="nav"
      px={5}
      py={3}
      position="sticky"
      top="0"
      zIndex={1000}
      borderBottomWidth="1px"
      borderColor="blackAlpha.100"
      style={{
        background: "rgba(255, 255, 255, 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.06)",
      }}
    >
      <Flex align="center" gap={4}>
        {/* Brand */}
        <Flex align="center" gap={2} shrink={0}>
          <Box
            w="34px"
            h="34px"
            borderRadius="9px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4338ca)" }}
          >
            <RiBankLine size={18} color="white" />
          </Box>
          <Text
            fontWeight="700"
            fontSize="md"
            color="gray.900"
            letterSpacing="-0.2px"
          >
            LoanMgmt
          </Text>
        </Flex>

        {/* Divider + Page title */}
        <Box
          w="1px"
          h="20px"
          flexShrink={0}
          style={{ background: "rgba(139,92,246,0.3)" }}
        />
        <Text fontSize="sm" fontWeight="500" color="gray.500">
          {pageTitle}
        </Text>

        <Box flex={1} />

        {/* Role badge */}
        {roleInfo && (
          <Badge
            colorPalette={roleInfo.color}
            variant="subtle"
            size="sm"
            display={{ base: "none", md: "flex" }}
          >
            {roleInfo.label}
          </Badge>
        )}

        {/* User name */}
        {user && (
          <Text
            fontSize="sm"
            fontWeight="500"
            color="gray.500"
            display={{ base: "none", md: "block" }}
          >
            {user.name}
          </Text>
        )}

        <ColorModeButton size="sm" />

        {isAuthenticated && (
          <Button
            size="sm"
            colorPalette="red"
            variant="subtle"
            onClick={handleLogout}
          >
            <RiLogoutBoxRLine />
            Logout
          </Button>
        )}
      </Flex>

      {isAuthenticated && <Sidebar />}
    </Box>
  );
};

export default Navbar;
