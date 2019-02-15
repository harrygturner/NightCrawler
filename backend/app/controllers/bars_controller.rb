class BarsController < ApplicationController
  def show
    find_bar
    render json: @bar
  end

  private
  
  def find_bar
    @bar = Bar.find(params[:id])
  end
end
