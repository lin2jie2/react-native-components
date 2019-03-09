import React from 'react'
import { View } from 'react-native'

import SafeArea from './SafeArea'

class AppBar extends React.Component {
	state = {
		insets: SafeArea()
	}

	onLayout = () => {
		this.setState({
			insets: SafeArea(),
		})
	}

	render() {
		let { backgroundColor, children } = this.props
		let { insets } = this.state

		const style = {
			paddingTop: insets.top,
			paddingLeft: insets.left,
			paddingRight: insets.right,
			paddingBottom: 0,
			backgroundColor,
		}

		return <View style={style} onLayout={this.onLayout}>
			{ children }
		</View>
	}
}

class Body extends React.Component {
	state = {
		insets: SafeArea()
	}

	onLayout = ({nativeEvent}) => {
		this.setState({
			insets: SafeArea(),
		})
	}

	render() {
		let { children, style } = this.props
		let { insets } = this.state

		const box = {
			flex: 1,
			paddingLeft: insets.left,
			paddingRight: insets.right,
			paddingBottom: insets.bottom,
		}

		return <View style={[box, style || {}]} onLayout={this.onLayout}>
			{ children }
		</View>
	}
}

export default class Scaffold extends React.Component {
	static AppBar = AppBar
	static Body = Body

	render() {
		let { children, backgroundColor } = this.props

		return <View style={{flex: 1, backgroundColor: backgroundColor || 'white'}}>
			{ children }
		</View>
	}
}
