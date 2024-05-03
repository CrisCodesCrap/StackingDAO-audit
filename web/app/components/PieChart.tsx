// @ts-nocheck

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useEffect, useState } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

const options = {
  plugins: {
    legend: {
      display: true,
      labels: {
        color: 'rgba(255, 255, 255, 1)',
      },
      position: 'bottom',
      title: { display: true, padding: 10 },
    },
  },
};

export function PieChart({ signerInfo }: any) {
  const [data, setData] = useState({});

  useEffect(() => {
    if (!signerInfo || signerInfo.length === 0) return;

    setData({
      labels: signerInfo.map(info => info['name']),
      datasets: [
        {
          data: signerInfo.map(info => info['percentage']),
          backgroundColor: [
            '#E22a00',
            '#5025b8',
            '#168F9C',
            '#212cd4',
            '#FF5E00',
            '#BE1E2E',
            '#72CCA6',
            '#7BF178',
          ],
        },
      ],
    });
  }, [signerInfo]);

  return <>{data && data.labels?.length > 0 && <Pie data={data} options={options} />}</>;
}
