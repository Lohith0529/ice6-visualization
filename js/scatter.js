const WIDTH = 980, HEIGHT = 560;
const M = { top: 80, right: 30, bottom: 80, left: 90 };
const innerW = WIDTH - M.left - M.right;
const innerH = HEIGHT - M.top - M.bottom;

const svg = d3.select("#chart").append("svg")
  .attr("width", WIDTH).attr("height", HEIGHT);
const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);

d3.csv("data/songs_dataset_lohith.csv", d3.autoType).then(data => { data.forEach(d=>{d.duration_sec=+d.duration_sec; d.popularity=+d.popularity;});
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.duration_sec)).nice()
    .range([0, innerW]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.popularity)).nice()
    .range([innerH, 0]);

  const color = d3.scaleOrdinal(d3.schemeTableau10)
    .domain([...new Set(data.map(d => d.genre))]);

  g.append("g").attr("class","axis")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x));
  g.append("g").attr("class","axis")
    .call(d3.axisLeft(y).ticks(10));

  g.append("g").attr("class","grid")
    .call(d3.axisLeft(y).tickSize(-innerW).tickFormat(""));

  g.selectAll(".dot").data(data).join("circle")
    .attr("class","dot")
    .attr("cx", d => x(d.duration_sec))
    .attr("cy", d => y(d.popularity))
    .attr("r", 5)
    .attr("fill", d => color(d.genre))
    .append("title")
      .text(d => `${d.title} — ${d.artist}\n${d.genre}\n${d.duration_sec}s • pop ${d.popularity}`);

  svg.append("text").attr("class","title")
    .attr("x", WIDTH/2).attr("y", 34).attr("text-anchor","middle")
    .text("Song Duration vs Popularity");

  svg.append("text").attr("class","label")
    .attr("x", WIDTH/2).attr("y", HEIGHT-18)
    .attr("text-anchor","middle").text("Duration (seconds)");

  svg.append("text").attr("class","label")
    .attr("transform", `translate(18, ${HEIGHT/2}) rotate(-90)`)
    .attr("text-anchor","middle").text("Popularity (0–10)");

  const legend = svg.append("g").attr("class","legend")
    .attr("transform", `translate(${WIDTH - M.right - 160}, ${M.top})`);

  const genres = color.domain();
  const rows = legend.selectAll("g").data(genres).join("g")
    .attr("transform", (_, i) => `translate(0, ${i * 22})`);

  rows.append("rect").attr("width", 14).attr("height", 14)
    .attr("fill", d => color(d));
  rows.append("text").attr("x", 22).attr("y", 12).text(d => d);

  console.log("Scatter ready.");
});
