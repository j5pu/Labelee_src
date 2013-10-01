// Global values
var floorsData = map_data['floors'];
var poisByCategory = {};
var poisPosition = {};
var currentFloorIdx = 0  // By default, floor 0 is loaded
var markerFloorIdx; // Floor in which the marker is displayed

var floorSelector;
var currentMap;
var targetMarker;
var categorySelector;
var elementSelector;
var img;

DEFAULT_FLOOR = 0;
MARKER_TOP_CORRECTION = 25;
MARKER_LEFT_CORRECTION = 6;
IMAGE_LOAD_TIMEOUT = 1500;

window.onload = function() {

    // Load global variables
    floorSelector = document.getElementById("floorSelector");
    currentMap = document.getElementById("currentMap");
    targetMarker = document.getElementById("targetMarker");
    categorySelector = document.getElementById("categorySelector");
    elementSelector = document.getElementById("elementsByCategorySelector");
    img = document.getElementById("currentMap");

    for (i=0; i < floorsData.length; i++){
        if (floorsData[i].floor_number == DEFAULT_FLOOR){
            currentFloorIdx = i;
            break;
        }
    }

    img.src = floorsData[currentFloorIdx].imgB;

    for (i=0; i < floorsData.length; i++){
        for (j=0; j < floorsData[i].pois.length; j++){

            var label_category = floorsData[i].pois[j].label.category.name_es; // Spanish for the moment

            // Show only menu categories
            if (floorsData[i].pois[j].label.category.is_visible_menu) {

                // Append description, add new category if necessary
                if (poisByCategory[label_category]) {
                    poisByCategory[label_category].push (floorsData[i].pois[j].description);
                } else {
                    poisByCategory[label_category] = [floorsData[i].pois[j].description];
                }

                // Save position and current floor
                poisPosition[floorsData[i].pois[j].description] = [floorsData[i].pois[j].center_x,
                                                                   floorsData[i].pois[j].center_y,
                                                                   i];
            }
        }
    }

    loadCategoriesSelector();
    loadFloorSelector();
    refreshElementsFromCategory();

    // Load default location when the image is ready (only the first time)
    img.onload = function() {
        locateInMap();
        img.onload = null;
    }

    window.addEventListener('resize', relocatePoint, false);

    floorSelector.value = currentFloorIdx;

}

relocatePoint = function() {
    targetMarker.style.display = 'none';

    // Timeout needed to allow the new image to render
    window.setTimeout(function(){

        // Check needed to avoid problems with 'resize' event
        if (markerFloorIdx == currentFloorIdx) {
            locateInMap();
        }
    }, IMAGE_LOAD_TIMEOUT)
}

loadCategoriesSelector = function() {

    for (var category in poisByCategory) {
        categorySelector.options[categorySelector.options.length] = new Option(category);
    }
}

loadFloorSelector = function() {

    for (i=0; i < floorsData.length; i++){
        floorSelector.options[floorSelector.options.length] = new Option(floorsData[i].floor_number, i);
    }

}

changeFloor = function() {

    currentFloorIdx = floorSelector.options[floorSelector.selectedIndex].value;
    currentMap.src = floorsData[currentFloorIdx].imgB;

    // Hide previous marker if we are in a different floor
    if (markerFloorIdx != currentFloorIdx){
        targetMarker.style.display = 'none';
    } else {
        targetMarker.style.display = 'inline';
    }

}

refreshElementsFromCategory = function() {

    var categorySelected = categorySelector.options[categorySelector.selectedIndex].text;
    elementSelector.options.length = 0

    if (categorySelected == "Todas"){
        for (categorySelected in poisByCategory){
            for (i=0; i < poisByCategory[categorySelected].length; i++){
                elementSelector.options[elementSelector.options.length] = new Option(poisByCategory[categorySelected][i]);
            }
        }
    } else {
        for (i=0; i < poisByCategory[categorySelected].length; i++){
            elementSelector.options[elementSelector.options.length] = new Option(poisByCategory[categorySelected][i]);
        }
    }

    locateInMap();
}


locateInMap = function() {

    var elementSelected = elementSelector.options[elementSelector.selectedIndex].text;

    // Change to the corresponding floor
    floorSelector.value = poisPosition[elementSelected][2];
    changeFloor();

    var leftPos = poisPosition[elementSelected][1] * img.width / floorsData[currentFloorIdx].num_cols - MARKER_LEFT_CORRECTION;
    var topPos = (floorsData[currentFloorIdx].num_rows - poisPosition[elementSelected][0]) *
        img.height / floorsData[currentFloorIdx].num_rows - MARKER_TOP_CORRECTION;

    targetMarker.style.left = leftPos + 'px';
    targetMarker.style.top = topPos + 'px';
    targetMarker.style.display = 'inline';

    markerFloorIdx = currentFloorIdx;

}