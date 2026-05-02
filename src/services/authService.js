import { API_BASE_URL } from "../config/api";

export const login = async ({ mobileOrEmail, password }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: mobileOrEmail, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.message || "Invalid credentials" };
    }

    const data = await res.json();

    if (data.role === "CASHIER") {
      return {
        success: false,
        message:
          "Cashiers use the mobile app. Admin panel is for Super Admin and Admin only.",
      };
    }

    return {
      success: true,
      user: {
        id: data.userId,
        name: data.name,
        role: data.role,
        token: data.token,
      },
    };
  } catch {
    return { success: false, message: "Network error. Please try again." };
  }
};
