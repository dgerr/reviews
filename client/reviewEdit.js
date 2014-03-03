Template.reviewEdit.events({
	 'submit form': function(e) {
		 e.preventDefault();

		 var currentreviewId = this._id;

		 var reviewProperties = {
			 rating: Session.get('rating'), //$(e.target).find('[name=rating]').val(),
			 body: $(e.target).find('[name=body]').val(),
			 anon: $(e.target).find('[name=anon]').checked

		 }

	 Reviews.update(currentreviewId, {$set: reviewProperties}, function(error) {

	 if (error) {
		 // display the error to the user
		 alert(error.reason);
		 } else {
//			commenting thhis out for now...
// var pathname = window.location.pathname;
			Session.set('rating',0);
//		 Router.go('reviewPage', {_id: currentreviewId});
			 }
		 });
	 },

	 'click .delete': function(e) {
	 e.preventDefault();
	 
	 if (confirm("Delete this review?")) {
		 var currentreviewId = this._id;
		 Reviews.remove(currentreviewId);
//		 Router.go('reviewsList');
		 }
	 }
});