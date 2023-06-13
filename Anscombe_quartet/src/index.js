import { axisBottom, axisLeft, line, mean, scaleLinear, select } from 'd3';
import csvData from '../data/Anscombe_quartet_data.csv';
import '../style/main.scss';

function linearRegression(data) {
  let n = data.length;
  let sumX = data.reduce((prev, curr) => prev + curr.x, 0);
  let sumY = data.reduce((prev, curr) => prev + curr.y, 0);
  let sumXY = data.reduce((prev, curr) => prev + (curr.x * curr.y), 0);
  let sumXsq = data.reduce((prev, curr) => prev + (curr.x * curr.x), 0);
  let m = (n * sumXY - sumX * sumY) / (n * sumXsq - sumX * sumX);
  let b = (sumY - (m * sumX)) / n;
  return { m, b };
}

function makeChart(mount, dataset, height, width) {
  // filter proper data from csv file
  const data = csvData.filter((row) => row.dataset === dataset);

  const margin = { top: height / 18, right: height / 12, bottom: width / 13, left: width / 13 };

  // conditional creation of svg
  let svg = select(mount).select('svg');
  if (svg.empty()) {
    svg = select(mount)
      .append('svg')
      .attr('height', height)
      .attr('width', width);
  } else {
    svg.attr('height', height)
      .attr('width', width);
  }

  // set scaling
  const xScale = scaleLinear().domain([0, 20]).range([margin.left, width - margin.right]);
  const yScale = scaleLinear().domain([0, 13]).range([height - margin.bottom, margin.top]);

  // conditional axis creation
  let yAxis = svg.select('.y-axis');
  let xAxis = svg.select('.x-axis');

  if (yAxis.empty()) {
    yAxis = svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(yScale).ticks(6));
  } else {
    yAxis.attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(yScale).ticks(6));
  }

  if (xAxis.empty()) {
    xAxis = svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(axisBottom(xScale));
  } else {
    xAxis.attr('transform', `translate(0,${height - margin.bottom})`)
      .call(axisBottom(xScale));
  }

  const scaledData = data.map((d) => ({
    x: xScale(d.x),
    y: yScale(d.y)
  }));

  const lineData = [];
  const { m, b } = linearRegression(data);
  for (let x = 1; x < 21; x += 1) {
    const y = m * x + b;
    lineData.push({ x, y });
  }
  const regLine = line()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y));

  svg.selectAll('.regress-line').remove(); // remove line before redraw
  svg.append('path')
    .datum(lineData)
    .attr("fill", "none")
    .attr("class", "regress-line")
    .attr("stroke", "#ff7300")
    .attr("d", regLine);


  // draw scatter points
  svg.selectAll('circle')
    .data(scaledData)
    .join('circle')
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', height / 100)
    .attr('fill', '#393939')
    .attr('stroke','#000000');
}

// Create DOM elements
const body = document.querySelector('body');
const boxWrapper = document.createElement('div');
const topText = document.createElement('h3');
topText.innerText = "Anscombe's quartet"
topText.classList.add('header-text')
body.appendChild(topText)
boxWrapper.classList.add('box-wrapper');

const topExplanation = document.createElement('p')
topExplanation.innerText = "An illustration of why visualizing data is important.\nThe summary statistics can be the same, while the data distributions can be very different."
topExplanation.classList.add('header-explanation')
body.appendChild(topExplanation)

const boxOne = document.createElement('div');
boxOne.classList.add('box-one', 'box');

const boxTwo = document.createElement('div');
boxTwo.classList.add('box-two', 'box');

const boxThree = document.createElement('div');
boxThree.classList.add('box-three', 'box');

const boxFour = document.createElement('div');
boxFour.classList.add('box-four', 'box');

boxWrapper.append(boxOne, boxTwo, boxThree, boxFour);
body.appendChild(boxWrapper);



function drawCharts() {
  let containerWidth = select('.box').node().getBoundingClientRect().width;
  let containerHeight = select('.box').node().getBoundingClientRect().height;
  makeChart('.box-one', 'I', containerHeight, containerWidth);
  makeChart('.box-two', 'II', containerHeight, containerWidth);
  makeChart('.box-three', 'III', containerHeight, containerWidth);
  makeChart('.box-four', 'IV', containerHeight, containerWidth);
}


window.addEventListener('resize', drawCharts);
drawCharts();
