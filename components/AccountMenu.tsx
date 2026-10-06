"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LogOut,
  User,
} from "lucide-react";

import { supabase } from "../lib/supabase";

export default function AccountMenu() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setEmail("");
        setName("");
        return;
      }

      setEmail(user.email ?? "");

      setName(
        user.user_metadata?.full_name ??
          user.email?.split("@")[0] ??
          "User"
      );
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const user = session?.user;

        if (!user) {
          setEmail("");
          setName("");
          setOpen(false);
          return;
        }

        setEmail(user.email ?? "");

        setName(
          user.user_metadata?.full_name ??
            user.email?.split("@")[0] ??
            "User"
        );
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setOpen(false);

    window.location.href = "/";
  };

  // Not logged in
  if (!email) {
    return (
      <Link
        href="/account"
        className="avatar"
        aria-label="Login"
        title="Login"
      >
        <User size={17} />
      </Link>
    );
  }

  // Logged in
  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <button
        className="avatar"
        type="button"
        onClick={() =>
          setOpen((value) => !value)
        }
        aria-label="Account"
        title="Account"
      >
        <User size={17} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "48px",
            right: 0,
            width: "250px",
            padding: "15px",
            borderRadius: "18px",
            background: "#171720",
            border:
              "1px solid rgba(255,255,255,.10)",
            boxShadow:
              "0 25px 60px rgba(0,0,0,.45)",
            zIndex: 9999,
          }}
        >
          {/* User information */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "11px",
              paddingBottom: "13px",
              borderBottom:
                "1px solid rgba(255,255,255,.08)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                background:
                  "linear-gradient(135deg,#6848ff,#9275ff)",
                boxShadow:
                  "0 10px 25px rgba(104,72,255,.25)",
              }}
            >
              <User size={18} />
            </div>

            <div
              style={{
                minWidth: 0,
              }}
            >
              <strong
                style={{
                  display: "block",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                {name}
              </strong>

              <span
                style={{
                  display: "block",
                  marginTop: "4px",
                  color: "#8c8c99",
                  fontSize: "10px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {email}
              </span>
            </div>
          </div>

          {/* My account */}
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            style={{
              display: "block",
              marginTop: "12px",
              padding: "11px 10px",
              borderRadius: "11px",
              color: "#e6e6eb",
              textDecoration: "none",
              fontSize: "12px",
              transition: "background .2s ease",
            }}
          >
            My Account
          </Link>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              marginTop: "4px",
              padding: "11px 10px",
              border: 0,
              borderRadius: "11px",
              background:
                "rgba(255,75,62,.08)",
              color: "#ffaaa4",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontSize: "12px",
              textAlign: "left",
            }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}