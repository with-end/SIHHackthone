// Chart.jsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // for area under curve
} from "chart.js";

import { Bar } from "react-chartjs-2";

// Register required components once
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Chart() {
  const data = {
    labels: ["Electricity", "Roads", "Water", "Sanitation"],
    datasets: [
      {
        label: "Resolved Issues",
        data: [45, 32, 50, 40],
        backgroundColor: "rgba(34,197,94,0.7)", // green
        borderRadius: 10,
      },
      {
        label: "Pending Issues",
        data: [12, 18, 15, 20],
        backgroundColor: "rgba(239,68,68,0.7)", // red
        borderRadius: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Department Performance",
        font: { size: 16, weight: "bold" },
        color: "#1e3a8a",
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "rgba(0,0,0,0.05)" } },
    },
    barPercentage: 0.6, // makes bars slightly thinner
    categoryPercentage: 0.7,
  };

  return <Bar data={data} options={options} height={150} />;
}
