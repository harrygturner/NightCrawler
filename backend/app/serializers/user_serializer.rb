class UserSerializer < ActiveModel::Serializer
  attributes :id, :name, :email_address
  has_many :night_outs
end
