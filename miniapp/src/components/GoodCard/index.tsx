import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Goods } from '@/services/api'
import './index.scss'

interface Props {
  goods: Goods
}

export default function GoodCard({ goods }: Props) {
  const img = goods.images?.[0] || ''

  const goDetail = () => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${goods.id}` })
  }

  return (
    <View className="good-card" onClick={goDetail}>
      <View className="thumb-wrap">
        <Image className="thumb" src={img} mode="aspectFill" />
        {goods.distance != null && (
          <View className="distance-tag">
            <Text>{goods.distance.toFixed(1)}km</Text>
          </View>
        )}
      </View>
      <View className="info">
        <Text className="title">{goods.title}</Text>
        <Text className="price">¥{goods.price}</Text>
      </View>
    </View>
  )
}
