const showRadarChart = (artistNameList = []) => {
    d3.select("#reset1").on("click", function() {
        $('.selectpicker').val([]).trigger('change');
        // data.length === 0;
    });

    const max = Math.max;
    const sin = Math.sin;
    const cos = Math.cos;
    const HALF_PI = Math.PI / 2;
    d3.csv("spotify_dataset/data_by_artist.csv").then(function(data){
        console.log(artistNameList);
        artistNameList = artistNameList.map(name=>name.replace("[","").replace("]","").replace(/'/g, '').toLowerCase())
        data = data.filter(d=>artistNameList.includes(d.artists.toLowerCase()))
        data.forEach(function(d) {
            d['popularity'] = +d['popularity'];
            d["acousticness"] = +d["acousticness"];
            d["duration_ms"] = +d["duration_ms"];
            d['energy'] = +d['energy'];
            d['instrumentalness'] = +d['instrumentalness'];
            d['key'] = +d['key'];
            d['liveness'] = +d['liveness'];
            d['loudness'] = +d['loudness'];
            d['mode'] = +d['mode'];
            d['speechiness'] = +d['speechiness'];
            d['tempo'] = +d['tempo'];
            d['valence'] = +d['valence'];
            d['danceability'] = +d['danceability'];
    
        });


        var dataa=[]
        if(data.length === 0){
            dataa.push({
                name:"No artist selected",
                axes:[
                    {axis:"danceability",value:100},
                    {axis:"liveness",value:100},
                    {axis:"valence",value:100},
                    {axis:"acousticness",value:100},
                    {axis:"energy",value:100},
                    {axis:"instrumentalness",value:100},
                    {axis:"speechiness",value:100}
                ]
            })
        }else{
            data.forEach(function(d,i) {
                dataa[i]= {
                    name:d.artists,
                    axes:[
                        {axis:"danceability",value:d.danceability*100},
                        {axis:"liveness",value:d.liveness*100},
                        {axis:"valence",value:d.valence*100},
                        {axis:"acousticness",value:d.acousticness*100},
                        {axis:"energy",value:d.energy*100},
                        {axis:"instrumentalness",value:d.instrumentalness*100},
                        {axis:"speechiness",value:d.speechiness*100}
                    ]
                }
            });
        }
        var threedata = dataa


        
        console.log(threedata)
        var radarChartOptions2 = {
            w: 600,
            h: 350,
            margin: margin,
            maxValue: 60,
            levels: 6,
            roundStrokes: false,
            color: d3.scaleOrdinal(d3.schemeCategory10),
            format: '.0f',
            legend: { title: 'Artist name', translateX: 0, translateY: 0 },
            unit: '%'
        };
        
        // Draw the chart, get a reference the created svg element :
        let svg_radar2 = RadarChart("#radarChart2", threedata, radarChartOptions2);
    });
    
    const RadarChart = function RadarChart(parent_selector, data, options) {


        //Wraps SVG text - Taken from http://bl.ocks.org/mbostock/7555321
        const wrap = (text, width) => {
          text.each(function() {
                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.4, // ems
                    y = text.attr("y"),
                    x = text.attr("x"),
                    dy = parseFloat(text.attr("dy")),
                    tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em").style("fill","#FFFFFF");
    
                while (word = words.pop()) {
                  line.push(word);
                  tspan.text(line.join(" "));
                  if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word).style("fill","#FFFFFF");
                  }
                }
          });
        }//wrap
    
        const cfg = {
            w: 400,				//Width of the circle
            h: 400,				//Height of the circle
            margin : {top: 50, right: 30, bottom: 50, left: 60}, //The margins of the SVG
            levels: 3,				//How many levels or inner circles should there be drawn
            maxValue: 0, 			//What is the value that the biggest circle will represent
            labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
            wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
            opacityArea: 0.35, 	//The opacity of the area of the blob
            dotRadius: 4, 			//The size of the colored circles of each blog
            opacityCircles: 0.1, 	//The opacity of the circles of each blob
            strokeWidth: 2, 		//The width of the stroke around each blob
            roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
            color: d3.scaleOrdinal(d3.schemeCategory10),	//Color function,
            format: '.2%',
            unit: '',
            legend: false
        };
        var tooltip = d3.select("body").append("div").attr("class", "toolTip");

        //Put all of the options into a variable called cfg
        if('undefined' !== typeof options){
          for(var i in options){
            if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
          }//for i
        }//if
    
        //If the supplied maxValue is smaller than the actual one, replace by the max in the data
        // var maxValue = max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
        let maxValue = 0;
        for (let j=0; j < data.length; j++) {
            for (let i = 0; i < data[j].axes.length; i++) {
                data[j].axes[i]['id'] = data[j].name;
                if (data[j].axes[i]['value'] > maxValue) {
                    maxValue = data[j].axes[i]['value'];
                }
            }
        }
        maxValue = max(cfg.maxValue, maxValue);
        // console.log(data[0])
        const allAxis = data[0].axes.map((i, j) => i.axis),	//Names of each axis
            total = allAxis.length,					//The number of different axes
            // radius = 130,
            radius = Math.min(cfg.w/2, cfg.h/2)-20, 	//Radius of the outermost circle
            Format = d3.format(cfg.format),			 	//Formatting
            angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"
    
        //Scale for the radius
        const rScale = d3.scaleLinear()
            .range([0, radius])
            .domain([0, maxValue]);
    
        /////////////////////////////////////////////////////////
        //////////// Create the container SVG and g /////////////
        /////////////////////////////////////////////////////////
        const parent = d3.select(parent_selector);
    
        //Remove whatever chart with the same id/class was present before
        parent.select("svg").remove();
    
        //Initiate the radar chart SVG
        let svg = parent.append("svg")
                .attr("width",  width-300 + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("class", "radar");
    
        //Append a g element
        let g = svg.append("g")
                .attr("transform", "translate(" + (cfg.margin.left+230) + "," + (cfg.h/2 + cfg.margin.top) + ")");
                // .attr("transform","translate(" + margin.left + "," + margin.top + ")");
                /////////////////////////////////////////////////////////
        ////////// Glow filter for some extra pizzazz ///////////
        /////////////////////////////////////////////////////////
    
        //Filter for the outside glow
        let filter = g.append('defs').append('filter').attr('id','glow'),
            feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
            feMerge = filter.append('feMerge'),
            feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
            feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');
    
        /////////////////////////////////////////////////////////
        /////////////// Draw the Circular grid //////////////////
        /////////////////////////////////////////////////////////
    
        //Wrapper for the grid & axes
        let axisGrid = g.append("g").attr("class", "axisWrapper");
    
        //Draw the background circles
        axisGrid.selectAll(".levels")
           .data(d3.range(1,(cfg.levels+1)).reverse())
           .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", d => radius / cfg.levels * d)
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", cfg.opacityCircles)
            .style("filter" , "url(#glow)");
    
        //Text indicating at what % each level is
        axisGrid.selectAll(".axisLabel")
           .data(d3.range(1,(cfg.levels+1)).reverse())
           .enter().append("text")
           .attr("class", "axisLabel")
           .attr("x", 4)
           .attr("y", d => -d * radius / cfg.levels)
           .attr("dy", "0.4em")
           .style("font-size", "10px")
           .attr("fill", "#FFFFFF")
           .text(d => Format(maxValue * d / cfg.levels) + cfg.unit);
    
        /////////////////////////////////////////////////////////
        //////////////////// Draw the axes //////////////////////
        /////////////////////////////////////////////////////////
    
        //Create the straight lines radiating outward from the center
        var axis = axisGrid.selectAll(".axis")
            .data(allAxis)
            .enter()
            .append("g")
            .attr("class", "axis");
        //Append the lines
        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => rScale(maxValue *1.1) * cos(angleSlice * i - HALF_PI))
            .attr("y2", (d, i) => rScale(maxValue* 1.1) * sin(angleSlice * i - HALF_PI))
            .attr("class", "line")
            .style("stroke", "white")
            .style("stroke-width", "2px");
    
        //Append the labels at each axis
        axis.append("text")
            .attr("class", "legend")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", (d,i) => rScale(maxValue * cfg.labelFactor) * cos(angleSlice * i - HALF_PI))
            .attr("y", (d,i) => rScale(maxValue * cfg.labelFactor) * sin(angleSlice * i - HALF_PI))
            .text(d => d)
            .call(wrap, cfg.wrapWidth);
    
        /////////////////////////////////////////////////////////
        ///////////// Draw the radar chart blobs ////////////////
        /////////////////////////////////////////////////////////
    
        //The radial line function
        const radarLine = d3.radialLine()
            .curve(d3.curveLinearClosed)
            .radius(d => rScale(d.value))
            .angle((d,i) => i * angleSlice);
    
        if(cfg.roundStrokes) {
            radarLine.curve(d3.curveCardinalClosed)
        }
    
        //Create a wrapper for the blobs
        const blobWrapper = g.selectAll(".radarWrapper")
            .data(data)
            .enter().append("g")
            .attr("class", "radarWrapper");
    
        //Append the backgrounds
        blobWrapper
            .append("path")
            .attr("class", "radarArea")
            .attr("d", d => radarLine(d.axes))
            .style("fill", (d,i) => cfg.color(i))
            .style("fill-opacity", cfg.opacityArea)
            .on('mouseover', function(d, i) {
                //Dim all blobs
                parent.selectAll(".radarArea")
                    .transition().duration(200)
                    .style("fill-opacity", 0.1);
                //Bring back the hovered over blob
                d3.select(this)
                    .transition().duration(200)
                    .style("fill-opacity", 0.7);
            })
            .on('mouseout', () => {
                //Bring back all blobs
                parent.selectAll(".radarArea")
                    .transition().duration(200)
                    .style("fill-opacity", cfg.opacityArea);
            });
    
        //Create the outlines
        blobWrapper.append("path")
            .attr("class", "radarStroke")
            .attr("d", function(d,i) { return radarLine(d.axes); })
            .style("stroke-width", cfg.strokeWidth + "px")
            .style("stroke", (d,i) => cfg.color(i))
            .style("fill", "none")
            .style("filter" , "url(#glow)");
    
        //Append the circles
        blobWrapper.selectAll(".radarCircle")
            .data(d => d.axes)
            .enter()
            .append("circle")
            .attr("class", "radarCircle")
            .attr("r", cfg.dotRadius)
            .attr("cx", (d,i) => rScale(d.value) * cos(angleSlice * i - HALF_PI))
            .attr("cy", (d,i) => rScale(d.value) * sin(angleSlice * i - HALF_PI))
            .style("fill", (d) => cfg.color(d.id))
            .style("fill-opacity", 0.8);
    
        /////////////////////////////////////////////////////////
        //////// Append invisible circles for tooltip ///////////
        /////////////////////////////////////////////////////////
    
        //Wrapper for the invisible circles on top
        const blobCircleWrapper = g.selectAll(".radarCircleWrapper")
            .data(data)
            .enter().append("g")
            .attr("class", "radarCircleWrapper");
    
        //Append a set of invisible circles on top for the mouseover pop-up

        blobCircleWrapper.selectAll(".radarInvisibleCircle")
            .data(d => d.axes)
            .enter().append("circle")
            .attr("class", "radarInvisibleCircle")
            .attr("r", cfg.dotRadius * 1.5)
            .attr("cx", (d,i) => rScale(d.value) * cos(angleSlice*i - HALF_PI))
            .attr("cy", (d,i) => rScale(d.value) * sin(angleSlice*i - HALF_PI))
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", function(d){
                tooltip
                    .style("left", d3.event.pageX+5 + "px")
                    .style("top", d3.event.pageY+5 + "px")
                    .style("display", "inline-block")
                    .html(d.id+"<br>"+d.axis+"<br>"+(d.value.toFixed(2))+ cfg.unit);
            })
            .on("mouseout", function(){
                tooltip.style('display', 'none');
            });
    
        if (cfg.legend !== false && typeof cfg.legend === "object") {
            let legendZone = svg.append('g');
            let names = data.map(el => el.name);
            if (cfg.legend.title) {
                let title = legendZone.append("text")
                    .attr("class", "title")
                    .attr('transform', `translate(${cfg.legend.translateX},${cfg.legend.translateY})`)
                    .attr("x", 0)
                    .attr("y", 10)
                    .attr("font-size", "12px")
                    .attr("fill", "#FFFFFF")
                    .text(cfg.legend.title);
            }
            let legend = legendZone.append("g")
                .attr("class", "legend")
                .attr("height", 100)
                .attr("width", 100)
                .attr('transform', `translate(${cfg.legend.translateX},${cfg.legend.translateY + 20})`);
            // Create rectangles markers
            legend.selectAll('rect')
              .data(names)
              .enter()
              .append("rect")
              .attr("x", 0)
              .attr("y", (d,i) => i * 20)
              .attr("width", 10)
              .attr("height", 10)
              .style("fill", (d,i) => cfg.color(i));
            // Create labels
            legend.selectAll('text')
              .data(names)
              .enter()
              .append("text")
              .attr("x", 15)
              .attr("y", (d,i) => i * 20 + 9)
              .attr("font-size", "11px")
              .attr("fill", "#FFFFFF")
              .text(d => d);
        }
        return svg;
    }
    }