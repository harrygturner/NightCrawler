class BarSerializer < ActiveModel::Serializer
  attributes :id, :name, :location, :rating, :price_level, :night_out_id
  belongs_to :night_out
end
