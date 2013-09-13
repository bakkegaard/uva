//Array for persons to be looked up at init
var usernames= new Array("bakkegaard","casper91","Bettedaniel","KentG");

//Array for persons
var persons= new Array();

function update(){
	//Sort the array with regards to the accept count
	persons.sort(function(a,b){return b.count-a.count});

	//the begining of the table
	var start="<table id=\"table\" class=\"table table-striped\"> <tr> <th>#</th> <th>Name</th> <th>Score</th> </tr>", end="</table>";

	//Forloop that runs through every person on the persons array, and build an entry in the table
	for(var i=0;i<persons.length;i++){
		start+= "<tr>";
		
		start+= "<td>";
		start+= i+1;
		start+= "</td>";

		start+= "<td>";
		start+= "<a target=\"_blank\" href=\"http://uhunt.felix-halim.net/id/" + persons[i]["id"] + "\">" + persons[i]["userName"] + " ("+persons[i]["name"]+")</a>";
		start+= "</td>";

		start+= "<td>";
		start+= persons[i]["count"];
		start+= "</td>";
		
		start+="</tr>";
	}

	start+= end;

	//Remove old table
	$("#table").remove();

	//Create new
	$("#input").after(start);
}

function buildPerson(data, id){
	//Create empty object
	var temp={};

	temp.name= data["name"];
	temp.userName= data["uname"];
	temp.accept= new Array()
	temp.count= 0;
	temp.vissible= true;
	temp.id= id;

	//Run through the JSON and build an array of acceptet submissions
	for(var i=0;i< data["subs"].length;i++){
		if(data["subs"][i][2]===90){
			if(temp.accept.indexOf(data["subs"][i][1])==-1){
				temp.accept.push(data["subs"][i][1]);
				temp.count++;
			}

		}

	}
	
	//Add newly created person to the persons array
	persons.push(temp);

	//Call update function to build the table again
	update();

}

function getData(username){
	
	//URL for getting user id
	var s="http://uhunt.felix-halim.net/api/uname2uid/"+ username;

	//Make ajax call, getting id
	$.ajax({
		url: s
		}).done(function(id){
			//When id is returned, make call for info

			//URL for getting userinfo
			var s= "http://uhunt.felix-halim.net/api/subs-user/" + id;

			$.ajax({
			url: s
			}).done(function ( data ) {

				//When info is returned, call buildPerson on info
				buildPerson(data, id);
			})
		})
};


//Add persons from username array
for(var i=0;i<usernames.length;i++){
	getData(usernames[i]);
}

$(function(){
	//If enter is pressed when courser is in the input field
	$("#input").keydown(function (e) {
    if (e.keyCode == 13) {
		 //Get data an add person
       getData($("#input").val());

		 //Remove text in field
		 $("#input").val("");
    }
	});
})



