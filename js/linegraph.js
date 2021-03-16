
const showMusicPropertiesLine = () => {

    var svg = d3.select("#musicproperties")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");

    d3.csv("spotify_dataset/data_by_year.csv").then(function(data) {
        
        // console.log(data);
        var parseDate = d3.timeParse("%Y");
        data.forEach(function(d) {
            d.year = parseDate(d.year);
            d['popularity'] = +d['popularity'];
            d["acousticness"] = +d["acousticness"];
            d["duration_ms"] = +d["duration_ms"];
            d['energy'] = +d['energy'];
            d['explicit'] = +d['explicit'];
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
        const lineGraphWidth = width-100;
        var x = d3.scaleTime()
            .range([0, lineGraphWidth]);

        var y = d3.scaleLinear()
            .range([height, 0]);

        var xAxis = d3.axisBottom()
            .scale(x);

        var yAxis = d3.axisLeft()
            .scale(y);

        listOfTargets = ['danceability', 'liveness','valence','acousticness','energy','instrumentalness','speechiness']

        x.domain(d3.extent(data, function(d) { return d.year; }));
        y.domain([0, d3.max(data, function(d) {return Math.max(d.danceability, d.liveness,d.valence,d.acousticness,d.energy,d.instrumentalness,d.speechiness); })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("y",30)
        .attr("x",lineGraphWidth/2)
        .attr("fill",'white')
        .text("Year");
    
        const color = d3.scaleOrdinal(d3.schemeCategory10).domain(listOfTargets)
        for(const target of listOfTargets){
            var line = d3.line()
                .x(function(d) { return x(d.year); })
                .y(function(d) { return y(d[target]); });
            path = svg.append("path").datum(data)
            path.merge(path)
                .attr("class", "line")
                .attr("id",target)
                .attr("d", line)
                .attr("stroke",color(target))
        }

        svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x",-height/2 + 40)
        .attr("fill",'white')
        .style("text-anchor", "end")
        .text("Attribute");

        var focus = svg.append("g")
		.attr("class", "focus")
		.style("display", "none");

        focus.append("line").attr("class", "lineHover")
            .style("stroke", "#999")
            .attr("stroke-width", 1)
            .style("shape-rendering", "crispEdges")
            .style("opacity", 0.5)
            .attr("y1", -height)
            .attr("y2",0);
        
        focus.append("text").attr("class", "lineHoverDate")
            .attr("text-anchor", "middle")
            .attr("font-size", 12)
            .attr("fill","white");

        var overlay = svg.append("rect")
            .attr("class", "overlay")
            .attr("width", lineGraphWidth)
            .attr("height", height)

        tooltip(data)
        audioLegend()
        

      // Start Animation on Click

      d3.select("#start").on("click", function() {
        for(const target of listOfTargets){
            var line = d3.line()
                .x(function(d) { return x(d.year); })
                .y(function(d) { return y(d[target]); });
            path = svg.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("id",target)
                .attr("d", line)
                .attr("stroke",color(target))
            var totalLength = path.node().getTotalLength();
            path.attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition() // Call Transition Method
                .duration(4000) // Set Duration timing (ms)
                .ease(d3.easeLinear) // Set Easing option
                .attr("stroke-dashoffset", 0); // Set final value of dash-offset for transition
        }
      });

      // Reset Animation
      d3.select("#reset").on("click", function() {
        d3.selectAll(".line").remove();
      });
        

        function tooltip(copy) {
            var bisectDate = d3.bisector(d => d.year).left
            // var z = d3.scaleOrdinal(d3.schemeCategory10);
            var textContainer = focus.append("g").attr("id","textContainer")
            var labels = textContainer.selectAll(".lineHoverText").data(listOfTargets)

            labels.enter().append("text")
                .attr("class", "lineHoverText")
                .style("fill", d => color(d))
                .attr("text-anchor", "start")
                .attr("font-size",12)
                .attr("dy", (_, i) => 1 + i * 2 + "em")
                .merge(labels);

            var circles = focus.selectAll(".hoverCircle")
                .data(listOfTargets)

            circles.enter().append("circle")
                .attr("class", "hoverCircle")
                .style("fill", d => color(d))
                .attr("r", 4)
                .merge(circles);

            svg.selectAll(".overlay")
                .on("mouseover", function() { focus.style("display", null); })
                .on("mouseout", function() { focus.style("display", "none"); })
                .on("mousemove", mousemove);

            function mousemove() {

                var x0 = x.invert(d3.mouse(this)[0]),
                    i = bisectDate(data, x0, 1),
                    d0 = data[i - 1],
                    d1 = data[i],
                    d = x0 - d0.year > d1.year - x0 ? d1 : d0;
                focus.select(".lineHover")
                    .attr("transform", "translate(" + x(d.year) + "," + height + ")");

                focus.select(".lineHoverDate")
                    .attr("transform", 
                        "translate(" + x(d.year) + "," + (height+margin.bottom) + ")")
                    .text(d.year.getFullYear());
                focus.selectAll(".hoverCircle")
				.attr("cy", e =>y(d[e]))
				.attr("cx", x(d.year));

                focus.selectAll(".lineHoverText")
                    .attr("transform", 
                        "translate(" + (x(d.year)) + "," + height / 2.5 + ")")
                    .text(e => e+": "+d[e].toFixed(2))
                    .attr("font-weight",800);

                x(d.year) > (lineGraphWidth - lineGraphWidth / 4) 
                    ? focus.selectAll("text.lineHoverText")
                        .attr("text-anchor", "end")
                        .attr("dx", -10)
                    : focus.selectAll("text.lineHoverText")
                        .attr("text-anchor", "start")
                        .attr("dx", 10)
            }
        }

        function audioLegend(){
            var legend = svg.selectAll(".legend").data(listOfTargets)
            .enter().append("g")
            .attr('class','legend')
            .attr('transform',function(d,i){
                return "translate(0," + i * 20 + ")"; 
             });
             
             legend.append("rect")
             .attr("x",720)
             .attr("y",9)
             .attr("width",18)
             .attr("height",18)
             .style("fill", d => color(d))
             .on("mouseover",function(d,i){

                d3.selectAll(".line").style("opacity",0.15)

                svg.selectAll("#"+listOfTargets[i])
                 .style("opacity","100%");
                 
             })
             .on("mouseout",function(d,i){
                d3.selectAll(".line")
                // svg.selectAll("#"+listOfTargets[i])
                .style("opacity","100%");
             });

             legend.append("text")
             .style("fill","white")
             .attr("x",710)
             .attr("y",18)
             .attr("dy",".2em")
             .style("text-anchor","end")
             .style("font-size","12px")
             .style("opacity",0.8)
             .text(function(d,i){
                 return listOfTargets[i];
             })
        }
    });
}