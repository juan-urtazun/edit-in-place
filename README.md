#edit-in-place
*EditInPlace* es una app simple en ruby on rails con edit in place.
Esta es una primera aproximación, se aceptan comentarios propuestas...etc.


## Requirements

* Rails 3
* [jQuery](https://github.com/indirect/jquery-rails) 
* [jQuery-ui](https://github.com/joliss/jquery-ui-rails)
* [FormParams](http://javascriptmvc.com/docs.html#!jQuery.fn.formParams) jquery pluging.
* [jquery.ui.create.in.place.js] esta en app/assets/javascripts
* [jquery.ui.edit.in.place.js] esta en app/assets/javascripts
* [app.js] esta en app/assets/javascripts
* [edit_in_place_controller.rb] es a donde se va a crear o editar por defecto.
* [application_helper.rb] tiene el metodo named_as name el nombre del atributo.
* [application_controller.rb] tiene el metodo respond_with_create y el respond_with_editing 




#Uso Básico

Agregar el modulo FormUtils.rb y Rails.application.routes.url_helpers en el modelo que usara formularios con
edit in place y las validaciones necesarias(por defecto el pluging javascript tomara aquellas que se 
indiquen con presence)

    class Product < ActiveRecord::Base
      include Rails.application.routes.url_helpers
      include FormUtils
      belongs_to :category
      attr_accessible :description, :expiration_date, :name, :radio, :title
    
      validates :name, :title, :presence=>{message:"El campo no puede ser blanco."}
      validates :name, :title, length: { minimum: 5, maximum: 255, message: "El campo debe poseer entre 5 y 255 caracteres." }
      validate :validate_dates, :allow_blank => true, :allow_nil => true
    
      def validate_dates
        if expiration_date 
          errors.add(:expiration_date, "La fecha de vencimiento debe ser mayor a la fecha actual") if expiration_date < Date.today
        end
      end
    end
    
Luego armar un formulario que tenga un campo hiden con los datos que usará el plugin javascript  
```ruby
  <%=hidden_field_tag 'dataFormStore', nil,:data=>@object.get_html5_data %>
```

`get_html5_data` es provisto por en el modulo FormUtil.rb

y tambien agregar data del atributo a updatear(en este caso el 'name')
```ruby   
   <%= f.label :name %>
   <%= f.text_field :name, id:'create',class:'edit_in_place', :data=> named_as(:name) %>
```
Luego en la app.js crear el manejador del edit in place como por ejemplo:

```javascript
 APP.editingPlaceHanddle = function(){
   return {
    run:function(){
        $("#create").creating(); //crea una instancia del pluging create.in.place sobre el imput con id create
        $(".disabled").prop('disabled', true); //setea en disabled todos los imputs con class disabled
        $("#create").on('creatingsuccess', function(ev,data){ //escucha el evento creatingsuccess,
                                                              //que se produce al crear correctamente el objecto
            $(".disabled").prop('disabled', false);  // habilita todos los imputs
            $("#title").html("Editando producto"); 
            $("#create").creating('destroy');       // destruyo la instancia del creating
            $(".edit_in_place").editing();         // crea una instancia del editinplace sobre cada imput con class edit_in_place
           
           //creo una instancia con una forma particular de sacar el valor del imput
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
```  
  
  e instanciarlo en el ready como sigue:
```javascript

  $(function(){
    var editingPlace = new APP.editingPlaceHanddle(); // creo el manejador
    editingPlace.run(); //ejecuto el metodo run que me define como se comportan los imput y la logia asociada a ellos 
  });
  
```

El create.in.place.js no envia la info hasta que no se completen los campos obligatorios que encuentra en la 
data del dataFormStore, cuando estos imputs tienen su valor envia al server un json para que se cree el objeto.

El server puede responder:
 * ok en cuyo caso se ejecuta el callback ajaxSuccess(response) y se levanta el evanto creatingsuccess.
 * unprocessable_entity en cuyo caso se ejecuta el callback ajaxError(response) y se levanta el evento creatingerror

 Si se creo correctamente el objeto en el server, se le agregara info al formulario para que este pueda ser editado
 y deberá destruirse la instancia del create.in.place para que empiece a usarse el edit.in.place sobre el objeto ya
 creado y sus campos del formulario
 
```javascript
  $(selector).creating('destroy');
  
  $(imputs).editing();   
```
Si es necesario se pueden pasar opciones a la instancia del plugin como por ejemplo:


```javascript
var opts={valueExtractor:function($el){
            return $el.val();},             
          errorsCleaner: function(elememts) {
          return {
            elememts: elememts,
            run: function() {
              $.each(this.elememts, function(index, el) {
                $(el).parents('p').children('.error').remove();
              });
            }
          }
        }
$(selector).creating(opts);
        
        
```

`valueExtractor` debe retornar un valor;
`errorsCleaner`  debe poder instanciarse recibiendo un array de ids y aceptar el metodo run();


#Eventos
Se pueden escuchar los eventos creatingsuccess, editingsuccess, creatingerror, editingerror para hacer 
algo extra con los datos que envia el server.


```javascript
        
$(selector).on('editingerror', function(response){
  var data = $.parseJSON(data.responseText);
  // hago algo con data.errors
});
        
        
```

#TODO
*
*
*

*
