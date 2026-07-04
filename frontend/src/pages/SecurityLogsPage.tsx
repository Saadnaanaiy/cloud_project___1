import React, { useEffect, useRef, useState } from "react"
import { Shield, Clock, Monitor, Globe, RefreshCcw, Plus, Trash2, Edit, FileText, Ban, CheckCircle, LogIn, Radio } from "lucide-react"
import { io, Socket } from "socket.io-client"
import api from "../api/axios"
import { useLang } from "../context/LanguageContext"
import { format } from "date-fns"
import { motion } from "motion/react"

interface AuditLog {
  id: number
  action: string
  entity: string
  details: string
  ipAddress: string
  userAgent: string
  timestamp: string
  user: { name: string; email: string; role: string }
}

const actionConfig: Record<string, { icon: React.FC<{ size?: number; className?: string; color?: string }>; color: string; label: string }> = {
  LOGIN: { icon: LogIn, color: "#3b82f6", label: "Login" },
  CREATE: { icon: Plus, color: "#10b981", label: "Create" },
  UPDATE: { icon: Edit, color: "#f59e0b", label: "Update" },
  DELETE: { icon: Trash2, color: "#ef4444", label: "Delete" },
  EXPORT: { icon: FileText, color: "#8b5cf6", label: "Export" },
  BLOCK: { icon: Ban, color: "#ef4444", label: "Block" },
  UNBLOCK: { icon: CheckCircle, color: "#10b981", label: "Unblock" },
}

const defaultAction = { icon: Shield, color: "#6b7280", label: "Action" }

const entityColors: Record<string, string> = {
  ANNOUNCEMENT: "#3b82f6",
  EMPLOYEE: "#10b981",
  DEPARTMENT: "#8b5cf6",
  REPORT: "#f59e0b",
}

const SecurityLogsPage: React.FC = () => {
  const { t } = useLang()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [liveConnected, setLiveConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const { data } = await api.get("/audit/logs?limit=100")
      setLogs(data)
    } catch (error) {
      console.error("Failed to fetch security logs", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const wsOrigin = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
      : globalThis.location.origin;
    const socket = io(wsOrigin, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ["websocket"],
      path: "/ws/audit/",
    })

    socket.on("connect", () => setLiveConnected(true))
    socket.on("disconnect", () => setLiveConnected(false))
    socket.on("connect_error", () => setLiveConnected(false))

    socket.on("newAuditLog", (log: AuditLog) => {
      setLogs((prev) => [log, ...prev])
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  const renderContent = () => {
    if (loading) {
      return Array.from({ length: 5 }).map(() => (
        <div key={crypto.randomUUID()} className="animate-pulse" style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--bg-surface-hover)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}><div style={{ height: "14px", background: "var(--bg-surface-hover)", borderRadius: "4px", width: "60%", marginBottom: "8px" }} /><div style={{ height: "12px", background: "var(--bg-surface-hover)", borderRadius: "4px", width: "40%" }} /></div>
        </div>
      ))
    }

    if (logs.length === 0) {
      return (
        <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--text-muted)" }}>
          <Shield size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
          <p>No activity logs yet</p>
        </div>
      )
    }

    return logs.map((log) => {
      const cfg = actionConfig[log.action] || defaultAction
      const ActionIcon = cfg.icon
      const entityColor = entityColors[log.entity] || "var(--text-muted)"

      return (
        <motion.div
          key={log.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: "14px 24px", borderBottom: "1px solid var(--border)", display: "flex", gap: "14px", alignItems: "flex-start", transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg-surface-hover)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `${cfg.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ActionIcon size={16} color={cfg.color} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>
                {log.user?.name || "Deleted User"}
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {log.user?.email}
              </span>
              {log.entity && (
                <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: 600, background: `${entityColor}15`, color: entityColor }}>
                  {log.entity}
                </span>
              )}
            </div>

            <div style={{ marginTop: "4px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              <span style={{ fontWeight: 500, color: cfg.color }}>{cfg.label}</span>
              {log.details && <span> — {log.details}</span>}
            </div>

            <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "12px", fontSize: "11px", color: "var(--text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={12} />
                {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
              </span>
              {log.ipAddress && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Globe size={12} />
                  <code style={{ fontFamily: "monospace", background: "var(--bg-surface-hover)", padding: "1px 6px", borderRadius: "3px" }}>{log.ipAddress}</code>
                </span>
              )}
              {log.userAgent && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px", maxWidth: "200px" }}>
                  <Monitor size={12} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.userAgent}</span>
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )
    })
  }

  return (
    <div className="page-inner animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("securityLogs")}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Live activity feed — every action by all users is recorded
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: liveConnected ? "var(--teal)" : "var(--text-muted)" }}>
            <Radio size={14} />
            <span style={{ fontWeight: 600 }}>{liveConnected ? "LIVE" : "Disconnected"}</span>
            <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: liveConnected ? "var(--teal)" : "var(--text-muted)", animation: liveConnected ? "pulse 1.5s ease-in-out infinite" : "none" }} />
          </div>
          <button onClick={fetchLogs} disabled={loading} className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        {renderContent()}
      </div>
    </div>
  )
}

export default SecurityLogsPage
