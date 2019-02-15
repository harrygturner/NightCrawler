require 'test_helper'

class EventsControllerTest < ActionDispatch::IntegrationTest
  test "should get controller" do
    get events_controller_url
    assert_response :success
  end

  test "should get show" do
    get events_show_url
    assert_response :success
  end

end
