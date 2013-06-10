Foo::Application.routes.draw do
  resources :categories


  resources :products

  match  "edit_in_place/create" => 'edit_in_place#create'
  match  "edit_in_place/update" => 'edit_in_place#update'

end
