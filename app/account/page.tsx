"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Mail,
  User,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

export default function AccountPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (mode === "login") {
      alert("Login system will be connected next.");
    } else {
      alert("Account creation system will be connected next.");
    }
  };

  return (
    <main className="account-page">
      {/* Header */}
      <header className="account-header">
        <Link href="/" className="account-brand">
          <span className="account-brand-icon">S</span>
          <span>SmartBuy</span>
        </Link>

        <Link href="/" className="back-home">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </header>

      {/* Main */}
      <section className="account-main">
        <div className="account-card">
          {/* Icon */}
          <div className="account-icon">
            <User size={25} />
          </div>

          <span className="account-label">
            SMARTBUY ACCOUNT
          </span>

          <h1>
            {mode === "login"
              ? "Welcome back."
              : "Create your account."}
          </h1>

          <p className="account-description">
            {mode === "login"
              ? "Sign in to manage your SmartBuy orders, wishlist and profile."
              : "Join SmartBuy and get a personalized shopping experience."}
          </p>

          {/* Login / Signup Switch */}
          <div className="account-switch">
            <button
              type="button"
              className={mode === "login" ? "selected" : ""}
              onClick={() => setMode("login")}
            >
              Login
            </button>

            <button
              type="button"
              className={mode === "signup" ? "selected" : ""}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form
            className="account-form"
            onSubmit={handleSubmit}
          >
            {mode === "signup" && (
              <div className="form-group">
                <label>Full Name</label>

                <div className="input-wrapper">
                  <User size={17} />

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>

              <div className="input-wrapper">
                <Mail size={17} />

                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>

              <div className="input-wrapper">
                <Lock size={17} />

                <input
                  type="password"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {mode === "login" && (
              <div className="forgot-row">
                <button type="button">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="account-submit"
            >
              {mode === "login"
                ? "Login to SmartBuy"
                : "Create SmartBuy Account"}

              <ArrowRight size={17} />
            </button>
          </form>

          {/* Security */}
          <div className="account-security">
            <ShieldCheck size={18} />

            <div>
              <strong>Secure Account</strong>
              <span>
                Your information is protected with
                industry-standard security.
              </span>
            </div>
          </div>

          <p className="account-terms">
            By continuing, you agree to SmartBuy's
            Terms of Service and Privacy Policy.
          </p>
        </div>
      </section>

      {/* Styles */}
      <style jsx>{`
        .account-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 50% -10%,
              rgba(111, 76, 255, 0.25),
              transparent 35%
            ),
            radial-gradient(
              circle at 10% 80%,
              rgba(90, 55, 220, 0.12),
              transparent 30%
            ),
            #07070d;
          color: #ffffff;
          padding: 28px 22px;
          box-sizing: border-box;
        }

        .account-header {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .account-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          color: #ffffff;
          text-decoration: none;
          font-size: 22px;
          font-weight: 800;
        }

        .account-brand-icon {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          background: linear-gradient(
            135deg,
            #6848ff,
            #9175ff
          );
          box-shadow:
            0 10px 35px rgba(104, 72, 255, 0.35);
          font-size: 20px;
        }

        .back-home {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #9999a8;
          text-decoration: none;
          font-size: 14px;
          transition: 0.2s ease;
        }

        .back-home:hover {
          color: #ffffff;
        }

        .account-main {
          min-height: calc(100vh - 100px);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 55px 0;
          box-sizing: border-box;
        }

        .account-card {
          width: 100%;
          max-width: 460px;
          padding: 36px;
          box-sizing: border-box;
          border-radius: 28px;
          background: rgba(20, 20, 31, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.09);
          box-shadow:
            0 35px 100px rgba(0, 0, 0, 0.5),
            0 0 60px rgba(102, 71, 255, 0.08);
          backdrop-filter: blur(22px);
        }

        .account-icon {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          background: linear-gradient(
            135deg,
            #6848ff,
            #9175ff
          );
          box-shadow:
            0 14px 35px rgba(104, 72, 255, 0.35);
          margin-bottom: 22px;
        }

        .account-label {
          color: #907dff;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .account-card h1 {
          margin: 10px 0 9px;
          font-size: 36px;
          line-height: 1.1;
          letter-spacing: -1px;
        }

        .account-description {
          margin: 0;
          color: #92929f;
          font-size: 14px;
          line-height: 1.6;
        }

        .account-switch {
          margin-top: 28px;
          padding: 5px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px;
          border-radius: 14px;
          background: #101018;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .account-switch button {
          border: 0;
          border-radius: 10px;
          padding: 11px;
          background: transparent;
          color: #858592;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .account-switch button.selected {
          color: #ffffff;
          background: linear-gradient(
            135deg,
            #6848ff,
            #8062ff
          );
          box-shadow:
            0 8px 20px rgba(104, 72, 255, 0.22);
        }

        .account-form {
          margin-top: 24px;
          display: grid;
          gap: 16px;
        }

        .form-group {
          display: grid;
          gap: 7px;
        }

        .form-group label {
          color: #aaaaaf;
          font-size: 12px;
          font-weight: 600;
        }

        .input-wrapper {
          height: 50px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 15px;
          box-sizing: border-box;
          border-radius: 13px;
          background: #11111b;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #777783;
          transition: 0.2s ease;
        }

        .input-wrapper:focus-within {
          border-color: rgba(125, 96, 255, 0.75);
          box-shadow:
            0 0 0 3px rgba(109, 74, 255, 0.1);
        }

        .input-wrapper input {
          width: 100%;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #ffffff;
          font-size: 13px;
        }

        .input-wrapper input::placeholder {
          color: #666672;
        }

        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -4px;
        }

        .forgot-row button {
          border: 0;
          background: transparent;
          color: #8e78ff;
          font-size: 12px;
          cursor: pointer;
        }

        .account-submit {
          width: 100%;
          height: 52px;
          margin-top: 4px;
          border: 0;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          background: linear-gradient(
            135deg,
            #6848ff,
            #8b6cff
          );
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow:
            0 13px 30px rgba(104, 72, 255, 0.25);
          transition: 0.2s ease;
        }

        .account-submit:hover {
          transform: translateY(-1px);
          box-shadow:
            0 16px 35px rgba(104, 72, 255, 0.35);
        }

        .account-security {
          margin-top: 22px;
          padding: 14px;
          display: flex;
          align-items: flex-start;
          gap: 11px;
          border-radius: 14px;
          background: rgba(109, 74, 255, 0.07);
          border: 1px solid rgba(109, 74, 255, 0.14);
          color: #8e78ff;
        }

        .account-security div {
          display: grid;
          gap: 3px;
        }

        .account-security strong {
          color: #ffffff;
          font-size: 12px;
        }

        .account-security span {
          color: #777784;
          font-size: 10px;
          line-height: 1.5;
        }

        .account-terms {
          margin: 20px 0 0;
          text-align: center;
          color: #666671;
          font-size: 10px;
          line-height: 1.6;
        }

        @media (max-width: 600px) {
          .account-page {
            padding: 20px 15px;
          }

          .account-header {
            align-items: center;
          }

          .account-brand {
            font-size: 19px;
          }

          .account-brand-icon {
            width: 38px;
            height: 38px;
            border-radius: 11px;
          }

          .back-home {
            font-size: 12px;
          }

          .account-card {
            padding: 27px 21px;
            border-radius: 22px;
          }

          .account-card h1 {
            font-size: 29px;
          }

          .account-main {
            padding: 35px 0;
          }
        }
      `}</style>
    </main>
  );
}