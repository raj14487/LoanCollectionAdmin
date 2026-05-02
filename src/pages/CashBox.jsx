import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Flex, Text, Spinner, Grid } from "@chakra-ui/react";
import {
  RiSafeLine,
  RiAddLine,
  RiCalendarLine,
  RiEditLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiCloseLine,
  RiCheckLine,
  RiUserLine,
  RiRefreshLine,
} from "react-icons/ri";
import { apiFetch } from "../config/api";
import { toaster } from "../components/ui/toaster";

const ACCENT = "#f97316";

const fmt = amount =>
  amount != null
    ? `₹${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "—";

const today = () => new Date().toISOString().split("T")[0];

const daysAgo = n => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

const fmtDisplayDate = d =>
  d
    ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const isOpen = record => record.closingBalance == null;

function StatusBadge({ open }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: open ? "rgba(249,115,22,0.1)" : "rgba(16,185,129,0.1)",
        border: `1px solid ${open ? "rgba(249,115,22,0.25)" : "rgba(16,185,129,0.25)"}`,
        color: open ? ACCENT : "#10b981",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: open ? ACCENT : "#10b981",
          display: "inline-block",
        }}
      />
      {open ? "Open" : "Closed"}
    </span>
  );
}

// ── Today Card ────────────────────────────────────────────────────────────────

function TodayCard({ record, onOpenCreate, onOpenEdit }) {
  if (!record) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
      >
        <div
          style={{
            padding: "28px 28px",
            borderRadius: 20,
            marginBottom: 24,
            background: "#112240",
            border: "1px solid rgba(249,115,22,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(249,115,22,0.08)",
                border: "1px solid rgba(249,115,22,0.15)",
              }}
            >
              <RiSafeLine size={26} color="rgba(249,115,22,0.4)" />
            </div>
            <div>
              <div
                style={{
                  color: "rgba(226,232,240,0.5)",
                  fontSize: 14,
                  marginBottom: 4,
                }}
              >
                Today&apos;s Cash Box
              </div>
              <div style={{ color: "rgba(226,232,240,0.3)", fontSize: 13 }}>
                No record for today &mdash; {fmtDisplayDate(today())}
              </div>
            </div>
          </div>
          <button
            onClick={onOpenCreate}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 20px",
              borderRadius: 12,
              cursor: "pointer",
              fontFamily: "inherit",
              background: `linear-gradient(135deg, ${ACCENT}, #ea580c)`,
              border: "none",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: `0 4px 16px rgba(249,115,22,0.3)`,
            }}
          >
            <RiAddLine size={16} />
            Open Cash Box
          </button>
        </div>
      </motion.div>
    );
  }

  const open = isOpen(record);
  const net =
    record.closingBalance != null
      ? Number(record.closingBalance) - Number(record.openingBalance)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 }}
    >
      <div
        style={{
          borderRadius: 20,
          marginBottom: 24,
          overflow: "hidden",
          background: "#112240",
          border: `1px solid ${open ? "rgba(249,115,22,0.2)" : "rgba(16,185,129,0.2)"}`,
        }}
      >
        {/* Card header */}
        <div
          style={{
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: open
              ? "rgba(249,115,22,0.04)"
              : "rgba(16,185,129,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: open
                  ? "rgba(249,115,22,0.12)"
                  : "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: open ? "none" : "0 0 16px rgba(16,185,129,0.25)",
              }}
            >
              <RiSafeLine size={20} color={open ? ACCENT : "white"} />
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>
                Today&apos;s Cash Box
              </div>
              <div
                style={{
                  color: "rgba(226,232,240,0.4)",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {fmtDisplayDate(record.date)}
                {record.adminName && <span> · {record.adminName}</span>}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <StatusBadge open={open} />
            <button
              onClick={onOpenEdit}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 9,
                cursor: "pointer",
                fontFamily: "inherit",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(226,232,240,0.6)",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <RiEditLine size={13} />
              Edit
            </button>
          </div>
        </div>

        {/* Balances */}
        <div style={{ padding: "20px 24px" }}>
          <Grid
            templateColumns={net != null ? "repeat(3,1fr)" : "repeat(2,1fr)"}
            gap={4}
          >
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(226,232,240,0.35)",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  marginBottom: 8,
                }}
              >
                Opening Balance
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: ACCENT }}>
                {fmt(record.openingBalance)}
              </div>
            </div>

            <div
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                background: open
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(16,185,129,0.05)",
                border: `1px solid ${open ? "rgba(255,255,255,0.04)" : "rgba(16,185,129,0.12)"}`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(226,232,240,0.35)",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  marginBottom: 8,
                }}
              >
                Closing Balance
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: open ? "rgba(226,232,240,0.2)" : "#10b981",
                }}
              >
                {open ? "—" : fmt(record.closingBalance)}
              </div>
            </div>

            {net != null && (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  background:
                    net >= 0 ? "rgba(16,185,129,0.05)" : "rgba(239,68,68,0.05)",
                  border: `1px solid ${net >= 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)"}`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(226,232,240,0.35)",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  {net >= 0 ? (
                    <RiArrowUpLine size={11} color="#10b981" />
                  ) : (
                    <RiArrowDownLine size={11} color="#ef4444" />
                  )}
                  Net Change
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: net >= 0 ? "#10b981" : "#ef4444",
                  }}
                >
                  {net >= 0 ? "+" : ""}
                  {fmt(net)}
                </div>
              </div>
            )}
          </Grid>
        </div>
      </div>
    </motion.div>
  );
}

// ── History Row ───────────────────────────────────────────────────────────────

function HistoryRow({ record, index }) {
  const open = isOpen(record);
  const net =
    record.closingBalance != null
      ? Number(record.closingBalance) - Number(record.openingBalance)
      : null;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
    >
      <td style={{ padding: "13px 18px" }}>
        <div style={{ color: "white", fontWeight: 600, fontSize: 13 }}>
          {fmtDisplayDate(record.date)}
        </div>
        {record.adminName && (
          <div
            style={{
              fontSize: 11,
              color: "rgba(226,232,240,0.35)",
              marginTop: 2,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <RiUserLine size={10} />
            {record.adminName}
          </div>
        )}
      </td>
      <td style={{ padding: "13px 18px", textAlign: "right" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>
          {fmt(record.openingBalance)}
        </span>
      </td>
      <td style={{ padding: "13px 18px", textAlign: "right" }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: open ? "rgba(226,232,240,0.2)" : "#10b981",
          }}
        >
          {open ? "—" : fmt(record.closingBalance)}
        </span>
      </td>
      <td style={{ padding: "13px 18px", textAlign: "right" }}>
        {net != null ? (
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: net >= 0 ? "#10b981" : "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 3,
            }}
          >
            {net >= 0 ? (
              <RiArrowUpLine size={12} />
            ) : (
              <RiArrowDownLine size={12} />
            )}
            {net >= 0 ? "+" : ""}
            {fmt(net)}
          </span>
        ) : (
          <span style={{ color: "rgba(226,232,240,0.2)", fontSize: 13 }}>
            —
          </span>
        )}
      </td>
      <td style={{ padding: "13px 18px", textAlign: "center" }}>
        <StatusBadge open={open} />
      </td>
    </motion.tr>
  );
}

// ── Create / Edit Modal ───────────────────────────────────────────────────────

function CashBoxModal({ mode, initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    date: initial?.date ?? today(),
    openingBalance: initial?.openingBalance ?? "",
    closingBalance: initial?.closingBalance ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.date || form.openingBalance === "") {
      setError("Date and opening balance are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        date: form.date,
        openingBalance: Number(form.openingBalance),
        ...(form.closingBalance !== "" && {
          closingBalance: Number(form.closingBalance),
        }),
      };
      let saved;
      if (mode === "edit") {
        saved = await apiFetch(`/api/cashbox/${initial.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        saved = await apiFetch("/api/cashbox", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      toaster.create({
        title: mode === "edit" ? "Cash box updated" : "Cash box created",
        type: "success",
      });
      onSaved(saved);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 10,
    fontSize: 13,
    background: "rgba(255,255,255,0.05)",
    border: `1px solid rgba(249,115,22,0.2)`,
    color: "#e2e8f0",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };
  const labelStyle = {
    fontSize: 12,
    color: "rgba(226,232,240,0.5)",
    marginBottom: 6,
    display: "block",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "#0d1f35",
          borderRadius: 20,
          width: "100%",
          maxWidth: 420,
          border: `1px solid rgba(249,115,22,0.15)`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}
      >
        {/* Modal header */}
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `rgba(249,115,22,0.12)`,
              }}
            >
              <RiSafeLine size={18} color={ACCENT} />
            </div>
            <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>
              {mode === "edit" ? "Edit Cash Box" : "Open Cash Box"}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(226,232,240,0.5)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RiCloseLine size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 22px" }}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={e => set("date", e.target.value)}
              style={{ ...inputStyle, colorScheme: "dark" }}
              required
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Opening Balance (₹) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.openingBalance}
              onChange={e => set("openingBalance", e.target.value)}
              placeholder="0.00"
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Closing Balance (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.closingBalance}
              onChange={e => set("closingBalance", e.target.value)}
              placeholder="Leave blank if day is still open"
              style={inputStyle}
            />
            <div
              style={{
                fontSize: 11,
                color: "rgba(226,232,240,0.3)",
                marginTop: 5,
              }}
            >
              Leave blank to keep the day open
            </div>
          </div>

          {error && (
            <div
              style={{
                marginBottom: 14,
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 12,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#fca5a5",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "11px",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "inherit",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(226,232,240,0.55)",
                fontSize: 13,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 2,
                padding: "11px",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "inherit",
                background: `linear-gradient(135deg, ${ACCENT}, #ea580c)`,
                border: "none",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                boxShadow: `0 4px 16px rgba(249,115,22,0.25)`,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <Spinner size="xs" />
              ) : (
                <>
                  <RiCheckLine size={15} />
                  {mode === "edit" ? "Save Changes" : "Create Record"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CashBox() {
  const [todayRecord, setTodayRecord] = useState(null);
  const [todayLoading, setTodayLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [startDate, setStartDate] = useState(daysAgo(29));
  const [endDate, setEndDate] = useState(today());
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'

  const fetchToday = useCallback(async () => {
    setTodayLoading(true);
    try {
      const data = await apiFetch("/api/cashbox/today");
      setTodayRecord(data);
    } catch {
      setTodayRecord(null);
    } finally {
      setTodayLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (start, end) => {
    setHistoryLoading(true);
    try {
      const data = await apiFetch(`/api/cashbox?start=${start}&end=${end}`);
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);
  useEffect(() => {
    fetchHistory(startDate, endDate);
  }, [fetchHistory, startDate, endDate]);

  const handleSaved = saved => {
    setModal(null);
    if (saved.date === today()) {
      setTodayRecord(saved);
    }
    fetchHistory(startDate, endDate);
    toaster.create({ title: "Cash box saved", type: "success" });
  };

  const thStyle = (align = "left") => ({
    padding: "10px 18px",
    fontSize: 10,
    fontWeight: 700,
    color: "rgba(226,232,240,0.3)",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    textAlign: align,
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `rgba(249,115,22,0.1)`,
                border: `1px solid rgba(249,115,22,0.2)`,
              }}
            >
              <RiSafeLine size={22} color={ACCENT} />
            </div>
            <div>
              <Text
                fontSize="xl"
                fontWeight="800"
                color="white"
                letterSpacing="-0.3px"
              >
                Cash Box
              </Text>
              <Text fontSize="sm" style={{ color: "rgba(226,232,240,0.4)" }}>
                Daily opening & closing balance
              </Text>
            </div>
          </Flex>

          <button
            onClick={() => setModal("create")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 18px",
              borderRadius: 10,
              cursor: "pointer",
              fontFamily: "inherit",
              background: `linear-gradient(135deg, ${ACCENT}, #ea580c)`,
              border: "none",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: `0 4px 14px rgba(249,115,22,0.25)`,
            }}
          >
            <RiAddLine size={16} />
            New Record
          </button>
        </Flex>
      </motion.div>

      {/* Today's card */}
      {todayLoading ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div
            style={{
              padding: "28px",
              borderRadius: 20,
              marginBottom: 24,
              background: "#112240",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Spinner style={{ color: `rgba(249,115,22,0.5)` }} />
            <span style={{ color: "rgba(226,232,240,0.35)", fontSize: 13 }}>
              Loading today&apos;s record…
            </span>
          </div>
        </motion.div>
      ) : (
        <TodayCard
          record={todayRecord}
          onOpenCreate={() => setModal("create")}
          onOpenEdit={() => setModal("edit")}
        />
      )}

      {/* History section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {/* Date range filter */}
        <Flex align="center" gap={3} mb={4} flexWrap="wrap">
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(226,232,240,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.7px",
              marginRight: 4,
            }}
          >
            History
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <RiCalendarLine
                size={13}
                color={`rgba(249,115,22,0.45)`}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="date"
                value={startDate}
                max={endDate}
                onChange={e => e.target.value && setStartDate(e.target.value)}
                style={{
                  padding: "7px 12px 7px 30px",
                  borderRadius: 9,
                  fontSize: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid rgba(249,115,22,0.18)`,
                  color: "#e2e8f0",
                  outline: "none",
                  fontFamily: "inherit",
                  colorScheme: "dark",
                }}
              />
            </div>
            <span style={{ color: "rgba(226,232,240,0.3)", fontSize: 12 }}>
              to
            </span>
            <div style={{ position: "relative" }}>
              <RiCalendarLine
                size={13}
                color={`rgba(249,115,22,0.45)`}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="date"
                value={endDate}
                min={startDate}
                max={today()}
                onChange={e => e.target.value && setEndDate(e.target.value)}
                style={{
                  padding: "7px 12px 7px 30px",
                  borderRadius: 9,
                  fontSize: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid rgba(249,115,22,0.18)`,
                  color: "#e2e8f0",
                  outline: "none",
                  fontFamily: "inherit",
                  colorScheme: "dark",
                }}
              />
            </div>
          </div>

          <button
            onClick={() => fetchHistory(startDate, endDate)}
            disabled={historyLoading}
            style={{
              padding: "7px 13px",
              borderRadius: 9,
              cursor: "pointer",
              fontFamily: "inherit",
              background: `rgba(249,115,22,0.08)`,
              border: `1px solid rgba(249,115,22,0.2)`,
              color: ACCENT,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 5,
              opacity: historyLoading ? 0.5 : 1,
            }}
          >
            <RiRefreshLine size={13} />
            Refresh
          </button>

          {!historyLoading && (
            <span
              style={{
                fontSize: 12,
                color: "rgba(226,232,240,0.3)",
                marginLeft: 4,
              }}
            >
              {history.length} record{history.length !== 1 ? "s" : ""}
            </span>
          )}
        </Flex>

        {/* History table */}
        <Box
          borderRadius="20px"
          style={{
            background: "#112240",
            border: "1px solid rgba(255,255,255,0.07)",
            overflowX: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <th style={thStyle("left")}>Date / Admin</th>
                <th style={thStyle("right")}>Opening</th>
                <th style={thStyle("right")}>Closing</th>
                <th style={thStyle("right")}>Net Change</th>
                <th style={thStyle("center")}>Status</th>
              </tr>
            </thead>
            <tbody>
              {historyLoading ? (
                <tr>
                  <td colSpan={5}>
                    <Flex justify="center" align="center" py={12}>
                      <Spinner style={{ color: `rgba(249,115,22,0.5)` }} />
                    </Flex>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div style={{ textAlign: "center", padding: "48px 24px" }}>
                      <RiSafeLine
                        size={40}
                        color={`rgba(249,115,22,0.1)`}
                        style={{ margin: "0 auto 12px" }}
                      />
                      <div
                        style={{ color: "rgba(226,232,240,0.3)", fontSize: 14 }}
                      >
                        No records in this date range
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((record, i) => (
                  <HistoryRow key={record.id} record={record} index={i} />
                ))
              )}
            </tbody>
          </table>
        </Box>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <CashBoxModal
            key={modal}
            mode={modal}
            initial={modal === "edit" ? todayRecord : null}
            onClose={() => setModal(null)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </Box>
  );
}
