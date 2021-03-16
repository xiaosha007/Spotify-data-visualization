
const showBubbleChart = () =>{
    var svg = d3.select("#bubbleChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");
    d3.csv("spotify_dataset/data_w_genres.csv").then(data=>{
        let genresCount = {}
        for(let d of data){
            genres = d.genres.replace("[",'').replace("]",'').replace(/'/g, '').split(",");
            // console.log(genres);
            genres.forEach(genre=>{
                if(!(genre in genresCount) || genre ===""){
                    // console.log(genre)
                    genresCount[genre] = 0;
                }
                else genresCount[genre] += 1
                
            })
        }
        genresCount = Object.keys(genresCount).map(key => {
            return {name:key,value:genresCount[key]*2}
        })
        delete genresCount['']; 
        genresCount = genresCount.sort((a,b)=>b.value-a.value).splice(0,50);
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
        const treeData = {name:"parent",children:genresCount,value:100,opacity_val:0};
        var packLayout = d3.pack();
        packLayout.size([ width , height ]);
        packLayout.padding( 5 );
        var root = d3.hierarchy(treeData)
        root.sum(function(d) {
            return d.value;
        });

        var colorScale = d3.scaleOrdinal(d3.schemePiYG[10])
        packLayout(root)
        
        var nodes = svg
            .selectAll( 'g' )
            .data(root.descendants())
            .enter()
            .append( 'g' )
            .attr( 'transform' , function (d) { return 'translate(' + [d.x, d.y] + ')' })
            .attr('fill-opacity',(d)=>{
                return d.data.opacity_val
            })
            .style("fill", function(d, i ) {
                return colorScale(d.data.name[0]); 
            });
        nodes
            .append( 'circle' )
            .attr( 'r' , function (d) { return d.r; })
            
        nodes
            .append( 'text' )
            .text( function (d) {
                return d.children === undefined ? d.data.name : '' ;
            }).style("fill",'white')
    })
}
