//Search for person, OR: browse by department. 

Session.set('rating_text', '');
Session.set('rating', 0);
//var rating_text = '';
//var rating = 0;

var starfunction = function(){

    $('span.star').mouseenter(function(){
    $(this).prevAll().andSelf().html('★').css('color','gold');//.css('opacity','0.5');
  });

  $('span.star').mouseleave(function(){
    $(this).prevAll().andSelf().css('color','black'); //.css("opacity","1");
    $('span.star').html('☆');
    $('span.star').slice(0, Session.get('rating')).html('★');
  //  $('span').slice(0, rating).html('★');
    
  });

  $('span.star').click(function(){
    $(this).prevAll().andSelf().html('★');
    $(this).nextAll().html('☆');

    Session.set('rating', $(this).index()+1); 
    Session.set('rating_text', 'Rating: <b>' + ($(this).index()+1) + ' stars</b>');
    $('.rating-text').html(Session.get('rating_text'));
//    $('div[name="rating"]').html(Session.get('rating'));

    //rating = $(this).index()+1;
    //rating_text = 'Rating: <b>' + ($(this).index()+1) + ' stars</b>';
     //$('.rating-text').html(rating_text);
  });

};


Template.reviewEdit.rendered = starfunction;
Template.reviewSubmit.rendered = starfunction;

//can run Deps.autorun if on client!
//Deps.autorun(function() {
 
 var autofunction = function(){
 console.log('There are ' + Profs.find().count() + ' professors entered.');

  var names = []; 
  var profs = Profs.find().fetch();
  for (var i=0; i < profs.length; i++){
    names.push( profs[i].name ); //.split(' ').slice(-1)[0] );
  }
  console.log('Names contains: ', names);
  $('#searchbar').attr('autocomplete','on');
  $('#searchbar').autocomplete({ source: names }); 
  console.log( 'name: ', $('#searchbar') );

};

Template.reviews.rendered = autofunction;