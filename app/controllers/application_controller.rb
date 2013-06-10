class ApplicationController < ActionController::Base
  protect_from_forgery


  

 def respond_with_create(obj)
      obj.save ?  respond_with(obj) : respond_error(obj)
 end
 def respond_with_editing(obj)
      obj.changed? ? respond_error(obj) : respond_ok(obj)
 end

  private

  def respond_with(obj)
    render :json => { :id => obj.id}, :layout => false , :status => :ok
  end

  def respond_ok(obj)
    render :json => {obj:obj, status: :ok}
  end

  def respond_error(obj)
    render :json => {msg:"Ocurrieron errores", errors:obj.errors.to_hash} , :status => :unprocessable_entity
  end

  def get_attribute_change
    params[:data][get_klass.downcase.to_sym].keys.first.to_sym
  end 
   
  def get_klass
    params[:klass].camelize
  end  
 
  def get_params
    params[:data]
  end    
 
  def get_id
    params[:id]
  end
    
  def create_object
    get_klass.constantize.new(get_params)
  end

  def do_edit(obj)
    obj.update_attributes(get_params)
    obj
  end
    
  def update_object
    object = find_object
    do_edit(object)
  end
  
  def find_object
      get_klass.constantize.find(get_id)
  end   
end
