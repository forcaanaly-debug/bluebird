#!/usr/bin/env node

const DEFAULT_BASE_URL = "http://localhost:3000";
const BASE_URL = (process.env.SMOKE_BASE_URL || process.argv[2] || DEFAULT_BASE_URL).replace(/\/$/, "");
const API_BASE = `${BASE_URL}/api`;

const PHONE = process.env.SMOKE_PHONE || process.argv[3] || "";
const OTP_CODE = process.env.SMOKE_OTP_CODE || process.argv[4] || "";
const PROVIDED_TOKEN = process.env.SMOKE_ADMIN_TOKEN || "";

function maskSecret(value) {
  if (!value) return "<empty>";
  if (value.length <= 12) return `${"*".repeat(Math.max(0, value.length - 2))}${value.slice(-2)}`;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function logPass(name, detail) {
  console.log(`[PASS] ${name}${detail ? ` - ${detail}` : ""}`);
}

function logFail(name, detail) {
  console.error(`[FAIL] ${name}${detail ? ` - ${detail}` : ""}`);
}

async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function requestJson(path, init = {}) {
  const headers = {
    "content-type": "application/json",
    ...(init.headers || {})
  };
  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const body = await parseBody(response);
  return { response, body };
}

(async () => {
  let failures = 0;
  console.log(`Running API smoke checks against ${API_BASE}`);

  try {
    const { response, body } = await requestJson("/health", { method: "GET" });
    if (!response.ok) {
      failures += 1;
      logFail("Health endpoint", `HTTP ${response.status}`);
    } else {
      const status = body && typeof body === "object" ? body.status : undefined;
      const db = body && typeof body === "object" ? body.db : undefined;
      const redis = body && typeof body === "object" ? body.redis : undefined;
      logPass("Health endpoint", `status=${status} db=${db} redis=${redis}`);
    }
  } catch (error) {
    failures += 1;
    logFail("Health endpoint", error instanceof Error ? error.message : String(error));
  }

  let adminToken = PROVIDED_TOKEN;
  if (!adminToken) {
    if (!PHONE || !OTP_CODE) {
      failures += 1;
      logFail(
        "OTP verify/admin token",
        "provide SMOKE_ADMIN_TOKEN or both SMOKE_PHONE and SMOKE_OTP_CODE"
      );
    } else {
      try {
        const otpReq = await requestJson("/auth/otp/request", {
          method: "POST",
          body: JSON.stringify({ phone: PHONE })
        });
        if (!otpReq.response.ok) {
          failures += 1;
          logFail("OTP request", `HTTP ${otpReq.response.status}`);
        } else {
          logPass("OTP request", `phone=${PHONE}`);
        }

        if (otpReq.response.ok) {
          const otpVerify = await requestJson("/auth/otp/verify", {
            method: "POST",
            body: JSON.stringify({ phone: PHONE, code: OTP_CODE })
          });
          const token =
            otpVerify.body && typeof otpVerify.body === "object" ? otpVerify.body.access_token : undefined;
          if (!otpVerify.response.ok || !token) {
            failures += 1;
            logFail("OTP verify", `HTTP ${otpVerify.response.status}`);
          } else {
            adminToken = token;
            logPass("OTP verify", `token=${maskSecret(adminToken)}`);
          }
        }
      } catch (error) {
        failures += 1;
        logFail("OTP flow", error instanceof Error ? error.message : String(error));
      }
    }
  } else {
    logPass("Admin token input", `token=${maskSecret(adminToken)}`);
  }

  if (adminToken) {
    try {
      const pending = await requestJson("/admin/drivers/pending", {
        method: "GET",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (!pending.response.ok) {
        failures += 1;
        logFail("Admin pending drivers", `HTTP ${pending.response.status}`);
      } else {
        const count = Array.isArray(pending.body) ? pending.body.length : 0;
        logPass("Admin pending drivers", `items=${count}`);
      }
    } catch (error) {
      failures += 1;
      logFail("Admin pending drivers", error instanceof Error ? error.message : String(error));
    }
  } else {
    failures += 1;
    logFail("Admin pending drivers", "no token available");
  }

  if (failures > 0) {
    console.error(`\nSmoke checks failed (${failures})`);
    process.exit(1);
  }

  console.log("\nSmoke checks passed");
})();
