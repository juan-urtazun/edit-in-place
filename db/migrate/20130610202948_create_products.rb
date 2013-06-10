class CreateProducts < ActiveRecord::Migration
  def change
    create_table :products do |t|
      t.string :name
      t.string :title
      t.text :description
      t.boolean :prominent
      t.date :expiration_date
      t.integer :category_id
      t.timestamps
      
    end
  end
end
