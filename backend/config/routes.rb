Rails.application.routes.draw do
  get 'restaurants/show'
  get 'bars/show'
  get 'events/controller'
  get 'events/show'
  get 'night_outs/index'
  get 'night_outs/create'
  get 'night_outs/show'
  get 'night_outs/destroy'
  get 'users/create'
  get 'users/show'
  get 'users/destroy'

  
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
