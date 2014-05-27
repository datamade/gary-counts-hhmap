(function(){
    var hardestHit;
    var councilCounts;
    var lastClicked;
    var councolFeature;
    var map = L.map('map').fitBounds([[41.5204,-87.4381],[41.6278,-87.2198]]);
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/derekeder.hehblhbj/{z}/{x}/{y}.png', {
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
    }).addTo(map);
    map.on('zoomend', function(e){
        if (typeof hardestHit !== 'undefined'){
            if (map.getZoom() >= 14 ){
                map.removeLayer(councilCounts)
                map.addLayer(hardestHit)
            } else {
                map.addLayer(councilCounts)
                map.removeLayer(hardestHit)
            }
            var districtOutlineWeight = map.getZoom() * .4 - 3.8
            councilCounts.setStyle({'weight': districtOutlineWeight})
        }
    });
    $.when($.getJSON('data/hardest_hit_update.geojson'), $.getJSON('data/council_counts_update.geojson')).then(
        function(hardest_hit, council_counts){
            councilCounts = L.geoJson(council_counts, {
                style: styleCouncils,
                onEachFeature: function(feature, layer){
                    layer.on('click', function(e){
                        map.setZoomAround(e.latlng, 15);
                    });

                    var label_text = '<h3>' + feature.properties['COUNCIL_NU'] + '</h3>';
                    label_text += '<p><strong>Hardest Hit properties: </strong>' + feature.properties['COUNT'] + '</p>';
                    layer.bindLabel(label_text);
                    layer.on({
                        mouseover: highlightFeature,
                        mouseout: resetHighlight
                    });
                }
            }).addTo(map);

            //define hardestHit parcels but dont add to map
            hardestHit = L.geoJson(hardest_hit, {
                style: styleParcels,
                onEachFeature: parcelClick
            })
        }
    );

    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 5
        });

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
    }

    function resetHighlight(e) {
        councilCounts.resetStyle(e.target);
    }

    function styleCouncils(feature){
        var style = {
            "color": "#333",
            "opacity": 0.7,
            "weight": 1,
            "fillOpacity": 0.5,
        }
        if (feature.properties['COUNT'] < 97){
            style['fillColor'] = "#BDD7E7"
        }
        if (feature.properties['COUNT'] >= 97 && feature.properties['COUNT'] <= 200){
            style['fillColor'] = "#6BAED6";
        }
        if (feature.properties['COUNT'] > 200){
            style['fillColor'] = "#08519C";
        }
        return style;
    }
    function styleParcels(feature){
      // Style based upon ??
        var style = {
          "color": "#bd0026",
          "weight": 1,
          "fillOpacity": 0.7,
          "fillColor": "#f03b20"
        }
        return style;
    }
    function parcelClick(feature, layer){
        layer.on('click', function(e){
            if(lastClicked){
                lastClicked.setStyle({'fillColor':"#f03b20"});
            }
            e.target.setStyle({'fillColor':"#ffffb2"});
            $('#info').html(parcelInfo(feature.properties));
            map.setView(e.target.getBounds().getCenter(), 17);
            lastClicked = e.target;
        });
    }
    function parcelInfo(properties){
        var blob = '<div><h3>' + properties['FULL_ADDRE'] + '</h3>';
        blob += '<p><strong>PIN: </strong>' + properties['PIN'] + '</p>';
        blob += '<p><strong>Deeded Owner: </strong>' + properties['DEEDED_OWN'] + '</p>';
        blob += '<p><strong>Back Taxes: </strong>' + accounting.formatMoney(properties['BACK_TAXES']) + '</p>';
        blob += '<p><strong>Property Status: </strong>' + properties['PROPERTY_S'] + '</p>';
        blob += '<p><strong>Proposed End Use: </strong>' + properties['END_USE'] + '</p>';
        blob += '<p><strong>Demolition Estimate: </strong>' + accounting.formatMoney(properties['CITY_ESTIM']) + '</p>';
        blob += '<p><strong>Neighborhood: </strong>' + properties['NEIGHBORHO'] + '</p>';
        blob += '<p><strong>Council District: </strong>' + properties[' COUNCIL_D'] + '</p>';
        blob += '</div>';
        return blob
    }
})()
