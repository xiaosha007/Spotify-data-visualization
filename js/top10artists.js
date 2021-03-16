// append the svg object to the body of the page
const showTop10Artists = (data) =>{
	var modal = document.getElementById("myModal");
	var span = document.getElementById("closeSongDetails");
	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
		modal.style.display = "none";
		document.getElementsByTagName("body")[0].style.overflow = "auto";
	}
	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
			document.getElementsByTagName("body")[0].style.overflow = "auto";
		}
	}
	var svg = d3.select("#topNartists")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform","translate(" + margin.left + "," + margin.top + ")");
	var tooltip = d3.select("body").append("div").attr("class", "toolTip");
	var slider = document.getElementById("myRange");
	var output = document.getElementById("year");
	output.innerHTML = slider.value; // Display the default slider value
	let isArtists = true;
	let year = "all";
	let topN = 20;
			
	// Update the current slider value (each time you drag the slider handle)
	slider.oninput = function() {
		output.innerHTML = this.value;
		year = this.value;
		document.getElementById("top10Title").innerText = `Top 10 ${isArtists?"Artists":"Songs"} based on Popularity in Year ${year}`
		updateData(year,isArtists,topN);
	}
	var artistOrYearInput = document.getElementById("artistOrYear")
	artistOrYearInput.onchange = function(){
		isArtists = this.value==="Artist"?true:false;
		document.getElementById("top10Title").innerText = `Top ${topN} ${isArtists?"Artists":"Songs"} based on Popularity in Year ${year}`
		updateData(year,isArtists,topN)
	}
	var nTopResultInput = document.getElementById("nTopResult")
	nTopResultInput.onchange = function(){
		topN = this.value
		document.getElementById("top10Title").innerText = `Top ${topN} ${isArtists?"Artists":"Songs"} based on Popularity in Year ${year}`
		updateData(year,isArtists,topN)
	}
	var allYearCheckInput = document.getElementById("topN_showAllYears")
	allYearCheckInput.onclick = function(){
		document.getElementById("top10Title").innerText = `Top ${topN} ${isArtists?"Artists":"Songs"} based on Popularity from 1920 to 2020`
		slider.value = '2020';
		output.innerHTML = slider.value;
		updateData('all',isArtists,topN)
	}
	const marginLeft = 80;
	const targetColumn = "popularity";
	var x = d3.scaleLinear()
		.range([0, width-100])
		.domain([0, 100]);
	
	// add the x Axis
	svg.append("g")
		.attr("id","x-axis")
		.attr("transform", `translate(${marginLeft},${height})`)
		.call(d3.axisBottom(x))
		.append("text")
		.attr("fill","white")
		.attr("x",width/2 - 50)
		.attr("y",30)
		.text(targetColumn[0].toUpperCase()+ targetColumn.slice(1))
	
	// add the y Axis
	svg.append("g")
		.attr("id","y-axis")



	const updateData = (year="all",topArtist=true,newTopN=20) =>{
		let tempData = year==="all"?data:data.filter(i=>i.year === year.toString());
		let mainData = null;
		if(topArtist) mainData = _.chain(tempData.filter(d=>d.artists.split(",").length===1)).groupBy("artists")
							.map((value, key) => {
								const totalTargetColumn = value.reduce((accumualte,currentValue)=>{
									return accumualte+currentValue[targetColumn]
								},0)/value.length
								let result = {name: key.replace("[","").replace("]","").replace(/'/g, '')};
								result[targetColumn] = totalTargetColumn.toFixed(2)
								result["details"] = value
								return result;
							})
							.value();
		else mainData = tempData.map(temp=>{
			return {
				name:temp.name,
				popularity:temp.popularity,
				artists:temp.artists
			}
		});
		const topNData = mainData.sort((a,b)=>{
			return b[targetColumn]-a[targetColumn]
		}).slice(0, newTopN);
		artistNameCount = {};
		topNData.forEach(d=>{
			if(d['name'] in artistNameCount){
				artistNameCount[d['name']] ++;
			}
			else artistNameCount[d['name']] = 0;
		});
		topNData.forEach((d,index)=>{
			if(artistNameCount[d.name]>0){
				topNData[index]['name'] = topNData[index]['name'] +"("+ index.toString()+")";
			}
		})
		topNData.sort(function(a, b) {
			return d3.ascending(a[targetColumn], b[targetColumn])
		});
		var y = d3.scaleBand()
			.range([height, 0])
			.padding(0.1).domain(topNData.map(function(d) { return d['name']; }));
		// add the y Axis
		svg.select("#y-axis")
			.attr("transform", `translate(${marginLeft},0)`)
			.call(d3.axisLeft(y))
			.selectAll(".tick text")

		 var bar= svg.selectAll(".bar").data(topNData)
			
		 bar.enter().append("rect").merge(bar)
			.attr("class", "bar")
			.attr("x", function(d) { return 1; })
			.attr("width", function(d) {return x(d[targetColumn]); } )
			.attr("y", function(d) { return y(d['name']); })
			.attr("height", y.bandwidth())
			.attr("transform", `translate(${marginLeft},0)`)
			.on("mouseover", function() { tooltip.style("display", null); })
			.on("mousemove", function(d){
				tooltip
					.style("left", d3.event.pageX+5 + "px")
					.style("top", d3.event.pageY+5 + "px")
					.style("display", "inline-block")
					.html((d.name) + "<br>" + "Popularity:" + (d.popularity));
			})
			.on("mouseout", function(d){ tooltip.style("display", "none");})
			.on("click",(d)=>{
				if(d.details){
					modal.style.display = "block";
					document.getElementById("modalTitle").innerText = "SongLists";
					songList = d.details.map((detail)=>detail.name);
					songList = songList.join("\n")
					document.getElementById("songDetailsText").innerText = songList;
					document.getElementsByTagName("body")[0].style.overflow = "hidden";
				}else if(d.artists){
					modal.style.display = "block";
					artists = d.artists.replace("[","").replace("]","").replace(/'/g, '').split(",");
					artists = artists.join("\n");
					document.getElementById("modalTitle").innerText = "Artists";
					document.getElementById("songDetailsText").innerText = artists;
					document.getElementsByTagName("body")[0].style.overflow = "hidden";
				}
			});
			
		bar.exit().remove()
	}
	updateData(year,true,20)

}
