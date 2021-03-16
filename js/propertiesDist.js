const showPropertiesDist = (data) =>{

    let targetProperty = "danceability";
    let nBins = 100;

    let selectBox = document.getElementById("propertiesSelection");
    let listOfTargets = ['danceability', 'liveness','valence','acousticness','energy','instrumentalness','speechiness']
    const selectHTMLGenerator = listOfTargets.map(name=>{
        displayName = name[0].toUpperCase()+ name.slice(1)
        return `<option value="${name}">${displayName}</option>`
    });
    selectBox.innerHTML = selectHTMLGenerator;
    selectBox.onchange = function() {
        targetProperty = this.value
        update(nBins,targetProperty);
    }

    var svg = d3.select("#propertiesDist")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");
    var tooltip = d3.select("body").append("div").attr("class", "toolTip");

    var x = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return d[targetProperty] })])
            .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Y axis: initialization
    var y = d3.scaleLinear().range([height, 0]);
    var yAxis = svg.append("g")

    // A function that builds the graph for a specific value of bin
    function update(nBin,targetProperty) {
        // set the parameters for the histogram
        var histogram = d3.histogram()
            .value((d)=>d[targetProperty])   // I need to give the vector of value
            .domain(x.domain())  // then the domain of the graphic
            .thresholds(x.ticks(nBin)); // then the numbers of bins
        // And apply this function to data to get the bins
        var bins = histogram(data);
        // Y axis: update now that we know the domain
        console.log(bins[0])
        y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
        yAxis.transition()
            .duration(1000)
            .call(d3.axisLeft(y));

        // Join the rect with the bins data
        var u = svg.selectAll("rect").data(bins)

        // Manage the existing bars and eventually the new ones:
        u.enter()
            .append("rect") // Add a new rect for each new elements
            .merge(u) // get the already existing elements as well
            .on("mouseover",function(d){
                d3.select(this).style("fill", "#800080");
                tooltip
                .style("left", d3.event.pageX+5 + "px")
                .style("top", d3.event.pageY+5 + "px")
                .style("display", "inline-block")
                .html("Number of Songs<br> " +(d.length));
            })
            .on("mouseout", function(d){
                d3.select(this).style("fill", "#33ffb1");
                tooltip.style("display", "none");

            })
            .transition() // and apply changes to all of them
            .duration(1000)
            .attr("x", 1)
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
            .attr("width", function(d) { return x(d.x1) - x(d.x0) ; })
            .attr("height", function(d) {
                return height - y(d.length); })
            .style("fill", "#33ffb1");

        // If less bar in the new histogram, I delete the ones not in use anymore
        u.exit().remove()
    }
    // Initialize with 20 bins
    update(nBins,targetProperty)
    // Listen to the button -> update if user change it
    d3.select("#nBin").on("input", function() {
        console.log(this.value)
        nBins = this.value
        update(+nBins,targetProperty);
    });
    


}