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
            if (map.getZoom() >= 15 ){
                hardestHit.setStyle({'weight': 0.5});
                councilCounts.setStyle({'fillOpacity': 0})
            } else {
                hardestHit.setStyle({'weight': 0})
                councilCounts.setStyle({'fillOpacity': 0.3})
            }
        }
    });
    var info = L.control({position: 'bottomleft'});
    info.onAdd = function(map){
        this._div = L.DomUtil.create('div', 'council-info');
        return this._div;
    }
    info.update = function(councilFeature){
        if (typeof councilFeature !== 'undefined'){
            var blob = '<h3>' + councilFeature.properties['COUNCIL_NU'] + '</h3>';
            blob += '<p><strong>Hardest Hit properties: </strong>' + councilFeature.properties['COUNT'] + '</p>';
            $(this._div).html(blob);
        } else {
            $(this._div).empty();
            info.removeFrom(map);
        }
    }
    $.when($.getJSON('data/hardest_hit.geojson'), $.getJSON('data/council_counts.geojson')).then(
        function(hardest_hit, council_counts){
            councilCounts = L.geoJson(council_counts, {
                style: styleCouncils,
                onEachFeature: function(feature, layer){
                    layer.on('click', function(e){
                        map.setZoomAround(e.latlng, 16);
                    });
                    layer.on('mouseover', function(e){
                        info.addTo(map);
                        info.update(feature);
                    });
                    layer.on('mouseout', function(e){
                        info.update();
                    })
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
            "opacity": 0.5,
            "weight": 1,
            "fillOpacity": 0.3,
        }
        if (feature.properties['COUNT'] < 90){
            style['fillColor'] = "#a6dba0"
        }
        if (feature.properties['COUNT'] > 90 && feature.properties['COUNT'] < 200){
            style['fillColor'] = "#5aae61";
        }
        if (feature.properties['COUNT'] > 200){
            style['fillColor'] = "#1b7837";
        }
        return style;
    }
    function styleParcels(feature){
      // Style based upon ??
        var style = {
          "color": "#000",
          "weight": 0,
          "fillOpacity": 0.7,
          "fillColor": "#c2a5cf"
        }
        return style;
    }
    function parcelClick(feature, layer){
        layer.on('click', function(e){
            if(typeof lastClicked !== 'undefined'){
                hardestHit.resetStyle(lastClicked);
            }
            e.target.setStyle({'fillColor':"#762a83"});
            $('#info').html(parcelInfo(feature.properties));
            map.fitBounds(e.target.getBounds());
            lastClicked = e.target;
        });
    }
    function parcelInfo(properties){
        var blob = '<div><h3>' + properties['FULL_ADDRE'] + '</h3>';
        blob += '<p><strong>PIN: </strong>' + properties['PIN'] + '</p>';
        blob += '<p><strong>Deeded Owner: </strong>' + properties['DEEDED_OWN'] + '</p>';
        blob += '<p><strong>Back Taxes: </strong>' + accounting.formatMoney(properties['BACK_TAXES']) + '</p>';
        blob += '<p><strong>Property Status: </strong>' + properties['PROPERTY_S'] + '</p>';
        blob += '<p><strong>Demolition Estimate: </strong>' + accounting.formatMoney(properties['CITY_ESTIM']) + '</p>';
        blob += '<p><strong>Neighborhood: </strong>' + properties['NEIGHBORHO'] + '</p>';
        blob += '<p><strong>Council District: </strong>' + properties[' COUNCIL_D'] + '</p>';
        blob += '</div>';
        return blob
    }
})()
