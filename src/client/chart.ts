import { $$ } from "./ui.js";
import { colors } from "./colors.js";

let myChart = null;

export let makeChart = (post: any, voteData: any) => {
  const ctx = $$(".myChart");

  ctx.forEach((element: any, index) => {
    let voteLabels = post.options;
    myChart && myChart.destroy();

    myChart = new globalThis.Chart(element, {
      type: "doughnut",
      data: {
        labels: voteLabels,
        datasets: [
          {
            data: voteData.votes,
            borderWidth: 0,
            backgroundColor: colors,
          },
        ],
      },
      options: {
        aspectRatio: 1,
        cutout: 90,
        responsive: true,
        width: 230,
        height: 230,
        scales: {
          y: {
            display: false,
          },
          x: {
            display: false,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  });
};
