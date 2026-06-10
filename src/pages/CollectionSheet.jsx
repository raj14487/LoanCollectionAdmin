import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import {
  RiFileListLine,
  RiCheckLine,
  RiTimeLine,
  RiMapPinLine,
  RiPhoneLine,
  RiStoreLine,
  RiMoneyDollarBoxLine,
} from "react-icons/ri";
import { apiFetch } from "../config/api";

const fmt = amount =>
  amount != null
    ? `₹${Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`
    : "—";

const today = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const FILTERS = ["ALL", "PENDING", "COLLECTED"];

function SummaryChip({ label, value, color }) {
  return (
    <div
      style={{
        padding: "8px 16px",
        borderRadius: 20,
        background: `rgba(${color}, 0.08)`,
        border: `1px solid rgba(${color}, 0.2)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: 90,
      }}
    >
      <span style={{ fontSize: 18, fontWeight: 800, color: `rgb(${color})` }}>
        {value}
      </span>
      <span
        style={{
          fontSize: 10,
          color: "rgba(226,232,240,0.45)",
          textTransform: "uppercase",
          letterSpacing: "0.6px",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function SheetRow({ entry }) {
  const collected = entry.collectedToday === true;
  const hasDays =
    entry.totalInstallmentDays != null && entry.totalInstallmentDays > 0;
  const paid = entry.installmentsPaid ?? 0;
  const remaining = entry.remainingInstallments ?? 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        padding: "14px 16px",
        borderRadius: 12,
        background: collected
          ? "rgba(16,185,129,0.04)"
          : "rgba(245,158,11,0.03)",
        border: `1px solid ${collected ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.12)"}`,
        marginBottom: 6,
        opacity: collected ? 0.75 : 1,
      }}
    >
      {/* Status icon */}
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          flexShrink: 0,
          marginTop: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: collected
            ? "rgba(16,185,129,0.12)"
            : "rgba(245,158,11,0.1)",
          border: `1px solid ${collected ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
        }}
      >
        {collected ? (
          <RiCheckLine size={18} color="#10b981" />
        ) : (
          <RiTimeLine size={18} color="#f59e0b" />
        )}
      </div>

      {/* Customer info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
            flexWrap: "wrap",
          }}
        >
          {entry.customerNumber && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#d4a017",
                background: "rgba(212,160,23,0.1)",
                border: "1px solid rgba(212,160,23,0.2)",
                borderRadius: 5,
                padding: "1px 6px",
              }}
            >
              {entry.customerNumber}
            </span>
          )}
          <span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>
            {entry.customerName ?? "—"}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 9px",
              borderRadius: 12,
              background: collected
                ? "rgba(16,185,129,0.12)"
                : "rgba(245,158,11,0.1)",
              border: `1px solid ${collected ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`,
              color: collected ? "#10b981" : "#f59e0b",
              textTransform: "uppercase",
              letterSpacing: "0.4px",
            }}
          >
            {collected ? "Collected" : "Pending"}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          {entry.shopName && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: "rgba(226,232,240,0.6)",
              }}
            >
              <RiStoreLine size={12} color="rgba(212,160,23,0.5)" />
              {entry.shopName}
            </span>
          )}
          {entry.mobile && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: "rgba(226,232,240,0.4)",
              }}
            >
              <RiPhoneLine size={11} color="rgba(226,232,240,0.25)" />
              {entry.mobile}
            </span>
          )}
        </div>

        {entry.address && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 4,
              fontSize: 11,
              color: "rgba(226,232,240,0.35)",
              lineHeight: 1.4,
            }}
          >
            <RiMapPinLine
              size={11}
              color="rgba(226,232,240,0.2)"
              style={{ flexShrink: 0, marginTop: 1 }}
            />
            {entry.address}
          </div>
        )}
      </div>

      {/* Right: amount + progress */}
      <div
        style={{
          textAlign: "right",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 4,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, color: "#f59e0b" }}>
          {fmt(entry.dailyInstallmentAmount)}
        </div>
        {entry.collectionFrequency === "WEEKLY" && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "1px 7px",
              borderRadius: 10,
              background: "rgba(167,139,250,0.1)",
              border: "1px solid rgba(167,139,250,0.25)",
              color: "#a78bfa",
            }}
          >
            WEEKLY
          </span>
        )}
        {hasDays && (
          <div style={{ fontSize: 11, color: "rgba(226,232,240,0.4)" }}>
            Day {paid}/{entry.totalInstallmentDays}
          </div>
        )}
        {hasDays && remaining > 0 && (
          <div style={{ fontSize: 11, color: "rgba(226,232,240,0.3)" }}>
            {remaining} left
          </div>
        )}
        {entry.assignedCashierName && (
          <div
            style={{
              fontSize: 10,
              color: "rgba(226,232,240,0.25)",
              marginTop: 2,
            }}
          >
            {entry.assignedCashierName}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollectionSheet() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    apiFetch("/api/collections/today-sheet")
      .then(data => setEntries(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const collected = entries.filter(e => e.collectedToday === true);
  const pending = entries.filter(e => e.collectedToday !== true);
  const totalExpected = entries.reduce(
    (sum, e) => sum + Number(e.dailyInstallmentAmount ?? 0),
    0
  );
  const totalRemaining = pending.reduce(
    (sum, e) => sum + Number(e.dailyInstallmentAmount ?? 0),
    0
  );

  const filtered = entries.filter(e => {
    if (filter === "COLLECTED") return e.collectedToday === true;
    if (filter === "PENDING") return e.collectedToday !== true;
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
        <Flex align="center" gap={3} mb={2}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <RiFileListLine size={22} color="#f59e0b" />
          </div>
          <div>
            <Text
              fontSize="xl"
              fontWeight="800"
              color="white"
              letterSpacing="-0.3px"
            >
              Today&apos;s Sheet
            </Text>
            <Text fontSize="sm" style={{ color: "rgba(226,232,240,0.35)" }}>
              {today}
            </Text>
          </div>
        </Flex>
      </motion.div>

      {/* Summary chips */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
        >
          <Flex gap={3} mb={5} mt={4} flexWrap="wrap" align="center">
            <SummaryChip
              label="Expected"
              value={fmt(totalExpected)}
              color="245,158,11"
            />
            <SummaryChip
              label="Collected"
              value={String(collected.length)}
              color="16,185,129"
            />
            <SummaryChip
              label="Pending"
              value={String(pending.length)}
              color="239,68,68"
            />
            <SummaryChip
              label="Remaining"
              value={fmt(totalRemaining)}
              color="239,68,68"
            />
          </Flex>
        </motion.div>
      )}

      {/* Filter tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Flex gap={2} mb={5} flexWrap="wrap">
          {FILTERS.map(f => {
            const active = filter === f;
            const count =
              f === "ALL"
                ? entries.length
                : f === "COLLECTED"
                  ? collected.length
                  : pending.length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  background: active
                    ? "rgba(245,158,11,0.12)"
                    : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`,
                  color: active ? "#f59e0b" : "rgba(226,232,240,0.5)",
                }}
              >
                {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "1px 7px",
                    borderRadius: 10,
                    background: active
                      ? "rgba(245,158,11,0.18)"
                      : "rgba(255,255,255,0.06)",
                    color: active ? "#f59e0b" : "rgba(226,232,240,0.4)",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </Flex>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {loading ? (
          <Flex justify="center" align="center" py={16}>
            <Spinner style={{ color: "rgba(245,158,11,0.6)" }} />
          </Flex>
        ) : error ? (
          <Box
            p={4}
            borderRadius="12px"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#fca5a5",
              fontSize: 13,
            }}
          >
            {error}
          </Box>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px 24px" }}>
            <RiMoneyDollarBoxLine
              size={44}
              color="rgba(245,158,11,0.12)"
              style={{ margin: "0 auto 14px" }}
            />
            <div style={{ color: "rgba(226,232,240,0.35)", fontSize: 14 }}>
              {filter === "COLLECTED"
                ? "No collections recorded yet today"
                : filter === "PENDING"
                  ? "All customers have been collected from today"
                  : "No active loans found"}
            </div>
          </div>
        ) : (
          <div>
            {filtered.map((entry, i) => (
              <motion.div
                key={entry.loanId}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02, duration: 0.25 }}
              >
                <SheetRow entry={entry} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </Box>
  );
}
