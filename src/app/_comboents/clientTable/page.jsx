'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

export default function Client() {
  const [Api, setApi] = useState([]);
  const [Transition, setTransition] = useState([]);
  const [Transactions, setTransactions] = useState({});
  const [Query, setQuery] = useState("");
  const [AmountQuery, setAmountQuery] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  async function callApi() {
    await axios.get(`https://m-khairy-b.github.io/api/data-customers.json`)
      .then(({ data }) => {
        setApi(data?.customers);
        setTransition(data?.transactions);
        const groupedTransactions = data?.transactions.reduce((acc, transaction) => {
          if (!acc[transaction.customer_id]) {
            acc[transaction.customer_id] = [];
          }
          acc[transaction.customer_id].push(transaction);
          return acc;
        }, {});
        setTransactions(groupedTransactions);
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
          const customerTransactions = Transactions[customer.id] || [];
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

  const filteredTransactions = Transition.filter(transaction => {
    if (!AmountQuery) return true;
    return transaction.amount >= parseFloat(AmountQuery);
  });

  return (
    <div className="mt-8">
      <form className="bg-white p-4 rounded-lg">
        <div className="relative bg-inherit">
          <input
            onChange={event => setQuery(event.target.value)}
            type="text"
            id="username"
            name="username"
            className="peer bg-transparent h-10 w-[100%] rounded-lg text-gray-200 placeholder-transparent ring-2 px-2 ring-gray-500 focus:ring-sky-600 focus:outline-none focus:border-rose-600"
            placeholder="Search by customer name"
          />
          <label
            htmlFor="username"
            className="absolute cursor-text left-0 -top-3 text-sm text-gray-500 bg-inherit mx-1 px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 peer-focus:-top-3 peer-focus:text-sky-600 peer-focus:text-sm transition-all"
          >
            Search by customer name
          </label>
        </div>
      </form>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-4">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="py-4 px-4 text-left">Customer ID</th>
              <th className="py-4 px-4 text-left">Customer Name</th>
              <th className="py-4 px-4 text-left">Date</th>
              <th className="py-4 px-4 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => {
              const transactions = Transactions[customer.id] || [];
              return transactions.map(transaction => (
                <tr key={transaction.id} className="bg-white border-b border-blue-500">
                  <td className="py-4 px-4">{customer.id}</td>
                  <td className="py-4 px-4">{customer.name}</td>
                  <td className="py-4 px-4">{transaction.date || 'N/A'}</td>
                  <td className="py-4 px-4">{transaction.amount || 'N/A'}</td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
