class CreateNightOuts < ActiveRecord::Migration[5.2]
  def change
    create_table :night_outs do |t|
      t.belongs_to :user

      t.timestamps
    end
  end
end
