//Array for persons to be looked up at init
var usernames= new Array("bakkegaard","casper91","Bettedaniel","KentG", "peterg", "Shorttail");

//Array for persons
var persons= new Array();

var livefeed= new Array();

function isInPersons(name){
	for(var i=0;i<persons.length;i++){
		//console.log(p["name"] + " "+ name);
		if(persons[i]["userName"]===name) return true;
	}
	return false;
}

function updateLivefeed(){
	var start="<table id=\"livetable\" class=\"table table-striped\"> <tr> <th>Problemt Title</th> <th>Name</th> <th>Verdict</th> <th>Lang</th> <th>Time</th></tr>", end="</table>";

	start+=end;
	$("#livefeed").append(start);

}

function update(){
	//Sort the array with regards to the accept count
	persons.sort(function(a,b){return b.count-a.count});

	var currentTime= new Date().getTime();

	//the begining of the table
	var start="<table id=\"table\" class=\"table table-striped\"> <tr> <th>#</th> <th>Name</th> <th>Last accepted</th> <th>Score</th> <th>2d</th> <th>7d</th><th>31d</th></tr>", end="</table>";

	//Forloop that runs through every person on the persons array, and build an entry in the table
	for(var i=0;i<persons.length;i++){

		//variable for last accepted
		var daysAgo= Math.floor(((currentTime/1000)-persons[i].lastSubmission)/(60*60*24))

		//make sure not negative
		if(daysAgo<0) daysAgo= 0;

		start+= "<tr>";
		
		start+= "<td>";
		start+= i+1;
		start+= "</td>";

		start+= "<td>";
		start+= "<a target=\"_blank\" href=\"http://uhunt.felix-halim.net/id/" + persons[i]["id"] + "\">" + persons[i]["userName"] + " ("+persons[i]["name"]+")</a>";
		start+= "</td>";

		start+= "<td>";
		start+=  daysAgo + " days ago"; 
		start+= "</td>";

		start+= "<td>";
		start+= persons[i]["count"];
		start+= "</td>";

		start+= "<td>";
		start+= persons[i]["twoDays"];
		start+="</td>";

		start+= "<td>";
		start+= persons[i]["week"];
		start+="</td>";

		start+= "<td>";
		start+= persons[i]["month"];
		start+="</td>";
		
		start+="</tr>";
	}

	start+= end;

	//Remove old table
	$("#table").remove();

	//Create new
	$("#scoreboard").append(start);
}

function buildPerson(data, id){
	//Create empty object
	var temp={};

	var currentTime= new Date().getTime()/1000;

	var twoDays= (currentTime)-(60*60*24*2)
	var week= (currentTime)-(60*60*24*7)
	var month= (currentTime)-(60*60*24*31)

	temp.name= data["name"];
	temp.userName= data["uname"];
	temp.accept= new Array()
	temp.count= 0;
	temp.vissible= true;
	temp.id= id;
	temp.lastSubmission=0;
	temp.twoDays=0;
	temp.week=0;
	temp.month=0;

	//Run through the JSON and build an array of acceptet submissions
	for(var i=0;i< data["subs"].length;i++){
		if(data["subs"][i][2]===90){
			
			//find last acceptet submission
			temp.lastSubmission= Math.max(data["subs"][i][4],temp.lastSubmission);

			if(temp.accept.indexOf(data["subs"][i][1])==-1){
				if(data["subs"][i][4]>month){
					temp.month++;
					if(data["subs"][i][4]>week){
						temp.week++;
						if(data["subs"][i][4]>twoDays) temp.twoDays++;
					}
				}
				temp.accept.push(data["subs"][i][1]);
				temp.count++;
			}

		}

	}

	//Add newly created person to the persons array
	persons.push(temp);

	//Call update function to build the table again
	update();

	var sub= {};


}

function getData(username){

	if(isInPersons(username)) return;

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

	updateLivefeed();

	//Make tabs work
	$('#myTab a').click(function (e) {
	  e.preventDefault()
	  $(this).tab('show')
	})

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
