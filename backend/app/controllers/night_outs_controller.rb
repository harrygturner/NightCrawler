class NightOutSController < ApplicationController
  def index
    @night_outs = NightOut.all
    render json: @night_outs
  end

  def create
    @night_out = NightOut.new(night_out_params)
    if @night_out.save
      render json: @night_out
    else
      render json: {error: "Unable to create Night Out"}, status: 400
    end
  end

  def show
    find_night_out
    render json: @night_out
  end

  def destroy
    @night_out.delete
    render json: @night_out
  end

  private

  def night_out_params
    params.permit(:user_id)
  end

  def find_night_out
    @night_out = NightOut.find(params[:id])
  end
end
