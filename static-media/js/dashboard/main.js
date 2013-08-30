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


function rotate_x_labels(chart) {
    chart.xAxis.rotateLabels(-45);
    chart.margin({bottom: 120, left: 60});
}

//
//SCANS BY CATEGORY
nv.addGraph(function () {
    var chart = nv.models.discreteBarChart()
        .x(function (d) {
            return d.label
        })
        .y(function (d) {
            return d.value
        })
        .tooltips(true)
        .showValues(true);
    chart.yAxis
        .tickFormat(d3.format('d'));
    chart.valueFormat(d3.format('d'));

    rotate_x_labels(chart);

    d3.select('#chart0')
        .datum(scansByCategory)
        .transition().duration(500)
        .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
});


//
//ROUTES BY CATEGORY
var testChart = null;
nv.addGraph(function () {
    var chart = nv.models.discreteBarChart()
        .x(function (d) {
            return d.label
        })
        .y(function (d) {
            return d.value
        })
        .tooltips(true)
        .showValues(true);
    chart.yAxis
        .tickFormat(d3.format('d'));
    chart.valueFormat(d3.format('d'));


    rotate_x_labels(chart);

    d3.select('#chart1')
        .datum(routesByCategory)
        .transition().duration(500)
        .call(chart);

    nv.utils.windowResize(chart.update);
    testChart = chart;

    return chart;
});


//
// PIE CHARTS:
//
var myColors = [];
for (var i in scansByCategory[0].values) {
    myColors.push(scansByCategory[0].values[i].color)
}
d3.scale.myColors = function () {
    return d3.scale.ordinal().range(myColors);
};
//
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
    chart.valueFormat(d3.format('d'));
    chart.pie.donutLabelsOutside(false);
    d3.select("#chart2")
        .datum(scansByCategory)
        .transition().duration(1200)
        .call(chart);

    return chart;
});
//
//ROUTES BY CATEGORIES
nv.addGraph(function () {
    var chart = nv.models.pieChart()
            .x(function (d) {
                return d.label
            })
            .y(function (d) {
                return d.value
            })
            .showLabels(false)
            .color(d3.scale.myColors().range());
    chart.valueFormat(d3.format('d'));
    d3.select("#chart3")
        .datum(routesByCategory)
        .transition().duration(1200)
        .call(chart);

    return chart;
});


//
// TOP SCANS BY POI
nv.addGraph(function () {
    var chart = nv.models.discreteBarChart()
        .x(function (d) {
            return d.label
        })
        .y(function (d) {
            return d.value
        })
        .tooltips(true)
        .showValues(true);
    chart.yAxis
        .tickFormat(d3.format('d'));
    chart.valueFormat(d3.format('d'));
    rotate_x_labels(chart);

    d3.select('#chart4')
        .datum(topScansByPoi)
        .transition().duration(500)
        .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
});

//
// TOP ROUTES BY POI
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
        .tooltips(true)
        .showValues(true);
    chart.yAxis
        .tickFormat(d3.format('d'));
    chart.valueFormat(d3.format('d'));
    rotate_x_labels(chart);

    d3.select('#chart5')
        .datum(topRoutesByPoi)
        .transition().duration(500)
        .call(chart);

    nv.utils.windowResize(chart.update);

//    rotate_x_labels(chart, '#chart5');
//    chart.xAxis.rotateLabels(-45);
    return chart;
});
