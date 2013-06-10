class EditInPlaceController < ApplicationController
  before_filter :valid_params?

  def create
    if valid_params?
   #begin
    respond_to do |format|
      format.json { respond_with_create(create_object) }
    end
    # rescue Exception => exc
     # render :json => {msg:"eror eror eror", :status => :unprocessable_entity}
    #end
    else
      render :json => {msg:"no son parametros validos", :status => :unprocessable_entity}
    end
  end

  def update
    if valid_params?
   #begin
    #sanitized_param = get_param_to_update
    respond_to do |format|      
      format.json { respond_with_editing(update_object) }
    end
    # rescue Exception => exc
     # render :json => {msg:"eror eror eror", :status => :unprocessable_entity}
    #end
    else
      render :json => {msg:"no son parametros validos", :status => :unprocessable_entity}
    end
  end

  def valid_params?

    true
  end



end


