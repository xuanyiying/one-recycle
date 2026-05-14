import { logger } from '@/utils/logger'
import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.scss'

interface AgreementState {
  agreementType: 'user' | 'privacy'
  error: string | null
}

export default class Agreement extends Component<any, AgreementState> {
  constructor(props: any) {
    super(props)
    this.state = {
      agreementType: 'user',
      error: null
    }
  }

  componentDidMount() {
    try {
      logger.log('Agreement page mounted (Class Component)')
      const instance = Taro.getCurrentInstance()
      const type = instance.router?.params?.type as 'user' | 'privacy'
      
      if (type) {
        this.setState({ agreementType: type })
        Taro.setNavigationBarTitle({
          title: type === 'privacy' ? '隐私政策' : '用户协议'
        })
      }
    } catch (e: any) {
      logger.error('Agreement page mount error:', e)
      this.setState({ error: e.message || 'Unknown error' })
    }
  }

  handleBack = () => {
    Taro.navigateBack()
  }

  render() {
    const { agreementType, error } = this.state

    if (error) {
      return (
        <View className="agreement-container">
          <Text>Error loading agreement: {error}</Text>
          <View className="back-btn" onClick={this.handleBack}>Back</View>
        </View>
      )
    }

    return (
      <View className="agreement-container">
        <View className="agreement-header">
          <View className="back-btn" onClick={this.handleBack}>Back</View>
          <Text>
            {agreementType === 'privacy' ? '隐私政策' : '用户协议'}
          </Text>
        </View>
        <View className="content">
          <Text>
            {agreementType === 'privacy' 
              ? '这里是隐私政策的详细内容...' 
              : '这里是用户协议的详细内容...'}
          </Text>
        </View>
      </View>
    )
  }
}
