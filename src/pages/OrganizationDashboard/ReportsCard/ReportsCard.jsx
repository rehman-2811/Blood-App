import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "./ReportsCard.module.css";

const PERIODS = [
  { label: "Today",    value: "daily" },
  { label: "This Week",  value: "weekly" },
  { label: "This Month", value: "monthly" },
  { label: "This Year",  value: "yearly" },
  { label: "Custom",     value: "custom" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ReportsCard({ token }) {
  const [period, setPeriod]     = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]   = useState("");
  const [report, setReport]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    setReport(null);

    try {
      const params = new URLSearchParams({ period });
      if (period === "custom") {
        if (!startDate || !endDate) {
          setError("Please select both start and end dates.");
          setLoading(false);
          return;
        }
        params.append("start", startDate);
        params.append("end", endDate);
      }

      const res = await fetch(`/api/org/reports?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Failed to generate report.");
      setReport(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const { org, period: p, summary, donations, dispenses, currentStock } = report;

    // ── Header ──────────────────────────────────────────────────
    doc.setFillColor(159, 18, 57);
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Blood Needer", 14, 13);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Organization Report", 14, 22);
    doc.setTextColor(0, 0, 0);

    // ── Org info ────────────────────────────────────────────────
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(org.name, 14, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Address: ${org.address}`, 14, 49);
    doc.text(`Head: ${org.head}  |  Phone: ${org.phone}`, 14, 55);
    doc.text(
      `Report Period: ${new Date(p.startDate).toLocaleDateString()} — ${new Date(p.endDate).toLocaleDateString()}`,
      14, 61
    );
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 67);

    // ── Summary boxes ───────────────────────────────────────────
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 14, 78);

    autoTable(doc, {
      startY: 82,
      head: [["Metric", "Value"]],
      body: [
        ["Total Donations Recorded", summary.totalDonations],
        ["Total Blood Collected (ml)", `${summary.totalMlRecorded} ml`],
        ["Total Dispenses",           summary.totalDispenses],
        ["Total Blood Dispensed (ml)", `${summary.totalMlDispensed} ml`],
        ["Net Change in Stock",        `${summary.netStock >= 0 ? "+" : ""}${summary.netStock} ml`],
      ],
      headStyles: { fillColor: [159, 18, 57], textColor: 255 },
      alternateRowStyles: { fillColor: [254, 242, 242] },
      styles: { fontSize: 9 },
      columnStyles: { 0: { fontStyle: "bold" }, 1: { halign: "right" } },
    });

    // ── Blood group breakdown ───────────────────────────────────
    const afterSummary = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Blood Group Breakdown", 14, afterSummary);

    autoTable(doc, {
      startY: afterSummary + 4,
      head: [["Blood Group", "Collected (ml)", "Dispensed (ml)", "Current Stock (ml)"]],
      body: BLOOD_GROUPS.map((bg) => [
        bg,
        summary.donationsByBloodGroup[bg] || 0,
        summary.dispensesByBloodGroup[bg] || 0,
        currentStock[bg] || 0,
      ]),
      headStyles: { fillColor: [159, 18, 57], textColor: 255 },
      alternateRowStyles: { fillColor: [254, 242, 242] },
      styles: { fontSize: 9 },
    });

    // ── Donation history ────────────────────────────────────────
    if (donations.length > 0) {
      const afterBreakdown = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Donation Records (${donations.length})`, 14, afterBreakdown);

      autoTable(doc, {
        startY: afterBreakdown + 4,
        head: [["Date", "Donor Name", "Blood Group", "Units (ml)", "Location"]],
        body: donations.map((d) => [
          d.date, d.donorName, d.bloodGroup, `${d.units} ml`, d.location,
        ]),
        headStyles: { fillColor: [159, 18, 57], textColor: 255 },
        alternateRowStyles: { fillColor: [254, 242, 242] },
        styles: { fontSize: 8 },
      });
    }

    // ── Dispense history ────────────────────────────────────────
    if (dispenses.length > 0) {
      const afterDonations = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Dispense Records (${dispenses.length})`, 14, afterDonations);

      autoTable(doc, {
        startY: afterDonations + 4,
        head: [["Date", "Blood Group", "Units (ml)", "Recipient"]],
        body: dispenses.map((d) => [
          d.date, d.bloodGroup, `${d.units} ml`, d.recipientName || "Anonymous",
        ]),
        headStyles: { fillColor: [69, 10, 10], textColor: 255 },
        alternateRowStyles: { fillColor: [254, 242, 242] },
        styles: { fontSize: 8 },
      });
    }

    // ── Footer ──────────────────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Blood Needer — ${org.name} — Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" }
      );
    }

    doc.save(`${org.name}_Report_${period}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.title}>📊 Reports</h2>
      </div>

      {/* Period selector */}
      <div className={styles.periodRow}>
        {PERIODS.map((p) => (
          <button
            key={p.value}
            className={period === p.value ? styles.periodActive : styles.periodBtn}
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      {period === "custom" && (
        <div className={styles.dateRow}>
          <div className={styles.dateGroup}>
            <label>From</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className={styles.dateGroup}>
            <label>To</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      )}

      <button className={styles.generateBtn} onClick={fetchReport} disabled={loading}>
        {loading ? "Generating…" : "Generate Report"}
      </button>

      {error && <p className={styles.error}>{error}</p>}

      {/* Report preview */}
      {report && (
        <div className={styles.preview}>
          <div className={styles.previewHeader}>
            <div>
              <h3 className={styles.previewTitle}>{report.org.name}</h3>
              <p className={styles.previewSub}>
                {new Date(report.period.startDate).toLocaleDateString()} —{" "}
                {new Date(report.period.endDate).toLocaleDateString()}
              </p>
            </div>
            <button className={styles.downloadBtn} onClick={downloadPDF}>
              ⬇ Download PDF
            </button>
          </div>

          {/* Summary stats */}
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryNum}>{report.summary.totalDonations}</span>
              <span className={styles.summaryLabel}>Donations</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryNum}>{report.summary.totalMlRecorded} ml</span>
              <span className={styles.summaryLabel}>Collected</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryNum}>{report.summary.totalDispenses}</span>
              <span className={styles.summaryLabel}>Dispenses</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryNum}>{report.summary.totalMlDispensed} ml</span>
              <span className={styles.summaryLabel}>Dispensed</span>
            </div>
          </div>

          {/* Blood group table */}
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Blood Group</th>
                <th>Collected (ml)</th>
                <th>Dispensed (ml)</th>
                <th>Current Stock</th>
              </tr>
            </thead>
            <tbody>
              {BLOOD_GROUPS.map((bg) => (
                <tr key={bg}>
                  <td><span className={styles.bgPill}>{bg}</span></td>
                  <td>{report.summary.donationsByBloodGroup[bg] || 0} ml</td>
                  <td>{report.summary.dispensesByBloodGroup[bg] || 0} ml</td>
                  <td>{report.currentStock[bg] || 0} ml</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Donation rows */}
          {report.donations.length > 0 && (
            <>
              <h4 className={styles.sectionTitle}>
                Donation Records ({report.donations.length})
              </h4>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th><th>Donor</th><th>Blood</th><th>Units</th><th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {report.donations.map((d, i) => (
                    <tr key={i}>
                      <td>{d.date}</td>
                      <td>{d.donorName}</td>
                      <td><span className={styles.bgPill}>{d.bloodGroup}</span></td>
                      <td>{d.units} ml</td>
                      <td>{d.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Dispense rows */}
          {report.dispenses.length > 0 && (
            <>
              <h4 className={styles.sectionTitle}>
                Dispense Records ({report.dispenses.length})
              </h4>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th><th>Blood Group</th><th>Units</th><th>Recipient</th>
                  </tr>
                </thead>
                <tbody>
                  {report.dispenses.map((d, i) => (
                    <tr key={i}>
                      <td>{d.date}</td>
                      <td><span className={styles.bgPill}>{d.bloodGroup}</span></td>
                      <td>{d.units} ml</td>
                      <td>{d.recipientName || "Anonymous"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {report.donations.length === 0 && report.dispenses.length === 0 && (
            <p className={styles.empty}>No records found for this period.</p>
          )}
        </div>
      )}
    </div>
  );
}