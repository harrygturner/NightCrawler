# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_02_14_154826) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "bars", force: :cascade do |t|
    t.string "name"
    t.string "location"
    t.string "rating"
    t.string "price_level"
    t.bigint "night_out_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["night_out_id"], name: "index_bars_on_night_out_id"
  end

  create_table "events", force: :cascade do |t|
    t.string "title"
    t.string "description"
    t.string "location"
    t.bigint "night_out_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["night_out_id"], name: "index_events_on_night_out_id"
  end

  create_table "night_outs", force: :cascade do |t|
    t.bigint "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_night_outs_on_user_id"
  end

  create_table "restaurants", force: :cascade do |t|
    t.string "name"
    t.string "location"
    t.string "rating"
    t.string "price_level"
    t.bigint "night_out_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["night_out_id"], name: "index_restaurants_on_night_out_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "email_address"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
