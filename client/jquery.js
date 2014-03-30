Session.set('rating_text', '');
Session.set('rating', 0);

var starfunction = function(){

    $('span.star').mouseenter(function(){
    $(this).prevAll().andSelf().html('★').css('color','green');//.css('opacity','0.5');
  });

  $('span.star').mouseleave(function(){

    $(this).prevAll().andSelf().css('color','#aaa'); //.css("opacity","1");
    $('span.star').html('☆');
    $('span.star').slice(0, Session.get('rating')).html('★').css('color','gold');
  //  $('span').slice(0, rating).html('★');
    
  });

  $('span.star').click(function(){
    $(this).prevAll().andSelf().html('★');
    $(this).nextAll().html('☆').css('color','#aaa');

    Session.set('rating', $(this).index()+1); 
    Session.set('rating_text', 'Rating: <b>' + ($(this).index()+1) + ' stars</b>');
    $('.rating-text').html(Session.get('rating_text'));


//    $('div[name="rating"]').html(Session.get('rating'));

  });

};

Template.profPage.rendered = function(){
    //testing

  //testing
  Session.set('rating',0);
  console.log('Rating reset to 0');

  $('.edit-form').hide();
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
  $('#searchbar').attr('autocomplete','on');
  $('#searchbar').autocomplete({ source: names }); 

};

var dropdown = function(){
  var sorted = Profs.find({}, {sort: {dept: 1}}).fetch();
  var depts = ['All'];
  for (var i=0; i < sorted.length; i++){
    if (depts.indexOf(sorted[i].dept) == -1)
        depts.push(sorted[i].dept);
  }

//  depts = depts.sort(); //just in case lol
  $('select#dropdown').append('<option value="Select..." selected="selected">Select...</option>');
  $.each(depts, function(v){
    $('select#dropdown').append('<option value="'+depts[v]+'">'+depts[v]+'</option>');
  });

}

Template.reviews.rendered = function(){

  console.log('Page rendered.');
  dropdown();
  autofunction();

  if (Session.get('selected_dept') == 'Select...')
    $('.toggle#browse').hide();
  else
    $('.toggle#search').hide();


  $('option').removeAttr('selected');
  $('option[value="' + Session.get('selected_dept') + '"]')
    .attr('selected','selected');

  $('.search-name').click(function(){
      $('.toggle#browse').hide('blind', 900);
      $('.toggle#search').show('blind', 900);      

      setTimeout(function(){ Session.set('selected_dept', 'Select...'); }, 900);
  });
  $('.search-dept').click(function(){
      $('.toggle#browse').show('blind', 900);
      $('.toggle#search').hide('blind', 900);      
  });


};
