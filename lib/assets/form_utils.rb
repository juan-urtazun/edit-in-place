module FormUtils

  def get_html5_data
    {:id=>try(:id), :klass=>self.class.name.downcase, 'url-create'=>edit_in_place_create_path, 'url-update'=>edit_in_place_update_path,  nested_attrs: nested_attr_to_validate_as_ids}
  end  

  def nested_attr_to_validate_names
    self.class.validators.select{| v | v.class.name == "ActiveModel::Validations::PresenceValidator" }.map{|v|v.attributes}.flatten
  end    

  def nested_attr_to_validate_as_ids
    ids = nested_attr_to_validate_names.collect{| a | {id:"#{a.to_s}", name:"#{self.class.name.downcase}_#{a.to_s}"}}
  end  

end	