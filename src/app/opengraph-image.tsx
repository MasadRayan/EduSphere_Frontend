import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME} - the registrar, online`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0f1530",
        color: "#eef1f6",
        padding: "72px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            background: "#2f4bff",
            color: "#ffffff",
            fontSize: "32px",
            fontWeight: 700,
          }}
        >
          E
        </div>
        <div style={{ fontSize: "30px", fontWeight: 600 }}>{SITE_NAME}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "24px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#99a3c4",
          }}
        >
          The registrar, online
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "68px",
            lineHeight: 1.1,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          From application to transcript, on one ledger.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #99a3c4",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "24px",
            fontWeight: 500,
          }}
        >
          CSE-101
        </div>
        <div style={{ fontSize: "22px", color: "#99a3c4" }}>
          Enrollment - Payments - Attendance - Results
        </div>
      </div>
    </div>,
    { ...size },
  );
}
