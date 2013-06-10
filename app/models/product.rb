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
