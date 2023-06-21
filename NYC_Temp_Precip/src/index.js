/* eslint-disable camelcase */
import {
  scaleLinear,
  select,
  axisLeft,
  axisBottom,
  scaleTime,
  timeFormat,
  line,
  curveBumpX,
} from 'd3';
import './style.scss';
import csvData from '../data/weather_data_nyc.csv';

function createChart() {
  const height = window.innerHeight * 0.75;
  const width = window.innerWidth;
  const barWidth = width / csvData.length;
  const minTemp = -10;
  const maxTemp = 100;
  const margin = {
    top: 30,
    right: 20,
    bottom: 40,
    left: 40,
  };

  const formatNewDate = (mmDDyyyy) => {
    const dateArray = mmDDyyyy.split('-');
    return new Date(`${dateArray[1]}-${dateArray[0]}-${dateArray[2]}`);
  };

  const dateScale = scaleTime()
    .domain([formatNewDate(csvData[0].date), formatNewDate(csvData[csvData.length - 1].date)])
    .range([margin.left, width + barWidth - margin.right]);

  const xScale = scaleLinear()
    .domain([0, csvData.length])
    .range([margin.left, width - margin.right]);

  const yScale = scaleLinear()
    .domain([minTemp, maxTemp])
    .range([height - margin.bottom, margin.top]);

  const svg = select('body').append('svg').attr('height', height).attr('width', width);

  // y-axis label
  svg.append('text')
    .attr('class', 'axis-label')
    .text('Degrees F°')
    .attr('transform', `translate(5,${(height / 2) - margin.bottom}) rotate(90)`)
    .attr('x', 0)
    .attr('y', 0);

  let xAxis = svg.select('.x-axis');
  let yAxis = svg.select('.y-axis');

  if (yAxis.empty()) {
    yAxis = svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(axisLeft(yScale));
  } else {
    yAxis.attr('transform', `translate(${margin.left}, 0)`)
      .call(axisLeft(yScale));
  }

  if (xAxis.empty()) {
    xAxis = svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(axisBottom(dateScale).tickFormat(timeFormat('%b')));
  } else {
    xAxis.attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(axisBottom(dateScale).tickFormat(timeFormat('%b')));
  }

  const tempBarsGroup = svg.append('g');

  tempBarsGroup.selectAll('rect')
    .data(csvData)
    .join('rect')
    .attr('class', 'temp-bars')
    .attr('width', barWidth)
    .attr('height', (d) => yScale(d.min_temp) - yScale(d.max_temp))
    .attr('x', (_, i) => xScale(i + (i / csvData.length)))
    .attr('y', (d) => yScale(d.max_temp))
    .attr('rx', barWidth * 0.25)
    .attr('fill', 'black')
    .attr('stroke-width', 1)
    .attr('stroke', 'black');

  // mark yearly low
  const yearlyMin = {
    date: undefined,
    temp: Infinity,
    index: 0,
    className: 'low-temp',
    title: 'Low',
  };

  const yearlyMax = {
    date: undefined,
    temp: -Infinity,
    index: 0,
    className: 'high-temp',
    title: 'High',
  };

  const minMax = [yearlyMin, yearlyMax];
  for (let i = 0; i < csvData.length; i += 1) {
    if (csvData[i].min_temp < yearlyMin.temp) {
      yearlyMin.date = csvData[i].date;
      yearlyMin.temp = csvData[i].min_temp;
      yearlyMin.index = i;
    }
    if (csvData[i].max_temp > yearlyMax.temp) {
      yearlyMax.date = csvData[i].date;
      yearlyMax.temp = csvData[i].max_temp;
      yearlyMax.index = i;
    }
  }

  // Drawing High and Low lines
  function drawMinMax(tempObj) {
    const lineGroup = svg.append('g');
    lineGroup.append('line')
      .attr('x1', xScale(tempObj.index + (tempObj.index / csvData.length)))
      .attr('x2', xScale(tempObj.index + 10 + (tempObj.index / csvData.length)))
      .attr('y1', yScale(tempObj.temp))
      .attr('y2', yScale(tempObj.temp))
      .attr('class', `${tempObj.className}-line`)
      .attr('stroke-width', 1)
      .attr('stroke', 'steelblue');

    lineGroup.append('text')
      .attr('x', xScale(tempObj.index + 11 + (tempObj.index / csvData.length)))
      .attr('y', yScale(tempObj.temp))
      .attr('text-anchor', 'start')
      .attr('class', `${tempObj.className}-text`)
      .text(`${tempObj.title}: ${tempObj.temp}° on ${tempObj.date}`);
  }

  minMax.forEach((temp) => drawMinMax(temp));
}

function createPrecipChart() {
  const height = window.innerHeight * 0.25;
  const width = window.innerWidth;
  const barWidth = width / csvData.length;
  const margin = {
    top: 0,
    right: 20,
    bottom: 40,
    left: 40,
  };

  const svg = select('body').append('svg').attr('width', width).attr('height', height);

  // x-axis label
  svg.append('text')
    .attr('class', 'axis-label')
    .attr('x', (width - margin.left) / 2)
    .attr('y', height - 5)
    .text(csvData[0].date.split('-')[2]);

  const xScale = scaleLinear()
    .domain([0, csvData.length])
    .range([margin.left, width + barWidth - margin.right]);

  const yScalePrecip = scaleLinear()
    .domain([0, 8.5])
    .range([height - margin.bottom, margin.top]);

  const precipLine = line().curve(curveBumpX)
    .x((d) => xScale(d[0]))
    .y((d) => yScalePrecip(d[1]));

  function drawPrecipLine(array) {
    svg.append('text')
      .attr('x', xScale(array[array.length - 1][0] - 1))
      .attr('y', yScalePrecip(array[array.length - 1][1] + 0.5))
      .attr('text-anchor', 'end')
      .text(`${array[array.length - 1][1].toFixed(2)} in`);
    svg.append('path')
      .data([array])
      .attr('d', precipLine)
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('fill', 'none');
  }

  const formatNewDate = (mmDDyyyy) => {
    const dateArray = mmDDyyyy.split('-');
    return new Date(`${dateArray[1]}-${dateArray[0]}-${dateArray[2]}`);
  };

  const dateScale = scaleTime()
    .domain([formatNewDate(csvData[0].date), formatNewDate(csvData[csvData.length - 1].date)])
    .range([margin.left, width + barWidth - margin.right]);

  let xAxis = svg.select('.x-axis');
  if (xAxis.empty()) {
    xAxis = svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(axisBottom(dateScale).tickFormat(timeFormat('%b')));
  } else {
    xAxis.attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(axisBottom(dateScale).tickFormat(timeFormat('%b')));
  }

  // y-axis label
  svg.append('text')
    .attr('class', 'axis-label')
    .text('Precip. In.')
    .attr('transform', `translate(5,${(height / 2) - margin.bottom}) rotate(90)`)
    .attr('x', 0)
    .attr('y', 0);

  let yAxis = svg.select('.y-axis');

  if (yAxis.empty()) {
    yAxis = svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(axisLeft(yScalePrecip));
  } else {
    yAxis.attr('transform', `translate(${margin.left}, 0)`)
      .call(axisLeft(yScalePrecip));
  }

  xAxis.selectAll('g.tick line')
    .attr('y2', height + 6)
    .attr('transform', `translate(0,-${height})`)
    .attr('stroke', 'lightgrey');

  yAxis.selectAll('g.tick line')
    .attr('x2', width - (margin.left + margin.right) + 10)
    .attr('transform', 'translate(-5,0)')
    .attr('stroke', 'lightgrey');

  let currentArray = [];
  let monthlyTotal = 0;
  let currentMonth;

  // We construct a per-month total of precip
  for (let i = 0; i < csvData.length; i += 1) {
    const { date, precip } = csvData[i];
    const currDate = date.split('-');
    const currMonYear = [currDate[1], currDate[2]].join('');
    if (currMonYear === currentMonth) {
      monthlyTotal += precip;
      currentArray.push([i + 1, monthlyTotal]);
    } else {
      if (currentArray.length > 0) {
        drawPrecipLine(currentArray);
        currentArray = [];
      }
      currentMonth = currMonYear;
      monthlyTotal = precip;
      currentArray.push([i + 1, monthlyTotal]);
    }
    if (i === csvData.length - 1) {
      drawPrecipLine(currentArray);
    }
  }
}

createChart();
createPrecipChart();
