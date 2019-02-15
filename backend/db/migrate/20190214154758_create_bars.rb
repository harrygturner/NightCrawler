class CreateBars < ActiveRecord::Migration[5.2]
  def change
    create_table :bars do |t|
      t.string :name
      t.string :location
      t.string :rating
      t.string :price_level
      t.belongs_to :night_out

      t.timestamps
    end
  end
end
