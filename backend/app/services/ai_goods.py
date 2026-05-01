import json
import re
from typing import Any

import requests
from flask import current_app


CATEGORY_KEYWORDS = {
    '数码': ['ipad', 'iphone', 'macbook', '电脑', '笔记本', '耳机', '键盘', '鼠标', '显示器', '相机', '平板', '手机', '充电器'],
    '书籍': ['教材', '考研', '书', '英语', '高数', '二手书', '小说', '题库', '真题', '笔记'],
    '生活用品': ['台灯', '水壶', '收纳', '床帘', '脸盆', '衣架', '风扇', '吹风机', '被子', '桌子'],
    '服饰': ['外套', '裤子', '裙子', '衣服', '羽绒服', '鞋', '球鞋', '包', '背包', '帽子'],
}


def _normalize_text(value: Any) -> str:
    return str(value or '').strip()


def _detect_category(text: str, current_category: str = '') -> str:
    if current_category:
        return current_category
    lower_text = text.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in lower_text for keyword in keywords):
            return category
    return '其他'


def _extract_price(text: str) -> str:
    if not text:
        return ''
    match = re.search(r'(\d{2,5})(?:元|块|rmb)?', text.lower())
    return match.group(1) if match else ''


def _build_fallback_result(payload: dict[str, Any]) -> dict[str, Any]:
    title = _normalize_text(payload.get('title'))
    description = _normalize_text(payload.get('description'))
    category = _normalize_text(payload.get('category'))
    combined = f'{title} {description}'.strip()
    category = _detect_category(combined, category)

    if not title:
        if category == '数码':
            title = '九成新数码设备低价转让'
        elif category == '书籍':
            title = '二手教材资料转让'
        elif category == '生活用品':
            title = '闲置生活用品低价出'
        elif category == '服饰':
            title = '闲置衣物低价转让'
        else:
            title = '闲置物品低价转让'

    if len(title) > 30:
        title = title[:30]

    if not description:
        description = '正常使用痕迹，具体成色见图，支持校内当面交易。'

    hints = []
    for label, keywords in (
        ('品牌/型号', ['型号', '品牌', '版本', '尺寸']),
        ('成色说明', ['成色', '划痕', '使用痕迹', '九成新']),
        ('配件情况', ['配件', '充电器', '盒子', '发票']),
        ('交易方式', ['自提', '面交', '校内', '宿舍']),
    ):
        if not any(word in description for word in keywords) and not any(word in title for word in keywords):
            hints.append(f'建议补充{label}')

    draft_description = description
    if '自提' not in draft_description and '面交' not in draft_description:
        draft_description = f'{draft_description} 校内可面交自提。'

    price = _extract_price(f'{title} {description}')
    if not price:
        if category == '数码':
            price = '299'
        elif category == '书籍':
            price = '20'
        elif category == '生活用品':
            price = '35'
        elif category == '服饰':
            price = '49'
        else:
            price = '50'

    risk_level = 'low'
    if len(hints) >= 3:
        risk_level = 'medium'

    return {
        'title': title,
        'description': draft_description[:300],
        'category': category,
        'price': price,
        'tips': hints[:4] or ['信息已经比较完整，可直接检查图片和位置后发布'],
        'riskWarnings': hints[:3],
        'riskLevel': risk_level,
        'provider': 'fallback',
    }


def _build_fallback_precheck(payload: dict[str, Any]) -> dict[str, Any]:
    title = _normalize_text(payload.get('title'))
    description = _normalize_text(payload.get('description'))
    category = _normalize_text(payload.get('category'))
    location_name = _normalize_text(payload.get('locationName'))
    image_count = int(payload.get('imageCount') or 0)
    price_raw = payload.get('price')

    warnings = []
    suggestions = []
    missing_fields = []

    if len(title) < 4:
        warnings.append('标题过短，买家难以快速判断商品信息')
        missing_fields.append('标题')
    if image_count <= 0:
        warnings.append('未上传商品图片，可信度会明显下降')
        missing_fields.append('图片')
    elif image_count == 1:
        suggestions.append('建议补充更多角度图片，成交率通常更高')
    if not category:
        warnings.append('尚未选择分类，搜索曝光会受影响')
        missing_fields.append('分类')
    if not location_name:
        warnings.append('尚未选择交易位置，不利于附近展示')
        missing_fields.append('位置')

    try:
        price = float(price_raw)
        if price <= 0:
            warnings.append('价格必须大于 0')
            missing_fields.append('价格')
        elif price > 99999:
            warnings.append('价格明显偏高，请确认单位和金额是否填写正确')
        elif price < 1:
            suggestions.append('价格过低，建议确认是否遗漏数字')
    except (TypeError, ValueError):
        warnings.append('价格格式无效')
        missing_fields.append('价格')

    if len(description) < 12:
        warnings.append('描述过短，建议补充成色、配件和交易方式')
        missing_fields.append('描述')
    else:
        for label, keywords in (
            ('成色', ['成色', '划痕', '使用痕迹', '九成新']),
            ('配件', ['配件', '充电器', '盒子', '发票']),
            ('交易方式', ['面交', '自提', '校内', '宿舍']),
        ):
            if not any(word in description for word in keywords) and not any(word in title for word in keywords):
                suggestions.append(f'建议补充{label}信息')

    sensitive_words = ['vx', '微信', '私聊加', '转账', '定金', '押金']
    hit_words = [word for word in sensitive_words if word in f'{title} {description}']
    if hit_words:
        warnings.append(f'存在敏感交易词：{"、".join(hit_words[:3])}，建议避免站外引导')

    risk_level = 'low'
    can_publish = True
    if missing_fields or len(warnings) >= 3:
        risk_level = 'medium'
    if ('价格' in missing_fields or '图片' in missing_fields or '描述' in missing_fields) and len(missing_fields) >= 2:
        risk_level = 'high'
        can_publish = False

    return {
        'canPublish': can_publish,
        'riskLevel': risk_level,
        'warnings': warnings[:5],
        'suggestions': suggestions[:5],
        'missingFields': missing_fields[:5],
        'provider': 'fallback',
    }


def _extract_json(content: str) -> dict[str, Any]:
    text = (content or '').strip()
    if not text:
        raise ValueError('empty model response')
    if text.startswith('```'):
        parts = text.split('```')
        for part in parts:
            part = part.strip()
            if part.startswith('{') and part.endswith('}'):
                text = part
                break
            if '\n' in part:
                candidate = part.split('\n', 1)[1].strip()
                if candidate.startswith('{') and candidate.endswith('}'):
                    text = candidate
                    break
    start = text.find('{')
    end = text.rfind('}')
    if start >= 0 and end > start:
        text = text[start:end + 1]
    return json.loads(text)


def _build_prompt(payload: dict[str, Any]) -> list[dict[str, Any]]:
    title = _normalize_text(payload.get('title'))
    description = _normalize_text(payload.get('description'))
    category = _normalize_text(payload.get('category'))
    image_count = int(payload.get('imageCount') or 0)
    location_name = _normalize_text(payload.get('locationName'))
    enable_vision = bool(payload.get('enableVision'))
    image_urls = [str(item).strip() for item in (payload.get('imageUrls') or []) if str(item).strip()] if enable_vision else []

    user_content: list[dict[str, Any]] = [
        {
            'type': 'text',
            'text': json.dumps(
                {
                    'title': title,
                    'description': description,
                    'category': category,
                    'imageCount': image_count,
                    'locationName': location_name,
                    'goal': '补全商品发布文案，给出合理分类、建议价格和补充提示，并指出发布风险',
                },
                ensure_ascii=False,
            ),
        }
    ]
    for url in image_urls[:3]:
        user_content.append(
            {
                'type': 'image_url',
                'image_url': {'url': url},
            }
        )

    return [
        {
            'role': 'system',
            'content': (
                '你是校园二手交易发布助手。'
                '请基于用户已填写的信息，生成更适合发布的草稿。'
                '只输出 JSON，不要输出 Markdown。'
                'JSON 字段固定为 title, description, category, price, tips, riskWarnings, riskLevel。'
                'title 不超过 30 字，description 不超过 180 字，category 必须是 数码/书籍/生活用品/服饰/其他 之一，'
                'price 输出数字字符串，tips 和 riskWarnings 输出字符串数组，riskLevel 只能是 low/medium/high。'
                '如果看到了图片，可以结合图片判断品类和成色，但不要编造用户没有提供的具体型号、年份或配件，只能给保守建议。'
            ),
        },
        {
            'role': 'user',
            'content': user_content if image_urls else user_content[0]['text'],
        },
    ]


def _call_doubao(payload: dict[str, Any]) -> dict[str, Any]:
    config = current_app.config
    api_key = (config.get('ARK_API_KEY') or '').strip()
    base_url = (config.get('ARK_BASE_URL') or '').rstrip('/')
    text_model = (config.get('ARK_MODEL') or '').strip()
    vision_model = (config.get('ARK_VISION_MODEL') or '').strip()
    image_urls = [str(item).strip() for item in (payload.get('imageUrls') or []) if str(item).strip()]
    enable_vision = bool(image_urls and vision_model)
    model = vision_model if enable_vision else text_model
    if not api_key or not model:
        raise RuntimeError('missing doubao config')

    response = requests.post(
        f'{base_url}/chat/completions',
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
        },
        json={
            'model': model,
            'messages': _build_prompt({**payload, 'enableVision': enable_vision}),
            'temperature': 0.3,
            'max_tokens': 600,
        },
        timeout=20,
    )
    response.raise_for_status()
    data = response.json() or {}
    content = (
        data.get('choices', [{}])[0]
        .get('message', {})
        .get('content', '')
    )
    result = _extract_json(content)
    result['provider'] = 'doubao'
    return result


def generate_goods_draft(payload: dict[str, Any]) -> dict[str, Any]:
    payload = payload or {}
    fallback = _build_fallback_result(payload)
    if not current_app.config.get('AI_ENABLED', True):
        return fallback

    provider = (current_app.config.get('AI_PROVIDER') or 'doubao').strip().lower()
    if provider != 'doubao':
        return fallback

    try:
        result = _call_doubao(payload)
        return {
            'title': _normalize_text(result.get('title'))[:30] or fallback['title'],
            'description': _normalize_text(result.get('description'))[:300] or fallback['description'],
            'category': _normalize_text(result.get('category')) or fallback['category'],
            'price': _normalize_text(result.get('price')) or fallback['price'],
            'tips': [str(item).strip() for item in (result.get('tips') or []) if str(item).strip()][:4] or fallback['tips'],
            'riskWarnings': [str(item).strip() for item in (result.get('riskWarnings') or []) if str(item).strip()][:4] or fallback['riskWarnings'],
            'riskLevel': _normalize_text(result.get('riskLevel')).lower() if _normalize_text(result.get('riskLevel')).lower() in ('low', 'medium', 'high') else fallback['riskLevel'],
            'provider': result.get('provider') or 'doubao',
        }
    except Exception:
        current_app.logger.exception('generate_goods_draft error')
        return fallback


def precheck_goods_publish(payload: dict[str, Any]) -> dict[str, Any]:
    return _build_fallback_precheck(payload or {})
