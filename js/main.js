var margin = {top: 50, right: 50, bottom: 50, left: 60};
const finalWidth = 820;
const finalHeight = 550;
width = finalWidth - margin.left - margin.right,
height = finalHeight - margin.top - margin.bottom;

d3.csv("spotify_dataset/data.csv").then(data=>{
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
    showTop10Artists(data);
    showMusicPropertiesLine();
    showSongCount(data);
    showPropertiesDist(data);
    showRadarChart();
})