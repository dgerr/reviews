Profs = new Meteor.Collection("profs");

//soon!
Reviews = new Meteor.Collection("reviews"); //much like Comments


if (Meteor.isClient) {
  Meteor.startup(function() {
      Session.set("sort_order", {name: 1, rating: -1});
  });

  Template.reviews.title = function() {
    if (Session.get("sort_order") != undefined)
      return "Sorted by " + Object.keys( Session.get("sort_order") )[0];
  }

  Template.reviews.profs = function () {
      return Profs.find({}, {sort: Session.get("sort_order") });
    };

  Template.reviews.events({
      'mouseenter .prof-link': function (e) {
        var $this = $(e.target); //METEORRRRR

        var professor = $this.children().children(".name").text();
    
        professor = professor.replace(" ", "-").toLowerCase();
        $this.attr('href', 'prof/'+professor);
      },

      'click input.sort': function () {
        var sortOrder = Session.get("sort_order");
        var key = Object.keys(sortOrder)[0];

        if (key == "rating") {
          Session.set("sort_order",  {name: 1, rating: -1});
        }
        else { //it equals 1
          Session.set("sort_order", {rating: -1, name: 1});
        }

        $('.descr').text('Sorted by ' + key);

      }

    });


  Template.profPage.helpers({
    reviews: function() {
      return Reviews.find({postId: this._id});
    }
  });

  Template.review.helpers({
    submittedText: function() {
       return new Date(this.submitted).toString();
  }
  }) 

};


if (Meteor.isServer) {
  Meteor.startup(function() {   // code to run on server at startup
//   Profs.remove({});

/*  Reviews.insert({
    professor: 'Stanley Chang',
    dept: 'MATH',
    course: '307',
    rating: 5,
    author: 'dgerr',
    body: 'I really enjoyed this class and would recommend it!'
  });
*/

   if (Profs.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla"];

      for (var i = 0; i < names.length; i++)
        Profs.insert({name: names[i], rating: parseFloat(Random.fraction()*3 + 2).toFixed(1) });
    
  //TUTORIAL stuff. 
  // Fixture data 
  var now = new Date().getTime();

  // create two users
  var tomId = Meteor.users.insert({
    profile: { name: 'Tom Coleman' }
  });
  var tom = Meteor.users.findOne(tomId);
  
  var sachaId = Meteor.users.insert({
    profile: { name: 'Sacha Greif' }
  });
  var sacha = Meteor.users.findOne(sachaId);

  var changId = Profs.insert({
    name: 'Stanley Chang',
    rating: "3.5"
  });

  Reviews.insert({
    postId: changId,
    userId: tom._id,
    author: tom.profile.name,
    rating: 4.0, 
    submitted: now - 5 * 3600 * 1000,
    body: 'Interesting project Sacha, can I get involved?'
  });

  Reviews.insert({
    postId: changId,
    userId: sacha._id,
    author: sacha.profile.name,
    rating: 4.5,
    submitted: now - 3 * 3600 * 1000,
    body: 'You sure can Tom!'
  });


    }
 
  });
}