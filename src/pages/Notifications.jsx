import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import {
  RiBellLine,
  RiCheckDoubleLine,
  RiRefreshLine,
  RiSmartphoneLine,
  RiNotificationLine,
} from "react-icons/ri";
import { apiFetch } from "../config/api";
import { toaster } from "../components/ui/toaster";

const ACCENT = "#06b6d4";

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function NotificationCard({ notif, onMarkRead }) {
  const unread = !notif.isRead;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      style={{
        padding: "14px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        cursor: unread ? "pointer" : "default",
        background: unread ? "rgba(6,182,212,0.04)" : "transparent",
        transition: "background 0.2s",
      }}
      onClick={() => unread && onMarkRead(notif.id)}
    >
      {/* Unread dot */}
      <div
        style={{
          marginTop: 6,
          width: 8,
          height: 8,
          borderRadius: "50%",
          flexShrink: 0,
          background: unread ? ACCENT : "transparent",
          border: unread ? "none" : "1.5px solid rgba(255,255,255,0.1)",
          boxShadow: unread ? `0 0 6px ${ACCENT}60` : "none",
        }}
      />

      {/* Type icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: unread ? `${ACCENT}18` : "rgba(255,255,255,0.04)",
          border: `1px solid ${unread ? `${ACCENT}30` : "rgba(255,255,255,0.07)"}`,
        }}
      >
        {notif.type === "SMS" ? (
          <RiSmartphoneLine
            size={16}
            color={unread ? ACCENT : "rgba(226,232,240,0.3)"}
          />
        ) : (
          <RiNotificationLine
            size={16}
            color={unread ? ACCENT : "rgba(226,232,240,0.3)"}
          />
        )}
      </div>

      {/* Message + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            lineHeight: "1.5",
            wordBreak: "break-word",
            color: unread ? "rgba(226,232,240,0.9)" : "rgba(226,232,240,0.45)",
            fontWeight: unread ? 600 : 400,
          }}
        >
          {notif.message}
        </div>
        <Flex align="center" gap={2} mt="6px" flexWrap="wrap">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 8px",
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.4px",
              textTransform: "uppercase",
              background:
                notif.type === "SMS"
                  ? "rgba(139,92,246,0.12)"
                  : "rgba(6,182,212,0.1)",
              color: notif.type === "SMS" ? "#a78bfa" : ACCENT,
              border: `1px solid ${notif.type === "SMS" ? "rgba(139,92,246,0.2)" : "rgba(6,182,212,0.2)"}`,
            }}
          >
            {notif.type}
          </span>
          <span style={{ fontSize: 11, color: "rgba(226,232,240,0.3)" }}>
            {notif.createdAt ? relativeTime(notif.createdAt) : "—"}
          </span>
          {unread && (
            <span
              style={{
                fontSize: 11,
                color: ACCENT,
                opacity: 0.6,
                marginLeft: "auto",
              }}
            >
              tap to mark read
            </span>
          )}
        </Flex>
      </div>
    </motion.div>
  );
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/notifications");
      setNotifications(data ?? []);
    } catch (e) {
      toaster.create({ title: e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = async id => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      toaster.create({ title: e.message, type: "error" });
    }
  };

  const markAllRead = async () => {
    setMarking(true);
    try {
      await apiFetch("/api/notifications/read-all", { method: "PUT" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toaster.create({
        title: "All notifications marked as read",
        type: "success",
      });
    } catch (e) {
      toaster.create({ title: e.message, type: "error" });
    } finally {
      setMarking(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const TABS = [
    { key: "all", label: "All", count: notifications.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "read", label: "Read", count: notifications.length - unreadCount },
  ];

  const filtered = notifications.filter(n => {
    if (tab === "unread") return !n.isRead;
    if (tab === "read") return n.isRead;
    return true;
  });

  return (
    <Box
      p={{ base: 4, md: 6 }}
      style={{ background: "#0b1929", minHeight: "100%" }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Flex
          align="center"
          justify="space-between"
          mb={6}
          flexWrap="wrap"
          gap={3}
        >
          <Flex align="center" gap={3}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(6,182,212,0.1)",
                border: "1px solid rgba(6,182,212,0.2)",
              }}
            >
              <RiBellLine size={22} color={ACCENT} />
              {unreadCount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#ef4444",
                    border: "2px solid #0b1929",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 800,
                    color: "white",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </div>
              )}
            </div>
            <div>
              <Text
                fontSize="xl"
                fontWeight="800"
                color="white"
                letterSpacing="-0.3px"
              >
                Notifications
              </Text>
              <Text fontSize="sm" style={{ color: "rgba(226,232,240,0.4)" }}>
                {unreadCount > 0
                  ? `${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}`
                  : "All caught up"}
              </Text>
            </div>
          </Flex>

          <Flex align="center" gap={2}>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={marking}
                style={{
                  padding: "9px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 600,
                  background: "rgba(6,182,212,0.08)",
                  border: "1px solid rgba(6,182,212,0.2)",
                  color: ACCENT,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  opacity: marking ? 0.5 : 1,
                }}
              >
                <RiCheckDoubleLine size={15} />
                Mark all read
              </button>
            )}
            <button
              onClick={fetchNotifications}
              disabled={loading}
              style={{
                padding: "9px 14px",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(226,232,240,0.5)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: loading ? 0.5 : 1,
              }}
            >
              <RiRefreshLine
                size={15}
                style={{
                  animation: loading ? "spin 1s linear infinite" : "none",
                }}
              />
              Refresh
            </button>
          </Flex>
        </Flex>
      </motion.div>

      {/* Filter tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        <Flex gap={2} mb={5} flexWrap="wrap">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "7px 16px",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: tab === t.key ? 700 : 500,
                border: `1px solid ${tab === t.key ? ACCENT + "50" : "rgba(255,255,255,0.08)"}`,
                background:
                  tab === t.key ? `${ACCENT}14` : "rgba(255,255,255,0.03)",
                color: tab === t.key ? ACCENT : "rgba(226,232,240,0.45)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s",
              }}
            >
              {t.label}
              <span
                style={{
                  padding: "1px 6px",
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 700,
                  background:
                    tab === t.key ? `${ACCENT}25` : "rgba(255,255,255,0.07)",
                  color: tab === t.key ? ACCENT : "rgba(226,232,240,0.35)",
                }}
              >
                {t.count}
              </span>
            </button>
          ))}
        </Flex>
      </motion.div>

      {/* Notification list */}
      {loading ? (
        <Flex justify="center" align="center" py={24}>
          <Flex direction="column" align="center" gap={3}>
            <Spinner
              style={{ color: "rgba(6,182,212,0.6)", width: 36, height: 36 }}
            />
            <Text style={{ color: "rgba(226,232,240,0.35)", fontSize: 13 }}>
              Loading notifications…
            </Text>
          </Flex>
        </Flex>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Box
            borderRadius="20px"
            style={{
              background: "#112240",
              border: "1px solid rgba(255,255,255,0.07)",
              overflow: "hidden",
            }}
          >
            {filtered.length === 0 ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                py={16}
                gap={3}
              >
                <RiBellLine size={48} color="rgba(6,182,212,0.1)" />
                <Text style={{ color: "rgba(226,232,240,0.35)", fontSize: 14 }}>
                  {tab === "unread"
                    ? "No unread notifications"
                    : tab === "read"
                      ? "No read notifications"
                      : "No notifications"}
                </Text>
              </Flex>
            ) : (
              <AnimatePresence>
                {filtered.map(notif => (
                  <NotificationCard
                    key={notif.id}
                    notif={notif}
                    onMarkRead={markRead}
                  />
                ))}
              </AnimatePresence>
            )}
          </Box>
        </motion.div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Box>
  );
}
