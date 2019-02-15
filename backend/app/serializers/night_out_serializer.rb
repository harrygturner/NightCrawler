class NightOutSerializer < ActiveModel::Serializer
  attributes :id, :user_id
  belongs_to :user
  has_many :events, :restaurants, :bars
end
