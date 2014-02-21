Reviews = new Meteor.Collection("reviews");


Meteor.methods({
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

		review = _.extend(_.pick(reviewAttributes, 'postId', 'body'), {
			 userId: user._id,
			 author: user.username,
			 submitted: new Date().getTime()
		});

		 return Reviews.insert(review);
 	}
});

