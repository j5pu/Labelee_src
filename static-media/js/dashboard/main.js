
//FUNCION BASE COMUN

function drawGraph(svgId, chartType, data) {


    nv.addGraph(function () {
        var chart = chartType
            //chartType==nv.models.discreteBarChart()
            .x(function (d) {
                return d.label
            })
            .y(function (d) {
                return d.value
            })
            .staggerLabels(true)
            .tooltips(false)
            .showValues(true);

        d3.select(svgId)
            .datum(data)
            .transition().duration(500)
            .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
    });
}


var scansByCat = dashBoardResource.getScansByCategory(16),
    totalScans = scansByCat,
    totalRoutes = dashBoardResource.getDisplayedRoutesByCategory(16),
    routesByCat = totalRoutes,
    topScans = dashBoardResource.getScansForTopPois(16),
    topRoutes = dashBoardResource.getDisplayedRoutesForTopPois(16);

//TOTAL SCANS
nv.addGraph(function () {
    var chart = nv.models.discreteBarChart()
        .x(function (d) {
            return d.label
        })
        .y(function (d) {
            return d.value
        })
        .staggerLabels(true)
        .tooltips(false)
        .showValues(true);

    d3.select('#chart0')
        .datum(totalScans)
        .transition().duration(500)
        .call(chart);

    //chart.margin({top:0, right:0, bottom:0, left:-20});
    //chart.width(352);
    nv.utils.windowResize(chart.update);

    return chart;
});

//TOTAL ROUTES
nv.addGraph(function () {
    var chart = nv.models.discreteBarChart()
        .x(function (d) {
            return d.label
        })
        .y(function (d) {
            return d.value
        })
//.color(d3.scale.category20c().range())
        .staggerLabels(true)
        .tooltips(true)
        .showValues(true);

    d3.select('#chart1')
        .datum(totalRoutes)
        .transition().duration(500)
        .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
});

var myColors = [];
for (var i in scansByCat[0].values) {
    myColors.push(scansByCat[0].values[i].color)
}
d3.scale.myColors = function () {
    return d3.scale.ordinal().range(myColors);
};
//SCANS BY CATEGORIES
nv.addGraph(function () {
    var chart = nv.models.pieChart()
        .x(function (d) {
            return d.label
        })
        .y(function (d) {
            return d.value
        })
        //.labelThreshold(-.03)
        .showLabels(true)
        .color(d3.scale.myColors().range())
        //.color(['blue', 'green', 'yellow'])
        .donut(true);

    chart.pie.donutLabelsOutside(true);
    d3.select("#chart2")
        .datum(scansByCat)
        .transition().duration(1200)
        .call(chart);

    return chart;
});

//ROUTES BY CATEGORIES
nv.addGraph(function () {
    var chart = nv.models.pieChart()
            .x(function (d) {
                return d.label
            })
            .y(function (d) {
                return d.value
            })
//.color(d3.scale.category20().range())
            .showLabels(true)
            .color(d3.scale.myColors().range())
        ;


    d3.select("#chart3")
        .datum(routesByCat)
        .transition().duration(1200)
        .call(chart);

    return chart;
});


//5 TOP SCANS
nv.addGraph(function () {
    var chart = nv.models.discreteBarChart()
        .x(function (d) {
            return d.label
        })
        .y(function (d) {
            return d.value
        })
//.color(d3.scale.category20c().range())
        .staggerLabels(true)
        .tooltips(false)
        .showValues(true);

    d3.select('#chart4')
        .datum(topScans)
        .transition().duration(500)
        .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
});
//6 TOP ROUTES
nv.addGraph(function () {
    var chart = nv.models.discreteBarChart()
        .x(function (d) {
            return d.label
        })
        .y(function (d) {
            return d.value
        })
//.color(d3.scale.category10().range())
        .staggerLabels(true)
        .tooltips(false)
        .showValues(true);

    d3.select('#chart5')
        .datum(topRoutes)
        .transition().duration(500)
        .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
});
