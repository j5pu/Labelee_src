/**
 * Created with PyCharm.
 * User: josemanuelduque
 * Date: 7/31/13
 * Time: 10:47 AM
 * To change this template use File | Settings | File Templates.
 */

/*
var data=[
            {
                key: "Cumulative Return",
                values: [
                    {
                    "label" : "Connections" ,
                    "value" : 129.765957771107
                    } ,
                    {
                        "label" : "Toilets" ,
                        "value" : 200
                        } ,
                    {
                        "label" : "Restaurants" ,
                        "value" : 32.807804682612
                        } ,
                    {
                        "label" : "Shops" ,
                        "value" : 196.45946739256
                        } ,
                    {
                        "label" : "Bars" ,
                        "value" : 124.34030906893
                        } ,
                    {
                        "label" : "Cinema" ,
                        "value" : 98.079782601442
                        } ,
                    {
                        "label" : "Leisure" ,
                        "value" : 13.925743130903
                        } ,
                    {
                        "label" : "Parking" ,
                        "value" : 51.387322875705
                        }
]
}
],


data3=[
            {
                key: "Cumulative Return",
                values: [
                {
                "label": "One",
                "value" : 29.765957771107
                } ,
                    {
                        "label": "Two",
                        "value" : 0
                        } ,
                    {
                        "label": "Three",
                        "value" : 32.807804682612
                        } ,
                    {
                        "label": "Four",
                        "value" : 196.45946739256
                        } ,
                    {
                        "label": "Five",
                        "value" : 0.19434030906893
                        } ,
                    {
                        "label": "Six",
                        "value" : 98.079782601442
                        } ,
                    {
                        "label": "Seven",
                        "value" : 13.925743130903
                        } ,
                    {
                        "label": "Eight",
                        "value" : 5.1387322875705
                        }
]
}
];
*/



//FUNCION BASE COMUN

function drawGraph(svgId, chartType, data) {


    nv.addGraph(function() {
        var chart = chartType
            //chartType==nv.models.discreteBarChart()
            .x(function(d) { return d.label })
.y(function(d) { return d.value })
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
    totalScans=scansByCat,
    totalRoutes = dashBoardResource.getDisplayedRoutesByCategory(16),
    routesByCat= totalRoutes,
    topScans= dashBoardResource.getScansForTopPois(16),
    topRoutes=dashBoardResource.getDisplayedRoutesForTopPois(16);

//TOTAL SCANS
nv.addGraph(function() {
    var chart = nv.models.discreteBarChart()
    .x(function(d) { return d.label })
.y(function(d) { return d.value })
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
nv.addGraph(function() {
    var chart = nv.models.discreteBarChart()
    .x(function(d) { return d.label })
.y(function(d) { return d.value })
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


//SCANS BY CATEGORIES
nv.addGraph(function() {
    var chart = nv.models.pieChart()
        .x(function (d) {
            return d.label
        })
        .y(function (d) {
            return d.value
        })
        //.labelThreshold(-.03)
        //.showLabels(true)
        .donut(true);
/*

       var chart = nv.models.pieChart()
           .x(function(d) { return d.key })
           //.y(function(d) { return d.value })
           .values(function(d) { return d })
           //.labelThreshold(.08)
           //.showLabels(false)
           .donut(true);

       chart.pie
           .startAngle(function(d) { return d.startAngle/2 -Math.PI/2 })
           .endAngle(function(d) { return d.endAngle/2 -Math.PI/2 });
*/

    chart.pie.donutLabelsOutside(true);
d3.select("#chart2")
.datum(scansByCat)
.transition().duration(1200)
.call(chart);

return chart;
});

//ROUTES BY CATEGORIES
nv.addGraph(function() {
    var chart = nv.models.pieChart()
    .x(function(d) { return d.label })
.y(function(d) { return d.value })
//.color(d3.scale.category20().range())
.showLabels(true);


d3.select("#chart3")
.datum(routesByCat)
.transition().duration(1200)
.call(chart);

return chart;
});


//5 TOP SCANS
nv.addGraph(function() {
    var chart = nv.models.discreteBarChart()
    .x(function(d) { return d.label })
.y(function(d) { return d.value })
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
nv.addGraph(function() {
    var chart = nv.models.discreteBarChart()
    .x(function(d) { return d.label })
.y(function(d) { return d.value })
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
