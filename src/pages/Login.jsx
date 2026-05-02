import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { toaster } from "@/components/ui/toaster";
import { useAuth } from "../hooks/useAuth";
import { login } from "../services/authService";
import {
  RiBankLine,
  RiEyeLine,
  RiEyeOffLine,
  RiShieldLine,
} from "react-icons/ri";

const schema = z.object({
  mobileOrEmail: z.string().min(1, "Mobile or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const BLOBS = [
  {
    style: {
      top: "-160px",
      left: "-160px",
      width: "520px",
      height: "520px",
      background:
        "radial-gradient(circle, rgba(212,160,23,0.2) 0%, transparent 68%)",
    },
    animate: {
      x: [0, 70, -40, 0],
      y: [0, -80, 50, 0],
      scale: [1, 1.25, 0.85, 1],
    },
    duration: 14,
  },
  {
    style: {
      bottom: "-120px",
      right: "-120px",
      width: "450px",
      height: "450px",
      background:
        "radial-gradient(circle, rgba(30,80,140,0.35) 0%, transparent 68%)",
    },
    animate: {
      x: [0, -55, 30, 0],
      y: [0, 65, -45, 0],
      scale: [1, 0.8, 1.2, 1],
    },
    duration: 17,
    delay: 2,
  },
  {
    style: {
      top: "40%",
      right: "-180px",
      width: "380px",
      height: "380px",
      background:
        "radial-gradient(circle, rgba(212,160,23,0.12) 0%, transparent 68%)",
    },
    animate: { x: [0, -75, 20, 0], y: [0, -55, 40, 0] },
    duration: 20,
    delay: 5,
  },
];

function PasswordField({ reg, error }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        {...reg}
        placeholder="Enter your password"
        className={`glass-input${error ? " glass-input-error" : ""}`}
        style={{ paddingRight: "52px" }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{
          position: "absolute",
          right: "14px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "rgba(212,160,23,0.5)",
          display: "flex",
          alignItems: "center",
          padding: 0,
        }}
      >
        {show ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
      </button>
    </div>
  );
}

export default function Login() {
  const [engineInit, setEngineInit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login: loginUser, user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (user) navigate("/home");
  }, [user, navigate]);

  useEffect(() => {
    initParticlesEngine(async engine => {
      await loadSlim(engine);
    }).then(() => setEngineInit(true));
  }, []);

  const particlesLoaded = useCallback(async () => {}, []);

  const particlesOptions = useMemo(
    () => ({
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      interactivity: {
        events: { onHover: { enable: true, mode: "grab" } },
        modes: { grab: { distance: 140, links: { opacity: 0.4 } } },
      },
      particles: {
        color: { value: "#d4a017" },
        links: {
          color: "#d4a017",
          distance: 140,
          enable: true,
          opacity: 0.12,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.7,
          direction: "none",
          outModes: { default: "bounce" },
          random: true,
        },
        number: { value: 55, density: { enable: true } },
        opacity: {
          value: { min: 0.2, max: 0.6 },
          animation: { enable: true, speed: 0.4 },
        },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 2.5 } },
      },
      detectRetina: true,
    }),
    []
  );

  const onSubmit = async data => {
    setSubmitting(true);
    try {
      const res = await login(data);
      if (res.success) {
        loginUser(res.user);
        navigate("/home");
      } else {
        toaster.create({
          title: "Login Failed",
          description: res.message,
          type: "error",
        });
      }
    } catch {
      toaster.create({
        title: "Error",
        description: "Network error. Please try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (user) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #060e1a 0%, #0d1f35 50%, #091628 100%)",
      }}
    >
      {/* Particles */}
      {engineInit && (
        <Particles
          id="login-particles"
          particlesLoaded={particlesLoaded}
          options={particlesOptions}
          style={{ position: "absolute", inset: 0, zIndex: 0 }}
        />
      )}

      {/* Animated glow blobs */}
      {BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            borderRadius: "50%",
            filter: "blur(70px)",
            pointerEvents: "none",
            zIndex: 1,
            ...blob.style,
          }}
          animate={blob.animate}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: blob.delay ?? 0,
          }}
        />
      ))}

      {/* Centered login card */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 36 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", maxWidth: "440px" }}
        >
          <div
            style={{
              background: "rgba(10, 22, 40, 0.82)",
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
              border: "1px solid rgba(212, 160, 23, 0.22)",
              borderRadius: "28px",
              padding: "52px 44px 44px",
              boxShadow:
                "0 0 80px rgba(212,160,23,0.08), 0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "28px",
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.07, 1], rotate: [0, 2, -2, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, #d4a017, #92700f)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 40px rgba(212,160,23,0.5)",
                  }}
                >
                  <RiBankLine size={34} color="white" />
                </div>
              </motion.div>
            </div>

            {/* Title */}
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  backgroundImage:
                    "linear-gradient(135deg, #f0c040 0%, #d4a017 55%, #92700f 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "6px",
                }}
              >
                Loan Collection
              </div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "5px",
                  textTransform: "uppercase",
                  color: "#c8a84b",
                }}
              >
                Management System
              </div>
              <div
                style={{
                  marginTop: "16px",
                  borderTop: "1px solid rgba(212,160,23,0.15)",
                }}
              />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {/* Mobile or Email */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      color: "rgba(212,160,23,0.85)",
                    }}
                  >
                    Mobile or Email
                  </label>
                  <input
                    {...register("mobileOrEmail")}
                    placeholder="Enter mobile or email"
                    className={`glass-input${errors.mobileOrEmail ? " glass-input-error" : ""}`}
                  />
                  {errors.mobileOrEmail && (
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: "12px",
                        color: "#f87171",
                      }}
                    >
                      {errors.mobileOrEmail.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      color: "rgba(212,160,23,0.85)",
                    }}
                  >
                    Password
                  </label>
                  <PasswordField
                    reg={register("password")}
                    error={errors.password}
                  />
                  {errors.password && (
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: "12px",
                        color: "#f87171",
                      }}
                    >
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  className="glass-btn"
                  whileHover={!submitting ? { scale: 1.02 } : {}}
                  whileTap={!submitting ? { scale: 0.98 } : {}}
                  disabled={submitting}
                  style={{ marginTop: "4px" }}
                >
                  {submitting ? "Signing in…" : "Sign In"}
                </motion.button>
              </div>
            </form>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                marginTop: "28px",
                color: "rgba(212,160,23,0.45)",
                fontSize: "11px",
              }}
            >
              <RiShieldLine size={12} />
              Secure Admin Access · Super Admin &amp; Admin only
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
