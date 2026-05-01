import { useState, useEffect } from 'react'
import { View, Text, Input, Textarea, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { aiApi, goodsApi, AiGoodsDraft, AiGoodsPrecheckResult } from '@/services/api'
import { uploadImages } from '@/utils/upload'
import { setTabBarSelected } from '@/utils/tabbar-state'
import './index.scss'

const CATEGORIES = ['数码', '书籍', '生活用品', '服饰', '其他']
const PUBLISH_DRAFT_KEY = 'publish_draft_v1'

export default function Publish() {
  const [editId, setEditId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [desc, setDesc] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [draftReady, setDraftReady] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiDraft, setAiDraft] = useState<AiGoodsDraft | null>(null)
  const [aiTips, setAiTips] = useState<string[]>([])
  const [aiWarnings, setAiWarnings] = useState<string[]>([])
  const [aiRiskLevel, setAiRiskLevel] = useState<'low' | 'medium' | 'high' | ''>('')
  const [precheckResult, setPrecheckResult] = useState<AiGoodsPrecheckResult | null>(null)

  Taro.useDidShow(() => setTabBarSelected(1))

  useEffect(() => {
    const id = Number(Taro.getCurrentInstance().router?.params?.id)
    if (id) {
      setEditId(id)
      setLoadingData(true)
      goodsApi.get(id).then((g) => {
        setTitle(g.title)
        setPrice(String(g.price))
        setDesc(g.description || '')
        setImages(g.images || [])
        if (g.lat && g.lng) {
          setLocation({
            lat: g.lat,
            lng: g.lng,
            name: (g as any).address || '已选位置',
          })
        }
        const c = CATEGORIES.find((x) => x === (g as any).category)
        if (c) setCategory(c)
      }).catch(() => Taro.showToast({ title: '加载失败', icon: 'none' }))
      .finally(() => {
        setLoadingData(false)
        setDraftReady(true)
      })
      return
    }
    const draft = Taro.getStorageSync(PUBLISH_DRAFT_KEY)
    if (draft) {
      setTitle(draft.title || '')
      setPrice(draft.price || '')
      setCategory(draft.category || '')
      setDesc(draft.desc || '')
      setImages(draft.images || [])
      setLocation(draft.location || null)
    }
    setDraftReady(true)
  }, [])

  useEffect(() => {
    if (!draftReady || editId) return
    Taro.setStorageSync(PUBLISH_DRAFT_KEY, { title, price, category, desc, images, location })
  }, [draftReady, editId, title, price, category, desc, images, location])

  const chooseImage = () => {
    Taro.chooseMedia({
      count: 5 - images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
    }).then((res) => {
      const temps = res.tempFiles.map((f) => f.tempFilePath)
      setImages((prev) => [...prev, ...temps].slice(0, 5))
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const chooseLocation = () => {
    Taro.chooseLocation({
      latitude: location?.lat,
      longitude: location?.lng,
    }).then((loc) => {
      setLocation({ lat: loc.latitude, lng: loc.longitude, name: loc.address || loc.name })
    }).catch((err) => {
      console.log('chooseLocation fail', err)
      // 检查是否是因为权限被拒绝
      Taro.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userLocation'] === false) {
            // 用户之前拒绝过，需要引导去设置开启
            Taro.showModal({
              title: '权限提示',
              content: '发布商品需要获取您的地理位置，请在设置中开启位置权限',
              confirmText: '去设置',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  Taro.openSetting()
                }
              }
            })
          } else {
            // 可能是用户取消了选择，或者其他错误
            Taro.showToast({ title: '未选择位置', icon: 'none' })
          }
        }
      })
    })
  }

  const generateByAi = async () => {
    const trimmedTitle = title.trim()
    const trimmedDesc = desc.trim()
    if (!trimmedTitle && !trimmedDesc && images.length === 0) {
      Taro.showToast({ title: '先填一点标题、描述或图片', icon: 'none' })
      return
    }

    setAiLoading(true)
    try {
      let imageUrls = images.filter((item) => item.startsWith('http'))
      const localImages = images.filter((item) => !item.startsWith('http'))
      if (localImages.length > 0) {
        if (!Taro.getStorageSync('token')) {
          Taro.showToast({ title: '登录后可启用图片识别，先按文字生成', icon: 'none' })
        } else {
          Taro.showLoading({ title: '上传图片中...' })
          const uploaded = await uploadImages(localImages)
          Taro.hideLoading()
          imageUrls = [...imageUrls, ...uploaded]
        }
      }

      const res = await aiApi.generateGoodsDraft({
        title: trimmedTitle,
        description: trimmedDesc,
        category,
        imageCount: images.length,
        locationName: location?.name || '',
        imageUrls,
      })
      const draft = res.draft
      setAiDraft(draft)
      setAiTips(draft.tips || [])
      setAiWarnings(draft.riskWarnings || [])
      setAiRiskLevel(draft.riskLevel || 'low')
      Taro.showToast({ title: '已生成建议', icon: 'none' })
    } catch (e) {
      console.error(e)
      Taro.hideLoading()
    } finally {
      setAiLoading(false)
    }
  }

  const applyAiField = (field: 'title' | 'description' | 'category' | 'price') => {
    if (!aiDraft) return
    if (field === 'title' && aiDraft.title) setTitle(aiDraft.title)
    if (field === 'description' && aiDraft.description) setDesc(aiDraft.description)
    if (field === 'category' && aiDraft.category) setCategory(aiDraft.category)
    if (field === 'price' && aiDraft.price) setPrice(aiDraft.price)
    Taro.showToast({ title: '已应用', icon: 'none' })
  }

  const applyAiAll = () => {
    if (!aiDraft) return
    if (aiDraft.title) setTitle(aiDraft.title)
    if (aiDraft.description) setDesc(aiDraft.description)
    if (aiDraft.category) setCategory(aiDraft.category)
    if (aiDraft.price) setPrice(aiDraft.price)
    Taro.showToast({ title: '已应用全部建议', icon: 'none' })
  }

  const runPrecheck = async (): Promise<AiGoodsPrecheckResult | null> => {
    try {
      const res = await aiApi.precheckGoodsPublish({
        title: title.trim(),
        description: desc.trim(),
        category,
        price,
        imageCount: images.length,
        locationName: location?.name || '',
      })
      setPrecheckResult(res.result)
      return res.result
    } catch (e) {
      console.error(e)
      return null
    }
  }

  const confirmByPrecheck = async (): Promise<boolean> => {
    const result = await runPrecheck()
    if (!result) return true
    if (result.riskLevel === 'low' && result.canPublish) return true

    const lines = [
      result.riskLevel === 'high' ? '检测到高风险发布项。' : '检测到需要确认的发布项。',
      ...result.warnings.slice(0, 3).map((item, index) => `${index + 1}. ${item}`),
      ...result.missingFields.slice(0, 2).map((item) => `待补充：${item}`),
    ]
    const modal = await Taro.showModal({
      title: result.canPublish ? '发布前确认' : '建议先补充信息',
      content: lines.join('\n'),
      confirmText: result.canPublish ? '继续发布' : '仍然发布',
      cancelText: '返回修改',
    })
    return !!modal.confirm
  }

  const submit = async () => {
    if (!Taro.getStorageSync('token')) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      Taro.switchTab({ url: '/pages/user/index' })
      return
    }
    if (!title.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' })
      return
    }
    if (title.trim().length < 4) {
      Taro.showToast({ title: '标题至少 4 个字', icon: 'none' })
      return
    }
    if (!price || isNaN(Number(price))) {
      Taro.showToast({ title: '请输入有效价格', icon: 'none' })
      return
    }
    if (Number(price) <= 0) {
      Taro.showToast({ title: '价格需大于 0', icon: 'none' })
      return
    }
    if (!category) {
      Taro.showToast({ title: '请选择分类', icon: 'none' })
      return
    }
    if (images.length === 0) {
      Taro.showToast({ title: '请上传至少一张图片', icon: 'none' })
      return
    }
    if (!location) {
      Taro.showToast({ title: '请选择位置', icon: 'none' })
      return
    }
    if (!desc.trim()) {
      Taro.showToast({ title: '请补充商品描述', icon: 'none' })
      return
    }
    const passed = await confirmByPrecheck()
    if (!passed) {
      return
    }

    setLoading(true)
    try {
      let imageUrls = images
      if (images.some((u) => !u.startsWith('http'))) {
        Taro.showLoading({ title: '上传中...' })
        imageUrls = await uploadImages(images)
        Taro.hideLoading()
      }
      const payload = {
        title: title.trim(),
        price: Number(price),
        category,
        description: desc.trim(),
        images: imageUrls,
        lat: location.lat,
        lng: location.lng,
      }
      if (editId) {
        await goodsApi.update(editId, payload)
        Taro.showToast({ title: '修改成功' })
        setTimeout(() => Taro.navigateBack(), 1500)
      } else {
        await goodsApi.create({ ...payload, status: 1 })
        Taro.removeStorageSync(PUBLISH_DRAFT_KEY)
        Taro.showToast({ title: '发布成功' })
        setTimeout(() => Taro.switchTab({ url: '/pages/index/index' }), 1500)
      }
    } catch (e) {
      setLoading(false)
    }
  }

  const saveDraft = () => {
    if (editId) {
      Taro.showToast({ title: '编辑状态无需草稿', icon: 'none' })
      return
    }
    setSavingDraft(true)
    Taro.setStorageSync(PUBLISH_DRAFT_KEY, { title, price, category, desc, images, location })
    Taro.showToast({ title: '草稿已保存', icon: 'none' })
    setTimeout(() => setSavingDraft(false), 300)
  }

  const clearDraft = () => {
    Taro.showModal({
      title: '清空草稿',
      content: '确认清空当前填写内容吗？',
      success: (res) => {
        if (!res.confirm) return
        setTitle('')
        setPrice('')
        setCategory('')
        setDesc('')
        setImages([])
        setLocation(null)
        Taro.removeStorageSync(PUBLISH_DRAFT_KEY)
      },
    })
  }

  if (loadingData) {
    return (
      <View className="publish-page tab-bar-page">
        <Text className="loading-tip">加载中...</Text>
      </View>
    )
  }

  return (
    <View className="publish-page tab-bar-page">
      <View className="hero-card">
        <View className="hero-head">
          <Text className="hero-title">{editId ? '编辑商品' : '发布物品'}</Text>
          {!editId && (
            <Button className="ai-mini-btn" onClick={generateByAi} loading={aiLoading}>
              AI 填写
            </Button>
          )}
        </View>
        <Text className="hero-subtitle">图片、标题、价格、描述和交易位置都填写完整，商品更容易成交。</Text>
      </View>
      {(aiDraft || aiTips.length > 0 || aiWarnings.length > 0 || precheckResult) && (
        <View className="ai-panel">
          {aiDraft && (
            <View className="ai-draft-card">
              <View className="ai-draft-head">
                <Text className="ai-draft-title">AI 建议草稿</Text>
                <Text className="ai-apply-all" onClick={applyAiAll}>全部应用</Text>
              </View>
              <View className="ai-draft-section">
                <View className="ai-draft-line">
                  <Text className="ai-draft-label">标题</Text>
                  <Text className="ai-draft-apply" onClick={() => applyAiField('title')}>应用</Text>
                </View>
                <Text className="ai-draft-value">{aiDraft.title || '暂无建议'}</Text>
              </View>
              <View className="ai-draft-section">
                <View className="ai-draft-line">
                  <Text className="ai-draft-label">价格</Text>
                  <Text className="ai-draft-apply" onClick={() => applyAiField('price')}>应用</Text>
                </View>
                <Text className="ai-draft-value">¥{aiDraft.price || '--'}</Text>
              </View>
              <View className="ai-draft-section">
                <View className="ai-draft-line">
                  <Text className="ai-draft-label">分类</Text>
                  <Text className="ai-draft-apply" onClick={() => applyAiField('category')}>应用</Text>
                </View>
                <Text className="ai-draft-value">{aiDraft.category || '暂无建议'}</Text>
              </View>
              <View className="ai-draft-section">
                <View className="ai-draft-line">
                  <Text className="ai-draft-label">描述</Text>
                  <Text className="ai-draft-apply" onClick={() => applyAiField('description')}>应用</Text>
                </View>
                <Text className="ai-draft-value multiline">{aiDraft.description || '暂无建议'}</Text>
              </View>
            </View>
          )}
          {aiTips.length > 0 && (
            <View className="ai-tips">
              {aiTips.map((tip, index) => (
                <Text key={`${tip}-${index}`} className="ai-tip">{tip}</Text>
              ))}
            </View>
          )}
          {aiWarnings.length > 0 && (
            <View className={`ai-risk-card ${aiRiskLevel || 'low'}`}>
              <Text className="ai-risk-title">
                发布前检查
                {aiRiskLevel ? ` · ${aiRiskLevel === 'high' ? '高' : aiRiskLevel === 'medium' ? '中' : '低'}风险` : ''}
              </Text>
              {aiWarnings.map((item, index) => (
                <Text key={`${item}-${index}`} className="ai-risk-item">{item}</Text>
              ))}
            </View>
          )}
          {precheckResult && (
            <View className={`ai-risk-card ${precheckResult.riskLevel}`}>
              <Text className="ai-risk-title">
                发布审核结果 · {precheckResult.riskLevel === 'high' ? '高风险' : precheckResult.riskLevel === 'medium' ? '中风险' : '低风险'}
              </Text>
              {precheckResult.warnings.length > 0 ? precheckResult.warnings.map((item, index) => (
                <Text key={`${item}-${index}`} className="ai-risk-item">{item}</Text>
              )) : (
                <Text className="ai-risk-item">当前信息可正常发布。</Text>
              )}
              {precheckResult.suggestions.length > 0 && (
                <View className="ai-inline-tips">
                  {precheckResult.suggestions.map((item, index) => (
                    <Text key={`${item}-${index}`} className="ai-tip">{item}</Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}
      <View className="form">
        <View className="row">
          <Text className="label">图片</Text>
          <Text className="hint">最多 5 张，首图将作为封面</Text>
          <View className="imgs">
            {images.map((url, i) => (
              <View key={i} className="img-wrap">
                <Image src={url} className="img" mode="aspectFill" />
                <Text className="remove-img" onClick={() => removeImage(i)}>×</Text>
              </View>
            ))}
            {images.length < 5 && (
              <View className="add-img" onClick={chooseImage}>
                <View className="add-icon">+</View>
                <Text className="add-text">添加</Text>
              </View>
            )}
          </View>
        </View>
        <View className="row">
          <Text className="label">标题</Text>
          <Text className="hint">建议包含品牌、型号、成色等关键信息</Text>
          <Input
            className="input"
            maxlength={30}
            placeholder="例如：九成新 iPad 10 64G"
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
          />
          <Text className="field-meta">{title.trim().length}/30</Text>
        </View>
        <View className="row">
          <Text className="label">价格</Text>
          <Input
            className="input"
            type="digit"
            placeholder="0.00"
            value={price}
            onInput={(e) => setPrice(e.detail.value)}
          />
        </View>
        <View className="row">
          <Text className="label">分类</Text>
          <View className="categories">
            {CATEGORIES.map((c) => (
              <Text
                key={c}
                className={`tag ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </Text>
            ))}
          </View>
        </View>
        <View className="row">
          <Text className="label">描述</Text>
          <Textarea
            className="textarea"
            maxlength={300}
            placeholder="请说明成色、购买时间、配件是否齐全、交易方式等"
            value={desc}
            onInput={(e) => setDesc(e.detail.value)}
          />
          <Text className="field-meta">{desc.trim().length}/300</Text>
        </View>
        <View className="row">
          <Text className="label">位置</Text>
          <Text className="hint">建议选择方便面交的校内区域或宿舍附近位置</Text>
          <Text
            className={`location-btn ${!location ? 'placeholder' : ''}`}
            onClick={chooseLocation}
          >
            {location ? location.name : '点击选择位置'}
          </Text>
        </View>
      </View>
      <View className="action-bar">
        {!editId && (
          <>
            <Button className="secondary-btn" onClick={saveDraft} loading={savingDraft}>保存草稿</Button>
            <Button className="ghost-light-btn" onClick={clearDraft}>清空</Button>
          </>
        )}
      </View>
      <Button className="submit" onClick={submit} loading={loading}>
        {editId ? '保存修改' : '确认发布'}
      </Button>
    </View>
  )
}
