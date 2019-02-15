require 'test_helper'

class BarsControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get bars_show_url
    assert_response :success
  end

end
