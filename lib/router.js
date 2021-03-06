Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() { return Meteor.subscribe('profs'); } 
});

Router.map(function() {
  this.route('reviews', { path: '/' } );

/*  this.route('reviews', {
    path: '/dept/:dept',
    data: function(){
      return Profs.find({ dept: this.params.dept })
    }
  }); */


/*  this.route('profPage', {
    path: '/prof/:_id',
    data: function() { return Profs.findOne(this.params._id); }
  }); 	*/

  this.route('profPage', {
    path: '/prof/:name',
    data: function() { 
    	var profName = toTitleCase(this.params.name.split("-").join(" "));
    	var findByName = Profs.findOne({name: profName});
    	//console.log(findByName);
    	return findByName;
//    	var findById = Profs.findOne(this.params._id);
//    	if (typeof findById !== "undefined")
//	    	Router.go('/prof/' + findById.name.replace(" ", "-").toLowerCase(), {replaceState: true});
    	}
  }); 	

});

Router.before(function() { clearErrors() });

//thanks StackOverflow
function toTitleCase(str) {
    return str.replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
}