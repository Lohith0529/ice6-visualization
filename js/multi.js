const WIDTH = 1080, HEIGHT = 600;
const M = { top: 90, right: 180, bottom: 80, left: 80 };
const innerW = WIDTH - M.left - M.right;
const innerH = HEIGHT - M.top - M.bottom;

const svg = d3.select("#chart").append("svg")
  .attr("width", WIDTH).attr("height", HEIGHT);
const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);

d3.csv("data/songs_dataset_lohith.csv").then(rows => {
  // emergency full numeric conversion
  rows.forEach(d => {
    d.year = +d.year;
    d.duration_sec = +d.duration_sec;
    d.popularity = +d.popularity;
  });
  console.log("RAW DATA:", rows);

  const byYear = rows.reduce((acc, d) => {
    if(!acc[d.year]) acc[d.year] = {year:d.year, pop:[], dur:[]};
    acc[d.year].pop.push(d.popularity);
    acc[d.year].dur.push(d.duration_sec);
    return acc;
  },{});
  const data = Object.values(byYear).map(d => ({
    year: d.year,
    popularity: d.pop.reduce((a,b)=>a+b,0)/d.pop.length,
    duration: d.dur.reduce((a,b)=>a+b,0)/d.dur.length
  }));
  console.log("GROUPED:", data);

  if(data.length===0){
    svg.append("text").text("No data found").attr("fill","red").attr("x",50).attr("y",50);
    return;
  }

  const x = d3.scaleBand().domain(data.map(d => d.year)).range([0, innerW]).padding(0.2);
  const yL = d3.scaleLinear().domain([0, d3.max(data, d => d.popularity)]).nice().range([innerH, 0]);
  const yR = d3.scaleLinear().domain([0, d3.max(data, d => d.duration)]).nice().range([innerH, 0]);

  g.append("g").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(x));
  g.append("g").call(d3.axisLeft(yL));
  g.append("g").attr("transform", `translate(${innerW},0)`).call(d3.axisRight(yR));

  g.selectAll(".bar").data(data).join("rect")
    .attr("class","bar")
    .attr("x", d => x(d.year))
    .attr("y", d => yL(d.popularity))
    .attr("width", x.bandwidth())
    .attr("height", d => innerH - yL(d.popularity));

  const line = d3.line().x(d => x(d.year)+x.bandwidth()/2).y(d => yR(d.duration));
  g.append("path").datum(data).attr("fill","none").attr("stroke","var(--accentB)").attr("stroke-width",2.5).attr("d", line);
});
