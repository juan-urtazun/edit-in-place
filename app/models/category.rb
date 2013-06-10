class Category < ActiveRecord::Base
  attr_accessible :active, :description, :name, :title
  has_many :products
end
