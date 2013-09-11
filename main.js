var usernames= new Array("bakkegaard","casper91","Bettedaniel");
var persons= new Array();

function update(){
	persons.sort(function(a,b){return b.count-a.count});

	var start="<table id=\"table\" class=\"table table-striped\"> <tr> <th>#</th> <th>Name</th> <th>Score</th> </tr>", end="</table>";
	returnValue= start;
	for(var i=0;i<persons.length;i++){
		start+= "<tr>";
		
		start+= "<td>";
		start+= i+1;
		start+= "</td>";

		start+= "<td>";
		start+= persons[i]["userName"] + " ("+persons[i]["name"]+")";
		start+= "</td>";

		start+= "<td>";
		start+= persons[i]["count"];
		start+= "</td>";
		
		start+="</tr>";
	}

	start+= end;


	$("#table").remove();
	$("#input").after(start);

}

function buildPerson(data){

	var temp={};
	temp.name= data["name"];
	temp.userName= data["uname"];
	temp.accept= new Array()
	temp.count= 0;
	temp.active= true;

	for(var i=0;i< data["subs"].length;i++){
		if(data["subs"][i][2]===90){
			if(temp.accept.indexOf(data["subs"][i][1])==-1){
				temp.accept.push(data["subs"][i][1]);
				temp.count++;
			}

		}

	}
	persons.push(temp);
	update();

}

function getData(username){

	var s="http://uhunt.felix-halim.net/api/uname2uid/"+ username;
	$.ajax({
		url: s
		}).done(function(data){
			var s= "http://uhunt.felix-halim.net/api/subs-user/" + data;

			$.ajax({
			url: s
			}).done(function ( data ) {
				buildPerson(data);
			})
		})
};

for(var i=0;i<usernames.length;i++){
	getData(usernames[i]);
}

$(function(){
	$("#main").prepend("<h1>UVA scoreboard</h1>");

	$("#input").keydown(function (e) {
    if (e.keyCode == 13) {
       getData($("#input").val());
		 $("#input").val("");
    }
	});
})



