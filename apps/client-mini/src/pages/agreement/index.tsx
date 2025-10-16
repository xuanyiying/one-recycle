import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface AgreementSection {
  id: string
  title: string
  content: string[]
}

export default function Agreement() {
  const [activeSection, setActiveSection] = useState<string>('')
  const [agreementType, setAgreementType] = useState<'user' | 'privacy'>('user')

  useEffect(() => {
    // 获取页面参数，确定显示用户协议还是隐私政策
    const instance = Taro.getCurrentInstance()
    const type = instance.router?.params?.type as 'user' | 'privacy'
    if (type) {
      setAgreementType(type)
    }

    // 设置页面标题
    Taro.setNavigationBarTitle({
      title: type === 'privacy' ? '隐私政策' : '用户协议'
    })
  }, [])

  // 用户协议内容
  const userAgreementSections: AgreementSection[] = [
    {
      id: 'introduction',
      title: '1. 协议介绍',
      content: [
        '欢迎使用爱回收小程序！',
        '本协议是您与爱回收平台之间关于使用爱回收服务的法律协议。',
        '请您仔细阅读本协议的全部条款，特别是免除或者限制责任的条款。',
        '您点击"同意"或使用爱回收服务，即表示您已阅读并同意接受本协议的约束。'
      ]
    },
    {
      id: 'service_description',
      title: '2. 服务说明',
      content: [
        '爱回收是一个专业的二手物品回收交易平台。',
        '我们为用户提供二手手机、数码产品、家电等物品的回收估价服务。',
        '平台致力于为用户提供便捷、安全、可靠的回收交易体验。',
        '我们保留随时修改或中断服务的权利，恕不另行通知。'
      ]
    },
    {
      id: 'user_obligations',
      title: '3. 用户义务',
      content: [
        '用户应当提供真实、准确、完整的个人信息。',
        '用户不得利用本平台从事任何违法违规活动。',
        '用户应当妥善保管自己的账号和密码，对账号下的所有活动负责。',
        '用户提交的物品信息应当真实有效，不得故意隐瞒物品缺陷。'
      ]
    },
    {
      id: 'platform_rights',
      title: '4. 平台权利',
      content: [
        '平台有权对用户提交的信息进行审核。',
        '平台有权拒绝不符合要求的回收申请。',
        '平台有权根据市场情况调整回收价格。',
        '对于违反协议的用户，平台有权暂停或终止其使用服务的权利。'
      ]
    },
    {
      id: 'liability_limitation',
      title: '5. 责任限制',
      content: [
        '平台仅作为信息服务提供者，不对交易结果承担责任。',
        '因不可抗力因素导致的服务中断，平台不承担责任。',
        '用户因使用本服务而产生的损失，平台承担的责任以用户实际损失为限。',
        '平台对间接损失、利润损失等不承担责任。'
      ]
    },
    {
      id: 'agreement_modification',
      title: '6. 协议修改',
      content: [
        '平台有权随时修改本协议条款。',
        '协议修改后，我们会在平台上公布修改内容。',
        '如您不同意修改后的协议，可以停止使用本服务。',
        '您继续使用服务，视为同意修改后的协议。'
      ]
    }
  ]

  // 隐私政策内容
  const privacyPolicySections: AgreementSection[] = [
    {
      id: 'information_collection',
      title: '1. 信息收集',
      content: [
        '我们会收集您主动提供的个人信息，如昵称、头像、联系方式等。',
        '我们会收集您使用服务时产生的信息，如设备信息、操作记录等。',
        '我们会收集您的位置信息，以便为您提供更好的服务。',
        '所有信息收集均在您知情同意的前提下进行。'
      ]
    },
    {
      id: 'information_usage',
      title: '2. 信息使用',
      content: [
        '我们使用您的信息为您提供回收估价服务。',
        '我们使用您的信息改进我们的产品和服务质量。',
        '我们使用您的信息进行数据分析，优化用户体验。',
        '我们不会将您的个人信息用于其他商业目的。'
      ]
    },
    {
      id: 'information_sharing',
      title: '3. 信息共享',
      content: [
        '我们不会向第三方出售、出租或以其他方式披露您的个人信息。',
        '在法律要求或政府部门要求的情况下，我们可能会披露您的信息。',
        '为了提供服务，我们可能会与合作伙伴共享必要的信息。',
        '所有信息共享都会在确保信息安全的前提下进行。'
      ]
    },
    {
      id: 'information_security',
      title: '4. 信息安全',
      content: [
        '我们采用行业标准的安全措施保护您的个人信息。',
        '我们使用加密技术传输和存储您的敏感信息。',
        '我们定期审查和更新安全措施，防范信息泄露风险。',
        '我们限制员工对个人信息的访问权限。'
      ]
    },
    {
      id: 'user_rights',
      title: '5. 用户权利',
      content: [
        '您有权查询、更正、删除您的个人信息。',
        '您有权撤回对个人信息处理的同意。',
        '您有权要求我们停止处理您的个人信息。',
        '如有疑问，您可以通过客服渠道联系我们。'
      ]
    },
    {
      id: 'policy_updates',
      title: '6. 政策更新',
      content: [
        '我们可能会不定期更新本隐私政策。',
        '政策更新后，我们会在应用内通知您。',
        '重大变更会通过显著方式提醒您。',
        '您继续使用服务，视为同意更新后的隐私政策。'
      ]
    }
  ]

  const currentSections = agreementType === 'privacy' ? privacyPolicySections : userAgreementSections

  // 滚动到指定章节
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    // 这里可以添加滚动到指定位置的逻辑
  }

  // 返回上一页
  const handleGoBack = () => {
    Taro.navigateBack()
  }

  return (
    <View className="agreement-container">
      {/* 头部导航 */}
      <View className="agreement-header">
        <View className="back-button" onTap={handleGoBack}>
          <Text className="back-icon">‹</Text>
          <Text className="back-text">返回</Text>
        </View>
        <Text className="page-title">
          {agreementType === 'privacy' ? '隐私政策' : '用户协议'}
        </Text>
      </View>

      {/* 章节导航 */}
      <View className="section-nav">
        <ScrollView scrollX className="nav-scroll">
          {currentSections.map((section) => (
            <View
              key={section.id}
              className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
              onTap={() => scrollToSection(section.id)}
            >
              <Text className="nav-text">{section.title}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 内容区域 */}
      <ScrollView
        className="content-scroll"
        scrollY
        enhanced
        showScrollbar={false}
      >
        <View className="content-container">
          {currentSections.map((section) => (
            <View key={section.id} className="content-section" id={section.id}>
              <Text className="section-title">{section.title}</Text>
              <View className="section-content">
                {section.content.map((paragraph, index) => (
                  <Text key={index} className="paragraph">
                    {paragraph}
                  </Text>
                ))}
              </View>
            </View>
          ))}
          
          {/* 底部联系信息 */}
          <View className="contact-info">
            <Text className="contact-title">联系我们</Text>
            <Text className="contact-text">如有任何疑问，请联系我们：</Text>
            <Text className="contact-text">客服电话：400-888-8888</Text>
            <Text className="contact-text">邮箱：service@aihuishou.com</Text>
            <Text className="contact-text">地址：北京市朝阳区xxx街道xxx号</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}