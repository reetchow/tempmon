let data;

let socket = io.connect('http://' + document.domain + ':' + location.port + '/');
console.log(document.domain, location.port);
socket.on('connect', function() {
  socket.emit( 'connection', {
    data: 'Connected'
  })
});

socket.on('init-data', function( msg ) {
  console.log(msg);
  data = msg;
  graph();
});

socket.on('update-data', (newPoint) => {
  console.log(newPoint);
  data.pop();
  cleanData(newPoint);
  data.unshift(newPoint);
  update();
  console.log(data);
});

// D3 Graph Code

// set the dimensions and margin of the graph
let margin = {top: 20, right: 20, bottom: 20, left: 50},
width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

// parse the date / time
let parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

// set the ranges
let x = d3.scaleTime().range([0, width]);
let y = d3.scaleLinear().range([height, 0]);
let z = d3.scaleLinear().range([height, 0]);

// define the temperature line
let valueline = d3.line() // temperature line
  .x(function(d) { 
    return x(d.date); 
  })
  .y(function(d) { 
    return y(d.temperature);
  });

let humidityline = d3.line()
  .x(function(d) {
    return x(d.date);
  })
  .y(function(d) {
    return z(d.humidity);
  });

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
let svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// format the data
function cleanData(d) {
  d.date = parseTime(d.time);
  d.temperature = +d.temperature;
  d.humidity = +d.humidity;
}

function setDomain() {
  // Scale the range of the data
  x.domain(d3.extent(data, (d) => { return d.date; }));
  let bounds = d3.extent(data, (d) => { return d.temperature; });
  bounds[0] = Math.round(bounds[0]) - 5;
  bounds[1] = Math.round(bounds[1]) + 5;
  y.domain(bounds);
  //recycling bounds for z axis
  bounds = d3.extent(data, (d) => { return d.humidity; });
  bounds[0] = Math.round(bounds[0]) - 5;
  bounds[1] = Math.round(bounds[1]) + 5;
  z.domain(bounds);
}

function graph() {
  data.forEach(cleanData);

  setDomain(); 
  // d3.max(data, (d) => { return d.temperature; })]);

  // Add the temperature valueline path.
  svg.append("path")
    .data([data])
    .attr("class", "line")
    .attr("d", valueline);

  // Add the humidity valueline path
  svg.append("path")
    .data([data])
    .attr("class", "line2")
    .attr("d", humidityline);

  // Add the X Axis
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add the Y Axis
  svg.append("g")
    .call(d3.axisLeft(y));

  // Second Y Axis (Z axis for humidity)
  svg.append("g")
    .attr("transform", "translate(" + width + ", 0)")
    .call(d3.axisRight(z));
}

function update() {
  data.forEach(cleanData);

  setDomain();

  let svg = d3.select('body').transition();

  svg.select('.line')
    .duration(750)
    .attr('d', valueline(data));

  svg.select('.line2')
    .duration(750)
    .attr('d', humidityline(data));
  
  svg.select('.x.axis')
    .duration(750)
    .call(d3.axisBottom(x));

  svg.select('.y.axis')
    .duration(750)
    .call(d3.axisLeft(y));

  svg.select('.z.axis')
    .duration(750)
    .call(d3.axisRight(z));
}