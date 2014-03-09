//all of this stuff is only true from client side -- not from server side ... ?
// http://stackoverflow.com/questions/14547929/meteor-js-allow-deny-rules
Reviews.allow({
	 insert: function(userId, doc) {
		 // only allow posting if you are logged in
		 return !! userId;
	 },
	 update: function(userId, doc){
	 	//allow updating if you are logged in, AND it was your review originally
	 	return !! userId && (doc.userId == userId); 
	 },
	 remove: function(userId, doc){
	 	//allow updating if you are logged in, AND it was your review originally
	 	return !! userId && (doc.userId == userId); 
	 },
});

Meteor.methods({
	 appendTag: function(profAttributes, userId){
	 var prof = Profs.findOne(profAttributes.postId);
	 Profs.update(prof, { $addToSet: { invited: userId } });
	 },

	 review: function(reviewAttributes) {
		 var user = Meteor.user();
		 var prof = Profs.findOne(reviewAttributes.postId);
		 
		 // ensure the user is logged in
		if (!user)
			 throw new Meteor.Error(401, "You need to login to post a review");

		if (!reviewAttributes.rating)
			 throw new Meteor.Error(422, 'Please include a rating');

		if (reviewAttributes.rating > 5.0 || reviewAttributes.rating < 1.0 )
			 throw new Meteor.Error(422, 'Rating are on a 1-5 scale');
		
		if (!reviewAttributes.body)
			 throw new Meteor.Error(422, 'Please describe your experience');
		
		if (!prof)
			 throw new Meteor.Error(422, 'You must review a professor');

		review = _.extend(_.pick(reviewAttributes, 'postId', 'anon', 'rating', 'body'), {
			 userId: user._id,
			 author: user.emails[0].address,
			 submitted: new Date().getTime()
		});

		 return Reviews.insert(review);
 	}
});

