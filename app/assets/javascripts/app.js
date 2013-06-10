
;(function ( $, window, document, undefined ) {  
  window.APP = {};
  APP.Validations = {};
  APP.ValueExtractors = {};
  APP.Validations.Simple = function($el){
    return {
      $elememt:$el,
      getStatus:function(){
        var val =   this.$elememt.val();
        var output = val !== "undefined" && val !=="";
        return val !== "undefined" && val !=="";
      }
    }
  };

  APP.editingPlaceHanddle = function(){
   return {
    run:function(){
        $("#create").creating();
        $(".disabled").prop('disabled', true);
        $("#create").on('creatingsuccess', function(ev,data){
            $(".disabled").prop('disabled', false);
            $("#title").html("Editando producto");
            $("#create").creating('destroy');
            $(".edit_in_place").editing();
            $(".edit_in_place_checkbox_single").editing({ 
                valueExtractor:function($el){
                  var extractor =  new APP.ValueExtractors.checkboxSimple($el);
                  return extractor;
                }
            });
      });
      }
    }
  };


  APP.ValueExtractors.Simple = function($el){
    return {
        $elememt:$el,
        getValue:function(){
          return this.$elememt.val();
        }
    }
  };

  APP.ValueExtractors.checkboxSimple = function($el){ 
    return {
        $elememt:$el,
        getValue:function(){
          var value = 0;
          if(this.$elememt.is(':checked')){
            value=1;
          }
        return value;
        }
    }
 };






  
  $(function(){
    $('.datePicker').datepicker();
    var editingPlace = new APP.editingPlaceHanddle();
    editingPlace.run();
  });

})( jQuery, window, document );

