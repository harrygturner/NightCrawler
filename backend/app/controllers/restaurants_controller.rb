class RestaurantsController < ApplicationController
  def show
    find_restaurant
    render json: @restaurant
  end

  private

  def find_restaurant
    @restaurant = Restaurant.find(params[:id])
  end
end
