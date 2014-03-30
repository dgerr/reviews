//APPARENTLY this is not allowed on the server: github.com/meteor/meteor/issues/1868
/*
Deps.autorun(function() {
 console.log('There are ' + Profs.find().count() + ' professors entered.');
});
*/

//move to clients/main.js
if (Meteor.isClient) {
  Meteor.startup(function() {
      Session.set("sort_order", {name: 1, rating: -1});
      Session.set('selected_dept', 'Select...');
  });

  Meteor.subscribe('profs');
  Meteor.subscribe('reviews');


  Template.reviews.title = function() {
    if (Session.get("sort_order") != undefined)
      return "Sorted by " + Object.keys( Session.get("sort_order") )[0];
  }

  Template.reviews.profs = function () {
      var selected = Session.get('selected_dept'); //$('select#dropdown').val();
      if (selected == 'All')
        return Profs.find({}, {sort: Session.get("sort_order") });
      return Profs.find({dept: selected}, {sort: Session.get("sort_order") });
      
    };

  Template.reviews.events({
      'mouseenter .prof-link': function (e) {
        var $this = $(e.target); //METEORRRRR

        var professor = $this.children('div').children().children(".name").text();
    
        professor = professor.split(" ").join("-").toLowerCase();
        $this.attr('href', 'prof/'+professor);
      },

      'change select#dropdown': function(e){
        var selected = $(e.target).val();
//        console.log('selected: ', selected, '\t profs: ', Profs.find({dept: selected}).fetch());
        
        Session.set('selected_dept', selected);
//        Router.go('reviews', { data: Profs.find({dept: selected}) } );
        //Template.reviews.profs(); 
      },
 
      //'click button' too
      'click button': function(){ goSearch(); }
      ,

      'keydown #searchbar': function(e){
        if (e.which == 13) { goSearch(); } 
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

      if (intersect.length > 0) return true;
      return false; 
    }
  });

  Template.review.helpers({
    submittedText: function() {
      var today = new Date(this.submitted);
       return (today.getMonth()+1) + "-" + today.getDate() + "-" + today.getFullYear(); //toString();
  },

    starHelper: function(){
      var review = Reviews.find({_id: this._id}).fetch()[0];
      var rating = parseInt(review.rating); 
      return Array(rating+1).join('★');      
    },

    authorHelper: function(){
      /* var newAnon = jQuery.extend({}, Session.get('anon'));
      console.log('newAnon: ', newAnon);

      if (newAnon) { 
        console.log('anon?? ', Session.get('anon'));
        setTimeout(function(){ 
          console.log('Resetting Session one second later!');
          Session.set('anon', undefined);
        }, 1000);
        return 'Anonymous';
      } */

      var review = Reviews.find({_id: this._id}).fetch()[0];

     console.log('Review: ', review);
     console.log('Review.anon: ', review.anon);

//     console.log('this: ', this);
//     console.log('this.anon: ', this.anon);

//replaced 'this' w/'review' errwhere
      if (review.author != undefined && review.anon)
        return 'Anonymous User';
      else if (review.author != undefined) 
        return (review.author).split('@')[0];
      else
        return "Null User (Test)"
    },
    ownReview: function(){
      if (Meteor.user()._id == this.userId) {
        return true; 
      }

    }
  });

  Template.review.events({
    'click .edit-review-link': function(e){
       $(e.target).toggleClass("green");
      $(e.target).parent('li').children('.text-of-review').slideToggle(600);
      setTimeout(function(){
          $('.edit-form').toggle(600);
        }, 300);
//      $(e.target).next('.edit-form').toggle(600); //unhide hidden Edit node!

      //add the star ratings....
      var current_rating = $(e.target).parents('li').find('span.rating')[0].outerText.split(' ')[1];
      console.log("current rating: ", current_rating);
      $('span.star').slice(0, current_rating).html('★').css('color','gold');

      Session.set('rating',current_rating); 

      //add anonymous...
      var is_anon = $(e.target).parents('li').find('span.author')[0].outerText.indexOf('Anonymous');
      if (is_anon != -1) //you are anon
          $('.edit-form input[name=anon]').prop('checked',true);

    },

    'click .delete' : function(e) {

//WORKS LIKE A CHARM
      if (confirm("Delete this review?")) {
         var currentreviewId = this._id;
         Reviews.remove(currentreviewId);
    //     Router.go('reviewsList');
         }
//       $(e.target).parent('.edit-form').toggle();
    }


  });

  Template.reviewEdit.events({
    'submit form' : function(e) {
       $(e.target).parent('.edit-form').toggle();
    }

  });

  Template.prof.helpers({
    reviewsCount: function() {
      return Reviews.find({postId: this._id}).count();
     },
     ratingHelper: function(){
        var rating = 0;
        var reviews = Reviews.find({postId: this._id}).fetch();
        if (reviews.length == 0) return 'Not yet rated';
        //else
        for (var i=0; i<reviews.length; i++)
          rating += reviews[i].rating;
        rating = rating / reviews.length;

        return rating + ' stars'; 
     }
  });

Template.reviewSubmit.events({
   'submit form': function(e, template) {
     e.preventDefault();

//     if ($(e.target).find('[name=anon]').prop('checked'))
//        Session.set('anon',true);
//     console.log('Submitted form. Value of Session.get(rating) is', Session.get('rating'));

     var $body = $(e.target).find('[name=body]');
     var $anon = $(e.target).find('[name=anon]');

     //var $rating = $(e.target).find('[name=rating]');
     var comment = {
       rating: Session.get('rating'), //$rating.val(),
       body: $body.val(),
       anon: $anon.prop('checked'),
       postId: template.data._id
       };

//    Session.set('most_recent_review', comment);
//    console.log('Changed m_r_r: ', Session.get('most_recent_review'));

     Meteor.call('review', comment, function(error, commentId) {
       if (error) throwError(error.reason);
       else {

        Session.set('rating', 0);
        console.log('New value of Session.get(rating) is', Session.get('rating'));
  //      $rating.val(0);
        $body.val('');
        $anon.prop('checked', false);
        $('.rating-text').html('');
      }
   });

   } //ends 'submit form' event
}); //ends reviewSubmit events


function updateReview(most_recent_review){
  if (most_recent_review == 0 || most_recent_review == undefined) {
    console.log('No overall ratings to update.');
    return; //do nothing
  }

  console.log('A review was just inserted!');
  console.log(most_recent_review);

  var prof = Profs.find({_id: most_recent_review.postId}).fetch();
  //console.log('prof: ', prof);
  var prof_reviews = Reviews.find({postId: most_recent_review.postId}).fetch();
  //console.log('prof_reviews: ', prof);

  var new_rating = 0;
  for (var i=0; i<prof_reviews.length; i++)
    new_rating += prof_reviews[i].rating;
  new_rating = new_rating / prof_reviews.length;
  
//  prof[0].rating = rating; 
  Profs.update(most_recent_review.postId, {$set: { rating: new_rating }}, function(error){
    if (error) alert(error.reason);
    else console.log('Success!');
  });
  console.log('prof[0].rating: ', prof[0].rating);
  
  };

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
      var names = [
                    ["Ada Lovelace", "CS"],
                    ["Grace Hopper", "BISC"],
                    ["Marie Curie", "CHEM"],
                    ["Carl Friedrich Gauss","PHYS"],
                    ["Nikola Tesla","PHYS"]
                  ];

      for (var i = 0; i < names.length; i++)
        Profs.insert({name: names[i][0], dept: names[i][1]}); //, rating: 0});
//        Profs.insert({name: names[i], rating: parseFloat(Random.fraction()*3 + 2).toFixed(1) });
    
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
    name: 'Stanley Chang', dept: "MATH" //,    rating: "3.5"
  });

  Reviews.insert({
    postId: changId,
    userId: tom._id,
    author: tom.profile.name,
    rating: 4.0,
    anon: true, 
    submitted: now - 5 * 3600 * 1000,
    body: 'Interesting project Sacha, can I get involved?'
  });

  Reviews.insert({
    postId: changId,
    userId: sacha._id,
    author: sacha.profile.name,
    anon: false,
    rating: 4.5,
    submitted: now - 3 * 3600 * 1000,
    body: 'You sure can Tom!'
  });

  }
 
  });
}

var goSearch = function(){
  var text = $('input#searchbar').val();
  var profname = text.split(" ").join("-").toLowerCase();
  Router.go( '/prof/' + profname );
};