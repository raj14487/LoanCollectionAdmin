import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import {
  RiUserLine,
  RiSearchLine,
  RiCheckLine,
  RiCloseLine,
  RiPhoneLine,
  RiMapPinLine,
  RiShieldUserLine,
  RiCalendarLine,
  RiArrowRightLine,
  RiDeleteBinLine,
  RiIdCardLine,
  RiMailLine,
  RiUserStarLine,
} from "react-icons/ri";
import { apiFetch } from "../config/api";
import { useAuth } from "../hooks/useAuth";
import { toaster } from "../components/ui/toaster";

// Derive a display status from the cashier record
function deriveStatus(cashier) {
  if (!cashier.approvedAt) return "PENDING";
  return cashier.userStatus === "INACTIVE" ? "INACTIVE" : "APPROVED";
}

const STATUS = {
  PENDING: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
    label: "Pending",
  },
  APPROVED: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.25)",
    label: "Approved",
  },
  INACTIVE: {
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.1)",
    border: "rgba(148,163,184,0.2)",
    label: "Inactive",
  },
};

const FILTERS = ["ALL", "PENDING", "APPROVED", "INACTIVE"];

function StatusBadge({ status }) {
  const s = STATUS[status] ?? {};
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
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.color,
          display: "inline-block",
        }}
      />
      {s.label}
    </span>
  );
}

function CashierRow({ cashier, selected, onClick }) {
  const status = deriveStatus(cashier);
  const initials =
    cashier.userName
      ?.split(" ")
      .map(n => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";
  const isSelected = selected?.id === cashier.id;
  const date = cashier.createdAt
    ? new Date(cashier.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div
      onClick={() => onClick(cashier)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        cursor: "pointer",
        borderRadius: 12,
        background: isSelected ? "rgba(59,130,246,0.08)" : "transparent",
        border: `1px solid ${isSelected ? "rgba(59,130,246,0.3)" : "transparent"}`,
        transition: "all 0.15s",
        marginBottom: 2,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(59,130,246,0.1)",
          border: "1px solid rgba(59,130,246,0.2)",
          fontSize: 13,
          fontWeight: 700,
          color: "#3b82f6",
        }}
      >
        {initials}
      </div>

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
          <span style={{ color: "white", fontWeight: 600, fontSize: 14 }}>
            {cashier.userName ?? "—"}
          </span>
          <StatusBadge status={status} />
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: "rgba(226,232,240,0.45)", fontSize: 12 }}>
            {cashier.userMobile ?? "—"}
          </span>
          {cashier.userEmail && (
            <span
              style={{
                color: "rgba(226,232,240,0.3)",
                fontSize: 12,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              · {cashier.userEmail}
            </span>
          )}
        </div>
      </div>

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
        <span style={{ color: "rgba(226,232,240,0.3)", fontSize: 11 }}>
          {date}
        </span>
        <RiArrowRightLine size={13} color="rgba(59,130,246,0.4)" />
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, accent = "#d4a017" }) {
  if (!value) return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        marginBottom: 12,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          flexShrink: 0,
          marginTop: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${accent}11`,
        }}
      >
        <Icon size={14} color={accent} />
      </div>
      <div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(226,232,240,0.35)",
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "rgba(226,232,240,0.85)",
            fontWeight: 500,
            lineHeight: 1.5,
            wordBreak: "break-word",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: "rgba(59,130,246,0.6)",
        letterSpacing: "1px",
        textTransform: "uppercase",
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: "rgba(255,255,255,0.05)",
        margin: "16px 0",
      }}
    />
  );
}

function DetailPanel({
  cashier,
  onClose,
  onApprove,
  onDelete,
  actionLoading,
  canApprove,
}) {
  const status = deriveStatus(cashier);
  const isPending = status === "PENDING";
  const initials =
    cashier.userName
      ?.split(" ")
      .map(n => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        top: 72,
        right: 0,
        bottom: 0,
        width: 420,
        background: "#0d1f35",
        borderLeft: "1px solid rgba(59,130,246,0.12)",
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.45)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 22px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#0d1f35",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              fontSize: 16,
              fontWeight: 700,
              color: "white",
              boxShadow: "0 0 20px rgba(59,130,246,0.3)",
            }}
          >
            {initials}
          </div>
          <div>
            <div
              style={{
                color: "white",
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 5,
              }}
            >
              {cashier.userName}
            </div>
            <StatusBadge status={status} />
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            flexShrink: 0,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(226,232,240,0.5)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RiCloseLine size={16} />
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
        <SectionLabel>User Info</SectionLabel>
        <InfoRow
          icon={RiPhoneLine}
          label="Mobile"
          value={cashier.userMobile}
          accent="#3b82f6"
        />
        <InfoRow
          icon={RiMailLine}
          label="Email"
          value={cashier.userEmail}
          accent="#3b82f6"
        />
        <InfoRow
          icon={RiMapPinLine}
          label="Address"
          value={cashier.address}
          accent="#3b82f6"
        />
        <InfoRow
          icon={RiIdCardLine}
          label="Aadhaar Number"
          value={cashier.aadhaarNumber}
          accent="#3b82f6"
        />

        {cashier.guarantorName && (
          <>
            <Divider />
            <SectionLabel>Guarantor Info</SectionLabel>
            <InfoRow
              icon={RiShieldUserLine}
              label="Name"
              value={cashier.guarantorName}
              accent="#d4a017"
            />
            <InfoRow
              icon={RiPhoneLine}
              label="Mobile"
              value={cashier.guarantorMobile}
              accent="#d4a017"
            />
            <InfoRow
              icon={RiMapPinLine}
              label="Address"
              value={cashier.guarantorAddress}
              accent="#d4a017"
            />
            <InfoRow
              icon={RiIdCardLine}
              label="Aadhaar Number"
              value={cashier.guarantorAadhaarNumber}
              accent="#d4a017"
            />
          </>
        )}

        <Divider />
        <SectionLabel>Record Info</SectionLabel>
        <InfoRow
          icon={RiCalendarLine}
          label="Joined"
          value={
            cashier.createdAt
              ? new Date(cashier.createdAt).toLocaleString("en-IN")
              : null
          }
        />
        <InfoRow
          icon={RiCalendarLine}
          label="Updated At"
          value={
            cashier.updatedAt
              ? new Date(cashier.updatedAt).toLocaleString("en-IN")
              : null
          }
        />
        {cashier.approvedAt && (
          <InfoRow
            icon={RiUserStarLine}
            label="Approved At"
            value={new Date(cashier.approvedAt).toLocaleString("en-IN")}
            accent="#10b981"
          />
        )}

        {cashier.aadhaarPhoto && (
          <>
            <Divider />
            <SectionLabel>Aadhaar Photo</SectionLabel>
            <img
              src={
                cashier.aadhaarPhoto.startsWith("data:")
                  ? cashier.aadhaarPhoto
                  : `data:image/jpeg;base64,${cashier.aadhaarPhoto}`
              }
              alt="Aadhaar"
              style={{
                width: "100%",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
          </>
        )}
      </div>

      {/* Footer actions */}
      {isPending && canApprove && (
        <div
          style={{
            padding: "14px 22px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => onApprove(cashier.id)}
            disabled={actionLoading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              cursor: "pointer",
              fontFamily: "inherit",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              border: "none",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
              opacity: actionLoading ? 0.7 : 1,
            }}
          >
            {actionLoading ? (
              <Spinner size="xs" />
            ) : (
              <>
                <RiCheckLine size={15} />
                Approve Cashier
              </>
            )}
          </button>
        </div>
      )}

      {isPending && !canApprove && (
        <div
          style={{
            padding: "14px 22px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              fontSize: 12,
              textAlign: "center",
              background: "rgba(245,158,11,0.07)",
              border: "1px solid rgba(245,158,11,0.15)",
              color: "rgba(245,158,11,0.6)",
            }}
          >
            Only Super Admin can approve cashiers
          </div>
        </div>
      )}

      {!isPending && (
        <div
          style={{
            padding: "14px 22px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => onDelete(cashier.id)}
            disabled={actionLoading}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: 10,
              cursor: "pointer",
              fontFamily: "inherit",
              background: "rgba(239,68,68,0.07)",
              border: "1px solid rgba(239,68,68,0.18)",
              color: "#fca5a5",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              opacity: actionLoading ? 0.7 : 1,
            }}
          >
            {actionLoading ? (
              <Spinner size="xs" />
            ) : (
              <>
                <RiDeleteBinLine size={15} />
                Remove Cashier
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function Cashiers() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCashiers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/api/cashiers");
      setCashiers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashiers();
  }, []);

  const changeFilter = f => {
    setActiveFilter(f);
    setSelected(null);
    setSearch("");
  };

  const filtered = cashiers.filter(c => {
    const status = deriveStatus(c);
    const matchesFilter = activeFilter === "ALL" || status === activeFilter;
    const matchesSearch =
      c.userName?.toLowerCase().includes(search.toLowerCase()) ||
      c.userMobile?.includes(search) ||
      c.userEmail?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    ALL: cashiers.length,
    PENDING: cashiers.filter(c => deriveStatus(c) === "PENDING").length,
    APPROVED: cashiers.filter(c => deriveStatus(c) === "APPROVED").length,
    INACTIVE: cashiers.filter(c => deriveStatus(c) === "INACTIVE").length,
  };

  const handleApprove = async id => {
    setActionLoading(true);
    try {
      const updated = await apiFetch(`/api/cashiers/${id}/approve`, {
        method: "PUT",
      });
      setCashiers(prev => prev.map(c => (c.id === id ? updated : c)));
      setSelected(updated);
      toaster.create({ title: "Cashier approved", type: "success" });
    } catch (e) {
      toaster.create({ title: e.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async id => {
    setActionLoading(true);
    try {
      await apiFetch(`/api/cashiers/${id}`, { method: "DELETE" });
      setCashiers(prev => prev.filter(c => c.id !== id));
      setSelected(null);
      toaster.create({ title: "Cashier removed", type: "info" });
    } catch (e) {
      toaster.create({ title: e.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRowClick = cashier => {
    setSelected(prev => (prev?.id === cashier.id ? null : cashier));
  };

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
        <Flex align="center" mb={6} gap={3}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <RiUserLine size={22} color="#3b82f6" />
          </div>
          <div>
            <Text
              fontSize="xl"
              fontWeight="800"
              color="white"
              letterSpacing="-0.3px"
            >
              Cashiers
            </Text>
            <Text fontSize="sm" style={{ color: "rgba(226,232,240,0.4)" }}>
              {loading ? "…" : `${cashiers.length} total`}
            </Text>
          </div>
        </Flex>
      </motion.div>

      {/* Filter row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <Flex
          gap={3}
          mb={5}
          align="center"
          justify="space-between"
          flexWrap="wrap"
        >
          <Flex gap={2} flexWrap="wrap">
            {FILTERS.map(f => {
              const active = activeFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => changeFilter(f)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                    background: active
                      ? "rgba(59,130,246,0.12)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${active ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.08)"}`,
                    color: active ? "#3b82f6" : "rgba(226,232,240,0.5)",
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
                        ? "rgba(59,130,246,0.18)"
                        : "rgba(255,255,255,0.06)",
                      color: active ? "#3b82f6" : "rgba(226,232,240,0.4)",
                    }}
                  >
                    {counts[f]}
                  </span>
                </button>
              );
            })}
          </Flex>

          <div style={{ position: "relative" }}>
            <RiSearchLine
              size={14}
              color="rgba(59,130,246,0.4)"
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, mobile or email…"
              style={{
                padding: "8px 14px 8px 34px",
                borderRadius: 10,
                fontSize: 13,
                width: 240,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(59,130,246,0.18)",
                color: "#e2e8f0",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>
        </Flex>
      </motion.div>

      {/* Error banner */}
      {error && (
        <Box
          mb={4}
          p={3}
          borderRadius="10px"
          fontSize="sm"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#fca5a5",
          }}
        >
          {error}
        </Box>
      )}

      {/* Cashier list */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
      >
        <Box
          borderRadius="20px"
          style={{
            background: "#112240",
            border: "1px solid rgba(255,255,255,0.07)",
            marginRight: selected ? 430 : 0,
            transition: "margin-right 0.3s ease",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              padding: "12px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(226,232,240,0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              Cashier
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(226,232,240,0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              Joined
            </span>
          </div>

          {loading ? (
            <Flex justify="center" align="center" py={16}>
              <Spinner style={{ color: "rgba(59,130,246,0.6)" }} />
            </Flex>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 24px" }}>
              <RiUserLine
                size={44}
                color="rgba(59,130,246,0.12)"
                style={{ margin: "0 auto 14px" }}
              />
              <div style={{ color: "rgba(226,232,240,0.35)", fontSize: 14 }}>
                {search
                  ? "No cashiers match your search"
                  : `No ${activeFilter === "ALL" ? "" : activeFilter.toLowerCase() + " "}cashiers found`}
              </div>
            </div>
          ) : (
            <div style={{ padding: "6px 6px" }}>
              {filtered.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <CashierRow
                    cashier={c}
                    selected={selected}
                    onClick={handleRowClick}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </Box>
      </motion.div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <DetailPanel
            key={selected.id}
            cashier={selected}
            onClose={() => setSelected(null)}
            onApprove={handleApprove}
            onDelete={handleDelete}
            actionLoading={actionLoading}
            canApprove={isSuperAdmin}
          />
        )}
      </AnimatePresence>
    </Box>
  );
}
