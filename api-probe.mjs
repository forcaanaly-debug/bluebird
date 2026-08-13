#!/usr/bin/env node

const args = parseArgs(process.argv.slice(2));
if (args.help || !args.baseUrl || !args.phone) {
  printUsage();
  process.exit(args.help ? 0 : 1);
}

const timeoutMs = Number(args.timeoutMs ?? 10000);
if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
  console.error("Invalid --timeout-ms value");
  process.exit(1);
}

const apiBase = String(args.baseUrl).replace(/\/+$/, "");
const origin = apiBase.endsWith("/api") ? apiBase.slice(0, -4) : apiBase;
const phone = String(args.phone);
const otpCode = args.otpCode ? String(args.otpCode) : "";

const report = [];
let hasFailure = false;

await runCheck("health", async () => {
  const res = await request("GET", `${apiBase}/health`);
  const body = await parseJsonSafe(res.text);
  const okStatus = res.status === 200;
  const hasShape = body && typeof body.status === "string" && typeof body.db === "boolean";
  return summarize(res.status, okStatus && hasShape, [
    `status=${body?.status ?? "n/a"}`,
    `db=${String(body?.db ?? "n/a")}`,
    `redis=${String(body?.redis ?? "n/a")}`,
  ]);
});

await runCheck("otp request", async () => {
  const res = await request("POST", `${apiBase}/auth/otp/request`, { phone });
  const body = await parseJsonSafe(res.text);
  const accepted = (res.status === 200 || res.status === 201) && body?.ok === true;
  return summarize(res.status, accepted, [`ok=${String(body?.ok)}`]);
});

if (otpCode) {
  await runCheck("otp verify", async () => {
    const res = await request("POST", `${apiBase}/auth/otp/verify`, {
      phone,
      code: otpCode,
      name: "Probe User",
    });
    const body = await parseJsonSafe(res.text);
    const accepted =
      (res.status === 200 || res.status === 201) && typeof body?.access_token === "string" && body.access_token.length > 10;
    return summarize(res.status, accepted, [`token=${accepted ? "present" : "missing"}`]);
  });
} else {
  report.push("SKIP otp verify  no --otp-code provided");
}

await runCheck("admin pending auth guard", async () => {
  const res = await request("GET", `${apiBase}/admin/drivers/pending`);
  const guarded = res.status === 401 || res.status === 403;
  return summarize(res.status, guarded, ["expects protected endpoint"]);
});

await runCheck("operator page", async () => {
  const res = await request("GET", `${origin}/operator`);
  const html = res.text;
  const served = res.status === 200 && /BlueBird operator/i.test(html);
  return summarize(res.status, served, ["contains BlueBird operator"]);
});

console.log("\nBlueBird API probe report");
console.log(`target: ${apiBase}`);
for (const line of report) console.log(`- ${line}`);
console.log(`result: ${hasFailure ? "FAIL" : "PASS"}`);
process.exit(hasFailure ? 1 : 0);

async function runCheck(name, fn) {
  try {
    const result = await fn();
    const prefix = result.pass ? "PASS" : "FAIL";
    if (!result.pass) hasFailure = true;
    report.push(`${prefix} ${name}  status=${result.status}  ${result.details.join(", ")}`);
  } catch (error) {
    hasFailure = true;
    report.push(`FAIL ${name}  error=${error instanceof Error ? error.message : String(error)}`);
  }
}

function summarize(status, pass, details) {
  return { status, pass, details };
}

async function request(method, url, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const text = await res.text();
    return { status: res.status, text };
  } finally {
    clearTimeout(timer);
  }
}

async function parseJsonSafe(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
      continue;
    }
    out[key] = next;
    i += 1;
  }
  return out;
}

function printUsage() {
  console.log("Usage:");
  console.log("  node api-probe.mjs --base-url <api-url> --phone <e164> [--otp-code <code>] [--timeout-ms 10000]");
  console.log("");
  console.log("Examples:");
  console.log("  node api-probe.mjs --base-url http://localhost:3000/api --phone +923001234568 --otp-code 000000");
  console.log("  node api-probe.mjs --base-url https://api.example.com/api --phone +923001234568");
}
