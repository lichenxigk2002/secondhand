import { View, Text, Input, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { userApi } from '@/services/api'
import { uploadImage, isTempPath } from '@/utils/upload'
import { fixImageUrl } from '@/utils/request'
import './index.scss'

export default function ProfileEdit() {
  const [nickName, setNickName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [phone, setPhone] = useState('')
  const [campus, setCampus] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    userApi
      .getProfile()
      .then((u) => {
        setNickName(u.nickName || '')
        setAvatar(u.avatar || '')
        setPhone(u.phone || '')
        setCampus(u.campus || '')
      })
      .catch(() => Taro.showToast({ title: '加载失败', icon: 'none' }))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      let avatarUrl = avatar
      if (isTempPath(avatar)) {
        Taro.showLoading({ title: '上传头像...' })
        avatarUrl = await uploadImage(avatar)
        Taro.hideLoading()
      }
      const profile = await userApi.updateProfile({ nickName, avatar: avatarUrl, phone, campus })
      Taro.setStorageSync('user_info', profile)
      Taro.showToast({ title: '保存成功' })
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch (e) {
      setSaving(false)
      Taro.hideLoading()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View className="profile-edit-page">
        <View className="loading-tip">
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  const onChooseAvatar = (e: any) => {
    const url = e?.detail?.avatarUrl || ''
    if (!url) {
      Taro.showToast({ title: '未获取到头像', icon: 'none' })
      return
    }
    setAvatar(url)
  }

  return (
    <View className="profile-edit-page">
      <View className="form">
        <View className="row">
          <Text className="label">头像</Text>
          <View className="avatar-row">
            <Image
              className="avatar-preview"
              src={fixImageUrl(avatar || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0')}
            />
            <Button className="avatar-btn" openType="chooseAvatar" onChooseAvatar={onChooseAvatar}>
              选择微信头像
            </Button>
          </View>
        </View>
        <View className="row">
          <Text className="label">昵称</Text>
          <Input
            className="input"
            type="nickname"
            placeholder="请输入昵称"
            value={nickName}
            onInput={(e) => setNickName(e.detail.value)}
          />
        </View>
        <View className="row">
          <Text className="label">手机</Text>
          <Input
            className="input"
            type="number"
            placeholder="选填，便于买家联系"
            value={phone}
            onInput={(e) => setPhone(e.detail.value)}
          />
        </View>
        <View className="row">
          <Text className="label">校内区域</Text>
          <Input
            className="input"
            value={campus}
            placeholder="如：宿舍区 3 栋、图书馆、快递点"
            onInput={(e) => setCampus(e.detail.value)}
          />
        </View>
      </View>
      <Button
        className="save-btn"
        onClick={save}
        loading={saving}
        disabled={saving}
      >
        保存
      </Button>
    </View>
  )
}
