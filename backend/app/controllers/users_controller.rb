class UsersController < ApplicationController
  def create
    @user = User.new(user_params)
    if @user.save
      render json: @user
    else
      render json: {error: "Unable to create user"}, status: 400
    end
  end

  def show
    find_user
    render json: @user
  end

  def destroy
    @user.delete
    render json: @user
  end

  private

  def user_params
    params.permit(:name, :email_address)
  end

  def find_user
    @user = User.find(params[:id])
  end
end
