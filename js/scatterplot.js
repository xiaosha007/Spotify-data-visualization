// append the svg object to the body of the page
const showScatterPlot = () =>{
	var svg = d3.select("#scatterplot")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform","translate(" + margin.left + "," + margin.top + ")");

	d3.csv("spotify_dataset/data.csv").then(function(data){
		/*------------process data-----------*/
		data.forEach(d=>{
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
		})
	});
}
