var Table= {
	html : "",
	endMissing : false,
		size : 0,
	Table: function(headerArray,tableid, classArray){
		
		size= headerArray.length;
		this.html+="<table ";	
		this.html+="id=\""+ tableid + "\"";
		this.html+="class=\"";
		for(var i=0;i<classArray.length;i++){
			this.html+= classArray[i] + " ";
		}
		this.html+="\" >";
		
		this.html+="<tr>";
		for(var i=0;i<headerArray.length;i++){
			this.html+= "<th>";
			this.html+= headerArray[i];
			this.html+= "</th>";
		}
		this.html+="</tr>";
	},
	addEntry: function(entryArray){
		this.html+="<tr>";

		for(var i=0;i<size;i++){
			this.html+= "<td>";
			if(i<entryArray.length) this.html+= entryArray[i];
			this.html+= "</td>";
		}
		
		this.html+="</tr>";
	},
	toHTML: function(){
		if(this.endMissing) this.html+="</table>";
		return this.html;
	}

}

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
	
	//Make sure to sort the entrys in right order
	livefeed.sort(function(a,b){return b.id-a.id});

	//copy object
	var livefeedTable = jQuery.extend(true, {}, Table);

	//create table
	livefeedTable.Table(
			["#","Problem Title","name","verdict","Lang","Time"], 
			"livetable", 
			["table", "table-striped"]
	);

	//add entrys
	for(var i=0;i<livefeed.length;i++){
		var arr = new Array();

		arr.push(livefeed[i].id);
		
		arr.push(livefeed[i].problemid);

		arr.push( livefeed[i].name);

		arr.push( livefeed[i].verdict);

		arr.push( livefeed[i].language);

		arr.push( livefeed[i].time);

		livefeedTable.addEntry(arr);

	}

	//remove old table
	$("#livetable").remove();

	//make new
	$("#livefeed").append(livefeedTable.toHTML());

}

function update(){
	//Sort the array with regards to the accept count
	persons.sort(function(a,b){return b.count-a.count});

	var currentTime= new Date().getTime();

	var scoreboardTable= jQuery.extend(true,{},Table);
	scoreboardTable.Table(
		["#","Name","Last Accepted","Score","2d","7d","31d"],
		"scoreboardTable",
		["table","table-striped"]);


	//Forloop that runs through every person on the persons array, and build an entry in the table
	for(var i=0;i<persons.length;i++){

		var arr= new Array();

		//variable for last accepted
		var daysAgo= Math.floor(((currentTime/1000)-persons[i].lastSubmission)/(60*60*24))

		//make sure not negative
		if(daysAgo<0) daysAgo= 0;

			
		arr.push(i+1);
		arr.push("<a target=\"_blank\" href=\"http://uhunt.felix-halim.net/id/" + persons[i]["id"] + "\">" + persons[i]["userName"] + " ("+persons[i]["name"]+")</a>");
	arr.push(daysAgo + " days ago");
	arr.push(persons[i]["count"]);
	arr.push(persons[i]["twoDays"]);
	arr.push(persons[i]["week"]);
	arr.push(persons[i]["month"]);

	scoreboardTable.addEntry(arr);
		
	}

	//Remove old table
	$("#scoreboardTable").remove();

	//Create new
	$("#scoreboard").append(scoreboardTable.toHTML());
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
	
	for(var i=0;i<data["subs"].length;i++){
		var sub= {};
		sub.name=data["name"];
		sub.id= data["subs"][i][0];
		sub.problemid= data["subs"][i][1];
		sub.verdict= data["subs"][i][2];
		sub.language= data["subs"][i][5];
		sub.time= data["subs"][i][4];
		livefeed.push(sub);
	}

	updateLivefeed();
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
