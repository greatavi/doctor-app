/**
 * Created by silencez on 7/12/17.
 */

var uniqueAreas = ["San Francisco", "Fremont", "Union City", "Palo Alto", "All Cities"];
var uniqueSpecialities = ["Cardiology", "Neurosurgeon", "Pediatrician", "Obstetrician", "All Specialities"];
var dataTable = null;
var selectedArea = null;
var selectedSpeciality = null;

// load all the data in html
function loadData() {

    //populate all doctors by default
    $.getJSON( "data.json" , function(result) {
        populateDoctorsListing(result.data);
    });

    //populate unique areas dropdown
    setupDropDownOptions(uniqueAreas, "areas");

    //populate unique specialities dropdown
    setupDropDownOptions(uniqueSpecialities, "specialities");

    //setup events
    setupAreaSelectionEventListener();
    setupSpecialitiesEventListener();
    setupDoctorSelectionEventListener();
}

//function to setup drop down options with given list and div id name
function setupDropDownOptions(uniqueList, divName) {
    for (index in uniqueList) {
        var li = document.createElement('li');
        li.id = index;
        var a = document.createElement('a');
        a.href = "#";
        a.innerHTML = uniqueList[index];
        li.appendChild(a);
        $("#" + divName).append(li);
    }
}


/** Doctors listing functions **/
//setup the doctors listing table with data
function populateDoctorsListing(dataSet) {
    if (dataTable != null)
        dataTable.rows().remove().draw(false);
    dataTable = $("#doctors-table").DataTable(
        {
            "aaData": dataSet,
            "info": false,
            "columns": [
                {"data": "name"},
                {"data": "speciality"},
                {"data": "area"},
                {"data": "rating"}
            ],
            "order": [[2, 'asc']]
        }
    );
    console.log("finished populating doctors listing");
}

//returns short form of doctor details div
function getShortDoctorDetails(data) {
    console.log(data);
    var detailsDiv = $("<div>").addClass("detail-content");
    var html = '<p><b>Name: </b>' + data.name + '</p>' +
        '<p><b>Speciality: </b>' + data.speciality + '</p>' +
        '<p><b>Address: </b>' + data.address + '</p>' +
        '<p><b>Phone: </b>' + data.phone + '</p>' +
        '<p><b>Full details: </b>' + '<a target="_blank" href="./doctor-details.html?id='+data.id+'">Link</a></p>';
    return detailsDiv.html(html);

}

function getFullDoctorDetails(allData, doctorId) {
    console.log("got full doc details");
    var data = allData.data[doctorId-1];
    console.log("doctor data:",data);
    var detailsDiv = $("<div>").addClass("detail-content");
    var html = '<p><b>Name: </b>' + data.name + '</p>' +
        '<p><b>Speciality: </b>' + data.speciality + '</p>' +
        '<p><b>Address: </b>' + data.address + '</p>' +
        '<p><b>Phone: </b>' + data.phone + '</p>';

    return detailsDiv.html(html);
}

//clears doctor details
function clearDoctorDetails() {
    $('[colspan="4"]').parent('tr').remove();
}

//displays doctors details
function displayDoctorDetails(row) {
    if (row.attr("class") === "doctor-details") {
        //just do nothing
    } else {
        //create details div and populate
        var data = dataTable.row(row).data();
        var doctorDetails = getShortDoctorDetails(data);
        row.after('<tr class="doctor-details"/>').next().append('<td colspan="4"/>').css('background','beige').children('td').append(doctorDetails);
    }
}


/** Events setup **/
//setup event listener  to listen to area selected event
function setupAreaSelectionEventListener() {
    $("#area-dropdown .dropdown-menu li a").click(function () {
        selectedArea = $(this).text();
        var selText = $(this).text();
        $(this).parents('.btn-group').find('.dropdown-toggle').html(selText + ' <span class="caret"></span>');
        clearDoctorDetails();
        dataTable.rows().every(function (rowIdx, tableLoop, rowLoop) {
            var data = this.data();
            if (selText !== "All Cities" && data.area !== selText) {
                this.node().style.display = "none";
            } else if (selectedSpeciality == null || selectedSpeciality == data.speciality) {
                this.node().style.display = "";
            }
        });
    });
}

function setupSpecialitiesEventListener() {
    $("#speciality-dropdown .dropdown-menu li a").click(function () {
        selectedSpeciality = $(this).text();
        var selText = $(this).text();
        $(this).parents('.btn-group').find('.dropdown-toggle').html(selText + ' <span class="caret"></span>');
        clearDoctorDetails();
        dataTable.rows().every(function (rowIdx, tableLoop, rowLoop) {
            var data = this.data();
            if (data.speciality !== selText && selText !== "All Specialities") {
                this.node().style.display = "none";
            } else if (selectedArea == null || selectedArea == data.area) {
                this.node().style.display = "";
            }
            // ... do something with data(), or this.node(), etc
        });
    });
}

//setup event listener  to listen to doctor selected event
function setupDoctorSelectionEventListener() {
    $("#doctors-table tbody").on('click', 'tr', function () {
        var row = $(this);
        clearDoctorDetails();
        //if selected doctor is clicked again, do not display details
        displayDoctorDetails(row);
        /*if ($('[colspan="4"]').parent('tr') !== row) {

        }*/
        //row.after('<tr/>').next().append('<td colspan="5"/>').css('background','#ffffff').children('td').append('<div/>').children().css('background','#ffffff','height','200px').html("yeah really");
    });
}

function loadDoctorFullDetails(doctorId){
    document.title = "doctor-"+doctorId;

    $.getJSON( "data.json" , function(result){
        if(doctorId>result.length){
            $(location).attr('href', './page-not-found.html');
        }
        populateDoctorsListing(result.data);
        setupDoctorSelectionEventListener();

        var doctorDetails= getFullDoctorDetails(result, doctorId);
        var selectedDoctor = result.data[doctorId-1];
        document.title = selectedDoctor.name;
        console.log("doctor selected data:",selectedDoctor);

        $('#doctor-full-details').append(doctorDetails);
        dataTable.rows().every(function (rowIdx, tableLoop, rowLoop) {
            var data = this.data();
            console.log("processing styles");
            if (selectedDoctor.area === data.area && selectedDoctor.speciality === data.speciality &&
            selectedDoctor.id !==data.id) {
                this.node().style.display = "";
            } else{
                this.node().style.display = "none";
            }
        });
        dataTable.order( [[ 3, 'desc' ], [ 0, 'asc' ]] )
            .draw(false);
    });


}
