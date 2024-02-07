(function ($) {
  "use strict";

  const updateChart = async () => {
    try {
      const response = await fetch("/admin/dashboardData");
      const {
        orderData,
        productData,
        orderStatusLabels,
        orderStatusCounts,
        yearlySalesCounts,
      } = await response.json();
      createPieChart(orderStatusLabels, orderStatusCounts);

      const orderChartData = orderData.map((item) => item.count);
      const productChartData = productData.map((item) => item.count);

      chart.data.datasets[0].data = orderChartData;
      chart.data.datasets[1].data = productChartData;
      myChart.data.datasets[0].data = yearlySalesCounts;

      chart.update();
      myChart.update();
    } catch (error) {
      console.error("Error fetching or updating chart data:", error);
    }
  };

  /*Sale statistics Chart*/
  if ($("#myChart").length) {
    var ctx = document.getElementById("myChart").getContext("2d");
    var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: "line",

      // The data for our dataset
      data: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        datasets: [
          {
            label: "Sales",
            tension: 0.3,
            fill: true,
            backgroundColor: "rgba(44, 120, 220, 0.2)",
            borderColor: "rgba(44, 120, 220)",
            data: [],
          },
          {
            label: "Products",
            tension: 0.5,
            fill: true,
            backgroundColor: "rgba(380, 200, 230, 0.2)",
            borderColor: "rgb(380, 200, 230)",
            data: [],
          },
        ],
      },

      options: {
        scales: {
          y: {
            beginAtZero: true, // Ensure the y-axis starts at 0
          },
        },
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
            },
          },
        },
      },
    });

    // Call the updateChart function to fetch and update the data
    updateChart();
  }

  // End if

  /*Sale statistics Chart*/
  if ($("#myChart2").length) {
    var ctx = document.getElementById("myChart2");
    var myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["2024", "2025", "2026", "2027"],
        datasets: [
          {
            label: "Sales yearly",
            backgroundColor: ["#5897fb", "#7bcf86", "#ff9076", "#d595e5"],
            barThickness: 10,
            data: [],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  //end if

  // ------------------------------------------
  const createPieChart = (orderStatusLabels, orderStatusCounts) => {
    var chrt = document.getElementById("chartId").getContext("2d");
    window.chartId = new Chart(chrt, {
      type: "pie",
      data: {
        labels: orderStatusLabels,
        datasets: [
          {
            label: "Order status",
            data: orderStatusCounts,
            backgroundColor: [
              "yellow",
              "aqua",
              "pink",
              "lightgreen",
              "gold",
              "lightblue",
            ],
            hoverOffset: 5,
          },
        ],
      },
      options: {
        responsive: false,
      },
    });
  };
})(jQuery);
