import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { userApi } from '@/services/api'
import './index.scss'

const GET_USER_PROFILE_COOLDOWN_MS = 3000 // 微信限制：避免频繁调用 getUserProfile

export default function ProfileEdit() {
  const [nickName, setNickName] = useState('')
  const [phone, setPhone] = useState('')
  const [campus, setCampus] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [getUserProfileCooling, setGetUserProfileCooling] = useState(false)

  useEffect(() => {
    userApi
      .getProfile()
      .then((u) => {
        setNickName(u.nickName || '')
        setPhone(u.phone || '')
        setCampus(u.campus || '')
      })
      .catch(() => Taro.showToast({ title: '加载失败', icon: 'none' }))
      .finally(() => setLoading(false))
  }, [])

  const save = () => {
    setSaving(true)
    userApi
      .updateProfile({ nickName, phone, campus })
      .then(() => {
        Taro.showToast({ title: '保存成功' })
        setTimeout(() => Taro.navigateBack(), 1500)
      })
      .catch(() => setSaving(false))
      .finally(() => setSaving(false))
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

  const fillFromWechat = () => {
    if (getUserProfileCooling) {
      Taro.showToast({ title: '请勿频繁点击', icon: 'none' })
      return
    }
    setGetUserProfileCooling(true)
    const resetCooling = () => {
      setTimeout(() => setGetUserProfileCooling(false), GET_USER_PROFILE_COOLDOWN_MS)
    }
    Taro.getUserProfile({
      desc: '用于展示头像与昵称',
    })
      .then((res) => {
        const { nickName: n, avatarUrl: a } = res.userInfo || {}
        const payload: { nickName?: string; avatar?: string } = {}
        if (n) payload.nickName = n
        if (a) payload.avatar = a
        if (!Object.keys(payload).length) return
        userApi.updateProfile(payload).then(() => {
          if (n) setNickName(n)
          Taro.showToast({ title: '已同步微信头像与昵称' })
        })
      })
      .catch(() => Taro.showToast({ title: '需要授权才能获取', icon: 'none' }))
      .finally(resetCooling)
  }

  return (
    <View className="profile-edit-page">
      <Button className="wechat-fill-btn" onClick={fillFromWechat} disabled={getUserProfileCooling}>
        使用微信头像与昵称
      </Button>
      <View className="form">
        <View className="row">
          <Text className="label">昵称</Text>
          <Input
            className="input"
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
          <Text className="label">校区</Text>
          <Input
            className="input"
            value={campus}
            placeholder="如：南校区、东区 3 栋"
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
