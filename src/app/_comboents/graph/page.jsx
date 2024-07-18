'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);
export default function Client() {
  const [Api, setApi] = useState([]);
  const [Transition, setTransition] = useState([]);
  const [Query, setQuery] = useState("");
  const [AmountQuery, setAmountQuery] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  async function callApi() {
    await axios.get(`https://m-khairy-b.github.io/api/data-customers.json`)
      .then(({ data }) => {
        setApi(data?.customers);
        setTransition(data?.transactions);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    callApi();
  }, []);

  useEffect(() => {
    const updatedFilteredCustomers = Api.filter(customer =>
      customer.name.toLowerCase().includes(Query.toLowerCase())
    );
    setFilteredCustomers(updatedFilteredCustomers);
  }, [Query, Api]);

  const chartData = {
    labels: filteredCustomers.map(customer => customer.name),
    datasets: [
      {
        label: 'Total Amount',
        data: filteredCustomers.map(customer => {
          const customerTransactions = Transition.filter(tran => tran.customer_id === customer.id);
          const totalAmount = customerTransactions.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
          return totalAmount;
        }),
        fill: false, 
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        pointRadius: 5, 
        pointBackgroundColor: 'rgba(75, 192, 192, 1)', 
        pointBorderColor: 'rgba(75, 192, 192, 1)', 
        pointHoverRadius: 7, 
        spanGaps: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Total Transactions by Customer',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Total Amount',
        },
      },
    },
  };

  return (
    <div className="mt-8">
      <input
        type="text"
        placeholder="Search by customer name"
        value={Query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Line data={chartData} options={chartOptions} />
    </div>

  );
}

