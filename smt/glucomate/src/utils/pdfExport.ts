import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GlucoseReading } from "../types/reading";
import { getReadingStats } from "./storage";
import { getWeeklyInsight, getDetailedStats } from "./insights";

const LAST_EXPORT_KEY = "last_export_timestamp";

/**
 * Get the last export timestamp
 */
export const getLastExportTimestamp = async (): Promise<number | null> => {
  try {
    const timestamp = await AsyncStorage.getItem(LAST_EXPORT_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    console.error("Error getting last export timestamp:", error);
    return null;
  }
};

/**
 * Set the last export timestamp
 */
const setLastExportTimestamp = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(LAST_EXPORT_KEY, Date.now().toString());
  } catch (error) {
    console.error("Error setting last export timestamp:", error);
  }
};

/**
 * Format date for display
 */
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format date for filename
 */
const formatFilenameDate = (): string => {
  const date = new Date();
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};

/**
 * Get color for glucose value
 */
const getColorForValue = (value: number): string => {
  if (value < 70) return "#FF9800";
  if (value > 140) return "#F44336";
  return "#4CAF50";
};

/**
 * Get status text for glucose value
 */
const getStatusForValue = (value: number): string => {
  if (value < 70) return "Low";
  if (value > 140) return "High";
  return "Normal";
};

/**
 * Generate HTML for PDF report
 */
const generateReportHTML = (
  readings: GlucoseReading[],
  allTimeStats: any,
  stats14Days: any,
  weeklyInsight: string
): string => {
  const reportDate = formatDate(Date.now());

  // Sort readings by date for report
  const sortedReadings = [...readings].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  // Take only the most recent 30 readings for the report
  const recentReadings = sortedReadings.slice(0, 30);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GlucoMate Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      padding: 20px;
      color: #333;
      background: #fff;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #4A90E2;
      padding-bottom: 20px;
    }
    
    .header h1 {
      color: #4A90E2;
      font-size: 32px;
      margin-bottom: 8px;
    }
    
    .header .subtitle {
      color: #666;
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    .header .date {
      color: #999;
      font-size: 12px;
    }
    
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e0e0e0;
    }
    
    .insight-box {
      background: #E8F5E9;
      border-left: 4px solid #4CAF50;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 15px;
    }
    
    .insight-box p {
      font-size: 14px;
      line-height: 1.6;
      color: #1B5E20;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background: #f8f8f8;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    
    .stat-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
    }
    
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #333;
      margin-bottom: 4px;
    }
    
    .stat-unit {
      font-size: 11px;
      color: #999;
    }
    
    .readings-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    
    .readings-table th {
      background: #4A90E2;
      color: white;
      padding: 10px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
    }
    
    .readings-table td {
      padding: 10px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 12px;
    }
    
    .readings-table tr:nth-child(even) {
      background: #f8f8f8;
    }
    
    .glucose-value {
      font-weight: 600;
      font-size: 14px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      color: white;
    }
    
    .status-normal { background: #4CAF50; }
    .status-high { background: #F44336; }
    .status-low { background: #FF9800; }
    
    .type-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }
    
    .type-fasting { background: #E1BEE7; color: #6A1B9A; }
    .type-postmeal { background: #FFE0B2; color: #E65100; }
    .type-random { background: #BBDEFB; color: #0D47A1; }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #999;
      font-size: 11px;
    }
    
    .disclaimer {
      background: #FFF9E6;
      border-left: 4px solid #FFC107;
      padding: 15px;
      margin: 20px 0;
      font-size: 11px;
      color: #666;
      line-height: 1.5;
    }
    
    .percentage-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 15px;
    }
    
    .percentage-item {
      text-align: center;
      padding: 10px;
      background: #f8f8f8;
      border-radius: 6px;
    }
    
    .percentage-value {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .percentage-label {
      font-size: 11px;
      color: #666;
    }
    
    @media print {
      body {
        padding: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 GlucoMate Report</h1>
    <div class="subtitle">Glucose Tracking Report</div>
    <div class="date">Generated on ${reportDate}</div>
  </div>

  <!-- Weekly Insight -->
  <div class="section">
    <div class="section-title">🧠 Weekly Insight</div>
    <div class="insight-box">
      <p>${weeklyInsight}</p>
    </div>
  </div>

  <!-- All-Time Statistics -->
  <div class="section">
    <div class="section-title">📈 Overall Statistics</div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Average</div>
        <div class="stat-value">${allTimeStats.average || "--"}</div>
        <div class="stat-unit">mg/dL</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Highest</div>
        <div class="stat-value" style="color: #F44336;">${
          allTimeStats.highest?.value || "--"
        }</div>
        <div class="stat-unit">mg/dL</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Lowest</div>
        <div class="stat-value" style="color: #FF9800;">${
          allTimeStats.lowest?.value || "--"
        }</div>
        <div class="stat-unit">mg/dL</div>
      </div>
    </div>
    <div style="text-align: center; color: #666; font-size: 12px;">
      Total Readings: ${allTimeStats.total}
    </div>
  </div>

  <!-- 14-Day Statistics -->
  <div class="section">
    <div class="section-title">📊 Last 14 Days Analysis</div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Average</div>
        <div class="stat-value">${stats14Days.average || "--"}</div>
        <div class="stat-unit">mg/dL</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Highest</div>
        <div class="stat-value" style="color: #F44336;">${
          stats14Days.highest?.value || "--"
        }</div>
        <div class="stat-unit">mg/dL</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Lowest</div>
        <div class="stat-value" style="color: #FF9800;">${
          stats14Days.lowest?.value || "--"
        }</div>
        <div class="stat-unit">mg/dL</div>
      </div>
    </div>
    
    ${
      stats14Days.total > 0
        ? `
    <div class="percentage-grid">
      <div class="percentage-item">
        <div class="percentage-value" style="color: #4CAF50;">${Math.round(
          (stats14Days.inRange / stats14Days.total) * 100
        )}%</div>
        <div class="percentage-label">In Range</div>
      </div>
      <div class="percentage-item">
        <div class="percentage-value" style="color: #F44336;">${Math.round(
          (stats14Days.highCount / stats14Days.total) * 100
        )}%</div>
        <div class="percentage-label">High</div>
      </div>
      <div class="percentage-item">
        <div class="percentage-value" style="color: #FF9800;">${Math.round(
          (stats14Days.lowCount / stats14Days.total) * 100
        )}%</div>
        <div class="percentage-label">Low</div>
      </div>
    </div>
    `
        : ""
    }
  </div>

  <!-- Recent Readings Table -->
  <div class="section">
    <div class="section-title">📋 Recent Readings (Last 30)</div>
    <table class="readings-table">
      <thead>
        <tr>
          <th>Date & Time</th>
          <th>Glucose</th>
          <th>Status</th>
          <th>Type</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${recentReadings
          .map(
            (reading) => `
          <tr>
            <td>${formatDate(reading.timestamp)}</td>
            <td>
              <span class="glucose-value" style="color: ${getColorForValue(
                reading.value
              )};">
                ${reading.value} mg/dL
              </span>
            </td>
            <td>
              <span class="status-badge status-${getStatusForValue(
                reading.value
              ).toLowerCase()}">
                ${getStatusForValue(reading.value)}
              </span>
            </td>
            <td>
              <span class="type-badge type-${reading.type
                .toLowerCase()
                .replace("-", "")}">
                ${reading.type}
              </span>
            </td>
            <td>${reading.notes || "-"}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  </div>

  <!-- Disclaimer -->
  <div class="disclaimer">
    <strong>Disclaimer:</strong> This report is for informational purposes only and should not be used as a substitute for professional medical advice. Always consult your healthcare provider for medical decisions.
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>Generated by GlucoMate v1.0.0</p>
    <p>Your glucose tracking companion</p>
  </div>
</body>
</html>
  `;
};

/**
 * Generate and share PDF report
 */
export const generatePDFReport = async (
  readings: GlucoseReading[]
): Promise<boolean> => {
  try {
    if (readings.length === 0) {
      throw new Error("No readings to export");
    }

    // Get statistics
    const allTimeStats = await getReadingStats(readings);
    const stats14Days = getDetailedStats(readings, 14);
    const weeklyInsight = getWeeklyInsight(readings);

    // Generate HTML
    const html = generateReportHTML(
      readings,
      allTimeStats,
      stats14Days,
      weeklyInsight
    );

    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // Create a better filename
    const filename = `GlucoMate-Report-${formatFilenameDate()}.pdf`;
    const newUri = `${FileSystem.documentDirectory}${filename}`;

    // Move the file to a better location with a better name
    await FileSystem.moveAsync({
      from: uri,
      to: newUri,
    });

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();

    if (isAvailable) {
      // Share the PDF
      await Sharing.shareAsync(newUri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Your GlucoMate Report",
        UTI: "com.adobe.pdf",
      });
    } else {
      throw new Error("Sharing is not available on this device");
    }

    // Update last export timestamp
    await setLastExportTimestamp();

    return true;
  } catch (error) {
    console.error("Error generating PDF report:", error);
    throw error;
  }
};
