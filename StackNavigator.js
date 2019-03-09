import React from 'react'
import { View, Animated, Dimensions } from 'react-native'

import SafeArea from './SafeArea'

export default class StackNavigator extends React.Component {
	state = {
		stack: [],
		top: -1,
	}

	duration = 300
	swipeInOpacity = 0.001
	swipeOutOpacity = 0.601
	swipeEdge = 20
	swipeThreshold = 0.25

	componentWillMount() {
		let { initialPage } = this.props

		this.setState({
			stack: [{
				Page: initialPage,
				props: {},
				translateX: new Animated.Value(0),
				bgColor: new Animated.Value(0),
				currentOpacity: this.swipeOutOpacity,
				targetOpacity: this.swipeOutOpacity,
			}],
			top: 0,
		})
	}

	push = (Page, props) => {
		let { stack, top } = this.state
		props = props || {}

		top += 1

		this.setState({
			stack: stack.concat({
				Page,
				props,
				bgColor: new Animated.Value(0),
				translateX: new Animated.Value(Dimensions.get('window').width),
				currentOpacity: this.swipeInOpacity,
				targetOpacity: this.swipeOutOpacity,
			}),
			top,
		}, () => {
			let { translateX, bgColor, currentOpacity, targetOpacity } = this.state.stack[top]

			Animated.timing(bgColor, {
				toValue: 1,
				duration: this.duration,
			})
			.start()

			Animated
			.timing(translateX, {
				toValue: 0,
				duration: this.duration,
			})
			.start(() => {
				let { stack } = this.state
				stack[top] = {
					Page,
					props,
					translateX,
					bgColor: new Animated.Value(0),
					currentOpacity: targetOpacity,
					targetOpacity: targetOpacity,
				}
				this.setState({
					stack,
				})
			})
		})
	}

	pop = () => {
		let { stack, top } = this.state

		if (top < 1) {
			if (this.props.navigator) {
				this.props.navigator.pop()
			}
			return
		}

		stack[top].targetOpacity = this.swipeInOpacity
		this.setState({
			top: top - 1,
			stack,
		}, () => {
			let { translateX, bgColor, currentOpacity, targetOpacity } = stack[top]
			let timeLeft = this.duration * (currentOpacity - targetOpacity) / (this.swipeOutOpacity - this.swipeInOpacity)

			bgColor.setValue(0)
			Animated.timing(bgColor, {
				toValue: 1,
				duration: timeLeft,
			})
			.start()

			let width = Dimensions.get('window').width
			Animated
			.timing(translateX, {
				toValue: width,
				duration: timeLeft,
			})
			.start(() => {
				stack.splice(top, 1)
				this.setState({
					stack,
				})
			})
		})
	}

	replace = (Page, props) => {
		let { stack, top } = this.state
		props = props || {}

		let { currentOpacity, targetOpacity } = stack[top]
		stack[top] = {
			Page,
			props,
			translateX: new Animated.Value(0),
			bgColor: new Animated.Value(0),
			targetOpacity,
			currentOpacity,
		}
		this.setState({
			stack,
		})
	}

	touchBegin = ({nativeEvent}) => {
		let offsetX = nativeEvent.pageX
		this.setState({
			offsetX,
			current: offsetX,
		})
	}

	touchMove = ({nativeEvent}) => {
		let { offsetX, current, stack, top } = this.state
		let width = Dimensions.get('window').width
		if (offsetX > this.swipeEdge) {
			return
		}

		let position = nativeEvent.pageX - offsetX
		let x = position - offsetX
		let left = x > 0 ? x : 0
		let targetOpacity = this.swipeOutOpacity - left / width * (this.swipeOutOpacity - this.swipeInOpacity)
		stack[top].currentOpacity = stack[top].targetOpacity
		stack[top].targetOpacity = targetOpacity
		this.setState({
			stack
		}, () => {
			let { translateX, bgColor } = stack[top]
			bgColor.setValue(0)
			Animated.timing(bgColor, {
				toValue: 1,
				duration: 1,
			})
			.start()
			Animated.timing(translateX, {
				toValue: left,
				duration: 1,
			})
			.start()
		})
	}

	touchEnd = ({nativeEvent}) => {
		let { offsetX, current, stack, top } = this.state
		let width = Dimensions.get('window').width
		if (offsetX > 20) {
			return
		}

		let position = nativeEvent.pageX
		let x = position - offsetX
		// pop
		if (x > width * this.swipeThreshold) {
			this.pop()
		}
		// rollback
		else {
			let { bgColor, targetOpacity, translateX } = stack[top]

			stack[top].currentOpacity = targetOpacity
			stack[top].targetOpacity = this.swipeOutOpacity
			this.setState({
				stack,
			}, () => {
				bgColor.setValue(0)
				Animated.timing(bgColor, {
					toValue: 1,
					duration: this.duration * Math.abs(x) / width,
				}).start()

				Animated.timing(translateX, {
					toValue: 0,
					duration: this.duration * Math.abs(x) / width,
				})
				.start()
			})
		}
	}

	touchCancel = (nativeEvent) => this.touchEnd(nativeEvent)

	render() {
		const { stack } = this.state

		return <View
			style={{flex: 1}}
		>
			{ stack.map(this.renderPage) }
		</View>
	}

	renderPage = ({Page, props, translateX, bgColor, currentOpacity, targetOpacity}, index) => {
		let style = {
			position: 'absolute',
			zIndex: index + 1,
			left: 0,
			top: 0,
			right: 0,
			bottom: 0,
		}
		let backgroundColor = bgColor.interpolate({
			inputRange: [0, 1],
			outputRange: [`rgba(0, 0, 0, ${currentOpacity})`, `rgba(0, 0, 0, ${targetOpacity})`],
		})

		return <Animated.View
			key={index + 1}
			style={[style, {backgroundColor}]}
		>
			<Animated.View
				onStartShouldSetResponder={this.shouldSetResponder}
				onMoveShouldSetResponder={this.shouldSetResponder}
				onResponderGrant={this.touchBegin}
				onResponderMove={this.touchMove}
				onResponderRelease={this.touchEnd}
				onResponderTerminate={this.touchCancel}
				style={{flex: 1, transform: [{translateX}]}}
			>
				<Page {...props} navigator={this} />
			</Animated.View>
		</Animated.View>
	}

	shouldSetResponder = ({nativeEvent}) => {
		let { top } = this.state
		let { pageX, pageY } = nativeEvent
		let insets = SafeArea()
		if (top > 0 && pageX < this.swipeEdge && (insets.left == 0 || pageX < insets.left) && pageY > insets.top + 44) {
			return true
		}
		else {
			return false
		}
	}
}
