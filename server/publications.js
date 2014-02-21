Meteor.publish('profs', function() {
 return Profs.find();
});

Meteor.publish('reviews', function() {
 return Reviews.find();
});