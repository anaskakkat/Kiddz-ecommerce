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
      } = await response.json();
      createPieChart(orderStatusLabels, orderStatusCounts);

      const orderChartData = orderData.map((item) => item.count);
      const productChartData = productData.map((item) => item.count);

      chart.data.datasets[0].data = orderChartData;
      chart.data.datasets[1].data = productChartData;

      chart.update();
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
            tension: 0.3,
            fill: true,
            backgroundColor: "rgba(380, 200, 230, 0.2)",
            borderColor: "rgb(380, 200, 230)",
            data: [],
          },
        ],
      },
      options: {
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
        labels: ["900", "1200", "1400", "1600"],
        datasets: [
          {
            label: "US",
            backgroundColor: "#5897fb",
            barThickness: 10,
            data: [233, 321, 783, 900],
          },
          {
            label: "Europe",
            backgroundColor: "#7bcf86",
            barThickness: 10,
            data: [408, 547, 675, 734],
          },
          {
            label: "Asian",
            backgroundColor: "#ff9076",
            barThickness: 10,
            data: [208, 447, 575, 634],
          },
          {
            label: "Africa",
            backgroundColor: "#d595e5",
            barThickness: 10,
            data: [123, 345, 122, 302],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  } //end if

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
