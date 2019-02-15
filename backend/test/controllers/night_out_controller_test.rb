require 'test_helper'

class NightOutControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get night_out_index_url
    assert_response :success
  end

  test "should get create" do
    get night_out_create_url
    assert_response :success
  end

  test "should get show" do
    get night_out_show_url
    assert_response :success
  end

  test "should get destroy" do
    get night_out_destroy_url
    assert_response :success
  end

end
