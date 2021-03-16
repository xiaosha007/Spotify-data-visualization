
const showSongCount = (data) =>{
    var modal = document.getElementById("myModal");
    const updateSelectBox = (yearSelected) =>{
        let artistNameList = []
        data.forEach(d=>{
            if(!artistNameList.includes(d.artists) && d.artists.split(",").length==1 && yearSelected===d.year.toString())
                artistNameList.push(d.artists)
		});
        const selectHTMLGenerator = artistNameList.sort((a,b)=>a-b).map(name=>{
            let displayName = name.replace("[","").replace("]","").replace(/'/g, '')
            displayName = displayName[0].toUpperCase()+ displayName.slice(1)
            displayName = displayName.length<10?displayName:displayName.slice(0,10)+"..."
            return `<option value="${name}">${displayName}</option>`
        });
        document.getElementById("artistsSelection").innerHTML = selectHTMLGenerator.join(",");
        $('.selectpicker').selectpicker('refresh');
    }
    var svg = d3.select("#songCount")
        .append("svg")
        .attr("width", width-200 + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");
    
    var selectBox = document.getElementById("artistsSelection");	
    selectBox.onchange = function() {
        selected_val = $('.selectpicker').selectpicker('val')
        updateByArtists(selected_val);
    }

    d3.select("#artist_allYearCheck").on("click", function() {
        updateByArtists(['all']);
    });


    var artistYearInput = document.getElementById("artistsYear");
    artistYearInput.onchange = function(){
        updateSelectBox(this.value.toString());
    }
    let artistYear = "2000";
    updateSelectBox(artistYear);
    var parseDate = d3.timeParse("%Y");
    startYear = 1920
    const songCountData = [...Array(101).keys()].map(year=>{
        year+=startYear
        songList = data.filter(details=>details.year.toString() === year.toString())
        count = songList.length
        return {year:parseDate(songList[0].year),count,songList}
    });
    var x = d3.scaleTime().range([0, width-200]);
    var xAxis = d3.axisBottom().scale(x);
    var y = d3.scaleLinear().range([height, 0]);
    var yAxis = d3.axisLeft().scale(y);
    var tooltip = d3.select("body").append("div").attr("class", "toolTip");
    x.domain(d3.extent(songCountData, function(d) { return d.year; }));
    
    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("y",30)
        .attr("x",width/2)
        .attr("fill",'white')
        .text("Year");
    
    svg.append("g")
        .attr("id", "songCount-yaxis")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x",-height/2 + 40)
        .attr("fill",'white')
        .style("text-anchor", "end")
        .text("Song count");
    
    function updateByArtists(artistName=["all"]){
        showRadarChart(artistName)
        d3.selectAll(".songCount-line").remove();
        d3.selectAll(".myline").remove();
        d3.selectAll(".mycircle").remove();
        startYear = 1920
        const color = d3.scaleOrdinal(d3.schemeCategory10).domain(artistName);
        includeAll = artistName.includes('all');
        let fullSongData = []
        for(let artist of artistName){
            const songCountData = [...Array(101).keys()].map(year=>{
                year+=startYear
                let songList = null;
                if(!includeAll)
                    songList = data.filter(details=>details.year.toString() === year.toString() && details.artists === artist)
                else songList = data.filter(details=>details.year.toString() === year.toString());
                count = songList.length
                return {year:parseDate(year),count,songList,artist}
            });
            fullSongData.push(songCountData);
            if(includeAll) break;
        }
        const allCounts = fullSongData.map(a=>a.map(b=>b.count)).flat();
        y.domain([0, d3.max(allCounts)]);
        svg.select("#songCount-yaxis").call(yAxis);
        for(let fullSongCount of fullSongData){
            const name = fullSongCount[0].artist
            var line = d3.line().x(function(d) { return x(d.year); })
                            .y(function(d) { return y(d.count); });

            fullSongCount = fullSongCount.filter(d=>d.count>0);
            svg.selectAll("myline")
                .data(fullSongCount)
                .enter()
                .append("line")
                .attr("x1",function(d){return x(d.year);})
                .attr("x2",function(d){return x(d.year);})
                .attr("y1",function(d){return y(d.count);})
                .attr("y2",function(d){return y(0);})
                .attr("stroke",color(name))
                .attr("class", "myline");

            svg.selectAll("mycircle")
                .data(fullSongCount)
                .enter()
                .append("circle")
                .attr("cx",function(d){return x(d.year);})
                .attr("cy",function(d){return y(d.count);})
                .attr('r', 3)
                .attr("stroke","white")
                .attr('fill',color(name))
                .attr("class", "mycircle")
                .on("mouseover", function(d){
                    d3.select(this).attr("r", 5);
                    var thisartist = d.artist;
                    let this_artist = thisartist.replace("[","").replace("]","").replace(/'/g, '')
                    tooltip
                        .style("left", d3.event.pageX+5 + "px")
                        .style("top", d3.event.pageY+5 + "px")
                        .style("display", "inline-block")
                        .html(this_artist+" ("+d.year.getFullYear()+")<br>Song count: "+(d.count));
                })
                .on("mouseout", function(){
                    d3.select(this).attr("r", 3);
                    tooltip.style('display', 'none');
                })
                .on("click",(d)=>{
                    if(d.songList && d.songList.length>0){
                        modal.style.display = "block";
                        document.getElementById("modalTitle").innerText = "SongLists";
                        // songList = d.songList.map((detail)=>(detail.name + " - " + detail.artists.replace("[","").replace("]","").replace(/'/g, '')));
                        songList = d.songList.map((detail)=>(detail.name));
                        songList = songList.join("\n")
                        document.getElementById("songDetailsText").innerText = songList;
                        document.getElementsByTagName("body")[0].style.overflow = "hidden";
                    }
                });

        }
       
    };

    updateByArtists()

}
