
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


var scansByCat = dashBoardResource.getScansByCategory(enclosure_id),
    totalScans = scansByCat,
    totalRoutes = dashBoardResource.getDisplayedRoutesByCategory(enclosure_id),
    routesByCat = totalRoutes,
    topScans = dashBoardResource.getScansForTopPois(enclosure_id),
    topRoutes = dashBoardResource.getDisplayedRoutesForTopPois(enclosure_id);


function rotate_x_labels(chart)
{
    chart.xAxis.rotateLabels(-45);
    chart.margin({bottom:120, left:60});
}

//TOTAL SCANS
nv.addGraph(function () {
    var chart = nv.models.discreteBarChart()
        .x(function (d) {
            return d.label
        })
        .y(function (d) {
            return d.value
        })
//        .staggerLabels(true)
        .tooltips(false)
        .showValues(true);

    rotate_x_labels(chart);
//    chart.xAxis.rotateLabels(x_axis_labels_rotation);
//    chart.margin({bottom:120, left:120});

    d3.select('#chart0')
        .datum(totalScans)
        .transition().duration(500)
        .call(chart);

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
//        .staggerLabels(true)
        .tooltips(true)
        .showValues(true);

    rotate_x_labels(chart);

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
        .labelThreshold(-.03)
        .showLabels(false)
        .color(d3.scale.myColors().range())
        //.color(['blue', 'green', 'yellow'])
        .donut(true);

//    chart.margin({left:0, top:100});

    chart.pie.donutLabelsOutside(false);
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
//        .staggerLabels(true)
        .tooltips(false)
        .showValues(true);

    rotate_x_labels(chart);

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
//        .staggerLabels(true)
        .tooltips(false)
        .showValues(true);

    rotate_x_labels(chart);

    d3.select('#chart5')
        .datum(topRoutes)
        .transition().duration(500)
        .call(chart);

    nv.utils.windowResize(chart.update);

//    rotate_x_labels(chart, '#chart5');
//    chart.xAxis.rotateLabels(-45);
    return chart;
});


//
//function rotate_x_labels(chart, chartId)
//{
////    chart.margin({bottom: 60});
//    var xTicks = d3.select(chartId).select('.nv-x.nv-axis > g').selectAll('g');
//    xTicks
//        .selectAll('text')
//        .style("text-anchor", "end")
//            .attr("dx", "-.8em")
//            .attr("dy", ".15em")
//            .attr("transform", function(d) {
//                return "rotate(-65)"
//            });
////        .attr('transform', function(d,i,j) { return 'translate (-10, 25) rotate(-45 0,0)' })
////        .attr('text-anchor', 'right');
//}

