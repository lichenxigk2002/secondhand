import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Goods } from '@/services/api'
import { fixImageUrl } from '@/utils/request'
import './index.scss'

interface Props {
  goods: Goods
}

export default function GoodCard({ goods }: Props) {
  const img = goods.images?.[0] || ''
  const user = goods.user

  const goDetail = () => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${goods.id}` })
  }

  return (
    <View className="good-card" onClick={goDetail}>
      <View className="thumb-wrap">
        <Image className="thumb" src={fixImageUrl(img)} mode="aspectFill" lazyLoad />
        {goods.distance != null && (
          <View className="distance-tag">
            <Text>{goods.distance < 1 ? `${(goods.distance * 1000).toFixed(0)}m` : `${goods.distance.toFixed(1)}km`}</Text>
          </View>
        )}
      </View>
      <View className="info">
        <Text className="title">{String(goods?.title ?? '')}</Text>
        <View className="price-row">
          <Text className="symbol">¥</Text>
          <Text className="price">{String(goods?.price ?? '')}</Text>
        </View>
        {user && (
          <View className="user-row">
            <Image
              className="avatar"
              src={fixImageUrl(user.avatar)}
              mode="aspectFill"
            />
            <Text className="name">{String(user?.nickName ?? '')}</Text>
          </View>
        )}
      </View>
    </View>
  )
}
