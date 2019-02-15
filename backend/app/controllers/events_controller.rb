class EventsController < ApplicationController
  def show
    find_event
    render json: @event
  end

  private

  def find_event
    @event = Event.find(params[:id])
  end
end
