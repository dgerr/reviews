Profs = new Meteor.Collection("profs");

//soon!
//Reviews = new Meteor.Collection("reviews"); //much like Comments

//testing?
Deps.autorun(function() {
 console.log('There are ' + Profs.find().count() + ' professors entered.');
});

//move to clients/main.js
if (Meteor.isClient) {
  Meteor.startup(function() {
      Session.set("sort_order", {name: 1, rating: -1});
  });

  Meteor.subscribe('profs');
  Meteor.subscribe('reviews');

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
    },

    alreadyReviewed: function(){
      var arr1 = Reviews.find({postId: this._id}).fetch();
      var arr2 = Reviews.find({userId: Meteor.user()._id}).fetch();
      var intersect = _.intersectionObjects(arr1, arr2);

//      console.log('Did I already review?', intersect);

      if (intersect.length > 0) return true;
      return false; 
    }
  });

  Template.review.helpers({
    submittedText: function() {
      var today = new Date(this.submitted);
       return (today.getMonth()+1) + "-" + today.getDate() + "-" + today.getFullYear(); //toString();
  },
    authorHelper: function(){
      if (this.author != undefined) return (this.author).split('@')[0];
      return "Null User"
    },
    ownReview: function(){
      if (Meteor.user()._id == this.userId) {
//        console.log('It\'s your own review!');
        return true; 
      }

    }
  });

  Template.review.events({
    'click .edit-review': function(e){
      $(e.target).next('.edit-form').toggle(); //unhide hidden Edit node!
    }
  });

  Template.reviewEdit.events({
    'submit form' : function(e) {
       $(e.target).parent('.edit-form').toggle();
    },
    'click .delete' : function() {
       $(e.target).parent('.edit-form').toggle();
    }
  })

  Template.prof.helpers({
    reviewsCount: function() {
      return Reviews.find({postId: this._id}).count();
     }
  });

Template.reviewSubmit.events({
   'submit form': function(e, template) {
     e.preventDefault();

     console.log('Submitted form. Value of Session.get(rating) is', Session.get('rating'));

     var $body = $(e.target).find('[name=body]');
     //var $rating = $(e.target).find('[name=rating]');
     var comment = {
       rating: Session.get('rating'), //$rating.val(),
       body: $body.val(),
       postId: template.data._id
       };
   Meteor.call('review', comment, function(error, commentId) {
     if (error) throwError(error.reason);
     else {
      Session.set('rating', 0);
      console.log('New value of Session.get(rating) is', Session.get('rating'));
//      $rating.val(0);
      $body.val('');
      $('.rating-text').html('');
    }
   });
   }
});


};

//move to server/main.js
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