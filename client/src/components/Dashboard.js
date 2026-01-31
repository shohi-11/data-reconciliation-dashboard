import React from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const summary = {
    total: 1200,
    matched: 950,
    unmatched: 180,
    duplicates: 70,
  };

  const barData = {
    labels: ["Matched", "Unmatched", "Duplicates"],
    datasets: [
      {
        label: "Records",
        data: [950, 180, 70],
        backgroundColor: ["#4CAF50", "#FF9800", "#F44336"],
      },
    ],
  };

  const donutData = {
    labels: ["Matched", "Unmatched", "Duplicates"],
    datasets: [
      {
        data: [950, 180, 70],
        backgroundColor: ["#4CAF50", "#FF9800", "#F44336"],
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2> Data Reconciliation Dashboard</h2>

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <Card title="Total Records" value={summary.total} />
        <Card title="Matched" value={summary.matched} color="#4CAF50" />
        <Card title="Unmatched" value={summary.unmatched} color="#FF9800" />
        <Card title="Duplicates" value={summary.duplicates} color="#F44336" />
      </div>

      {/* Charts */}
      <div style={{ display: "flex", gap: "40px" }}>
        <div style={{ width: "50%" }}>
          <h3>Reconciliation Summary</h3>
          <Bar data={barData} />
        </div>

        <div style={{ width: "35%" }}>
          <h3>Status Distribution</h3>
          <Doughnut data={donutData} />
        </div>
      </div>
    </div>
  );
};

// Card Component
const Card = ({ title, value, color = "#333" }) => {
  return (
    <div
      style={{
        flex: 1,
        padding: "20px",
        borderRadius: "10px",
        background: "#f9f9f9",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      }}
    >
      <h4>{title}</h4>
      <h2 style={{ color }}>{value}</h2>
    </div>
  );
};

export default Dashboard;