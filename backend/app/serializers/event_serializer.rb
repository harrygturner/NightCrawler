class EventSerializer < ActiveModel::Serializer
  attributes :id, :title, :description, :location, :night_out_id
  belongs_to :night_out
end
