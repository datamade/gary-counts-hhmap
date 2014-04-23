(function(){
    var hardestHit;
    var councilCounts;
    var lastClicked;
    var map = L.map('map').fitBounds([[41.5204,-87.4381],[41.6278,-87.2198]]);
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/derekeder.hehblhbj/{z}/{x}/{y}.png', {
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
    }).addTo(map);
    $.when($.getJSON('data/hardest_hit.geojson'), $.getJSON('data/council_counts.geojson')).then(
        function(hardest_hit, council_counts){
            L.geoJson(council_counts, {
                style: styleCouncils,
                onEachFeature: function(feature, layer){
                    layer.on('click', function(e){
                      console.log(feature.properties)
                    });
                }
            }).addTo(map);
            hardestHit = L.geoJson(hardest_hit, {
                style: styleParcels,
                onEachFeature: parcelClick
            }).addTo(map);
        }
    );
    function styleCouncils(feature){
        var style = {
            "color": "#000",
            "weight": 1,
            "fillOpacity": 0.7,
        }
        if (feature.properties['COUNT'] < 90){
            style['fillColor'] = "#bdd7e7"
        }
        if (feature.properties['COUNT'] > 90 && feature.properties['COUNT'] < 200){
            style['fillColor'] = "#6baed6";
        }
        if (feature.properties['COUNT'] > 200){
            style['fillColor'] = "#2171b5";
        }
        return style;
    }
    function styleParcels(feature){
      // Style based upon ??
        var style = {
          "color": "#000",
          "weight": 0.5,
          "fillOpacity": 0.7,
          "fillColor": "#3182bd"
        }
        return style;
    }
    function parcelClick(feature, layer){
        layer.on('click', function(e){
            if(typeof lastClicked !== 'undefined'){
                hardestHit.resetStyle(lastClicked);
            }
            e.target.setStyle({'fillColor':"#b2182b"});
            $('#info').html(parcelInfo(feature.properties));
            map.fitBounds(e.target.getBounds());
            lastClicked = e.target;
        });
    }
    function parcelInfo(properties){
        var blob = '<div><h3>' + properties['FULL_ADDRE'] + '</h3>';
        blob += '<p><strong>PIN: </strong>' + properties['PIN'] + '</p>';
        blob += '<p><strong>Deeded Owner: </strong>' + properties['DEEDED_OWN'] + '</p>';
        blob += '<p><strong>Back Taxes: </strong>' + properties['BACK_TAXES'] + '</p>';
        blob += '<p><strong>Property Status: </strong>' + properties['PROPERTY_S'] + '</p>';
        blob += '<p><strong>Demolition Estimate: </strong>' + properties['CITY_ESTIM'] + '</p>';
        blob += '<p><strong>Neighborhood: </strong>' + properties['NEIGHBORHO'] + '</p>';
        blob += '<p><strong>Council District: </strong>' + properties[' COUNCIL_D'] + '</p>';
        blob += '</div>';
        return blob
    }
})()
