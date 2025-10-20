const WIDTH = 980, HEIGHT = 560;
const M = { top: 80, right: 30, bottom: 80, left: 90 };
const innerW = WIDTH - M.left - M.right;
const innerH = HEIGHT - M.top - M.bottom;

const svg = d3.select("#chart").append("svg")
  .attr("width", WIDTH).attr("height", HEIGHT);

const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);

d3.csv("data/songs_dataset_lohith.csv", d3.autoType).then(rows => { rows.forEach(d=>{d.popularity=+d.popularity;});
  // group by genre → average popularity
  const grouped = d3.rollups(
    rows,
    v => d3.mean(v, d => d.popularity),
    d => d.genre
  ).map(([genre, avgPop]) => ({ genre, avgPop }));

  // sort high → low
  grouped.sort((a,b) => d3.descending(a.avgPop, b.avgPop));

  const x = d3.scaleBand()
    .domain(grouped.map(d => d.genre))
    .range([0, innerW]).padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(grouped, d => d.avgPop)]).nice()
    .range([innerH, 0]);

  // axes
  g.append("g").attr("class","axis")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x));
  g.append("g").attr("class","axis")
    .call(d3.axisLeft(y).ticks(10));

  // gridlines
  g.append("g").attr("class","grid")
    .call(d3.axisLeft(y).tickSize(-innerW).tickFormat(""));

  // bars (marks)
  g.selectAll(".bar").data(grouped).join("rect")
    .attr("class","bar")
    .attr("x", d => x(d.genre))
    .attr("y", d => y(d.avgPop))
    .attr("width", x.bandwidth())
    .attr("height", d => innerH - y(d.avgPop));

  // title & labels
  svg.append("text").attr("class","title")
    .attr("x", WIDTH/2).attr("y", 34)
    .attr("text-anchor","middle")
    .text("Average Popularity by Genre");

  svg.append("text").attr("class","label")
    .attr("x", WIDTH/2).attr("y", HEIGHT - 18)
    .attr("text-anchor","middle")
    .text("Genre");

  svg.append("text").attr("class","label")
    .attr("transform", `translate(18, ${HEIGHT/2}) rotate(-90)`)
    .attr("text-anchor","middle")
    .text("Average Popularity (0–10)");

  console.log("Bar Chart ready.");
});
