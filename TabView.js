import React from 'react'
import { View, Text, TouchableHighlight, Animated, StyleSheet } from 'react-native'

export default class TabView extends React.Component {
	state = {
		translateX: {
			indicator: new Animated.Value(0),
			body: new Animated.Value(0),
		},
		width: 0,
		positionX: 0,
		offsetX: 0,
	}

	componentDidMount() {
		this.swipeTo(this.props.index, false)
	}

	componentWillReceiveProps(props) {
		this.swipeTo(props.index)
	}

	onLayout = (event) => {
		let { width } = event.nativeEvent.layout
		this.setState({ width })

		const { onLayout } = this.props
		if (onLayout) onLayout(event)
	}

	swipeTo = (index, animated = true) => {
		const { routes } = this.props
		let { width, translateX } = this.state

		Animated.timing(translateX.indicator, {
			duration: animated ? 300 : 0,
			toValue: width * index / routes.length,
		}).start()

		Animated.timing(translateX.body, {
			duration: animated ? 300 : 0,
			toValue: -width * index,
		}).start()
	}

	onStartShouldSetResponder = (event) => {
		let { pageX, pageY } = event.nativeEvent
		this.pageX = pageX
		this.pageY = pageY
		this.ignore = false
		return false
	}

	onMoveShouldSetResponder = (event) => {
		if (this.ignore) {
			return false
		}
		let { pageX, pageY } = event.nativeEvent
		let offsetX = Math.abs(pageX - this.pageX)
		let offsetY = Math.abs(pageY - this.pageY)
		if (offsetX >= 4 || offsetY >= 4) {
			this.ignore = true
			if (offsetX > offsetY) {
				return true
			}
		}
		return false
	}

	touchBegin = ({nativeEvent}) => {
		let positionX = nativeEvent.pageX
		this.setState({
			positionX,
			offsetX: 0,
		})
	}

	touchMove = ({nativeEvent}) => {
		const { routes, index } = this.props
		let { width, translateX, positionX } = this.state

		let offsetX = nativeEvent.pageX - positionX
		this.setState({
			offsetX,
		})

		Animated.timing(translateX.indicator, {
			duration: 1,
			toValue: width * index / routes.length - offsetX / routes.length,
		}).start()

		Animated.timing(translateX.body, {
			duration: 1,
			toValue: -width * index + offsetX,
		}).start()
	}

	touchEnd = ({nativeEvent}) => {
		let { routes, index, onSwipe, threshold } = this.props
		let { width, positionX } = this.state

		let offsetX = nativeEvent.pageX - positionX
		this.setState({
			offsetX,
		})

		if (Math.abs(offsetX) > width * (threshold || 0.2)) {
			if (offsetX < 0) {
				if (index + 1 >= routes.length) {
					this.swipeTo(index)
				}
				else {
					this.swipeTo(index + 1)
					onSwipe(index + 1)
				}
			}
			else {
				if (index > 0) {
					this.swipeTo(index - 1)
					onSwipe(index - 1)
				}
				else {
					this.swipeTo(index)
				}
			}
		}
		else {
			this.swipeTo(index)
		}
	}

	touchCancel = ({nativeEvent}) => {
		let { index } = this.props
		this.swipeTo(index)
	}

	render() {
		let { width, translateX, offsetX } = this.state
		const { index, routes, tabBackgroundColor, renderTab, renderActiveTab, renderIndicator, indicatorColor, renderRoute, onSwipe } = this.props

		return <View style={styles.container} onLayout={this.onLayout}>
			<View style={[styles.header, {backgroundColor: tabBackgroundColor}]}>
				{ routes.map((route, idx) => <TouchableHighlight
					key={route.key}
					style={styles.tab}
					underlayColor="#FFFFFF30"
					onPress={() => onSwipe(idx)}
				>
					{ index == idx ? this.renderActiveTab(route.title, index) : this.renderTab(route.title, index) }
				</TouchableHighlight>) }
			</View>
			<View style={{backgroundColor: tabBackgroundColor}}>
				<Animated.View
					style={{
						width: width / routes.length,
						transform: [{translateX: translateX.indicator}],
					}}
				>
					{ renderIndicator ? renderIndicator() : <View style={[styles.indicator, {backgroundColor: indicatorColor}]} /> }
				</Animated.View>
			</View>
			<View
				style={styles.body}
				onStartShouldSetResponder={this.onStartShouldSetResponder}
				onMoveShouldSetResponder={this.onMoveShouldSetResponder}
				onResponderGrant={this.touchBegin}
				onResponderMove={this.touchMove}
				onResponderRelease={this.touchEnd}
				onResponderTerminate={this.touchCancel}
			>
				<Animated.View
					style={{
						flex: 1,
						flexDirection: 'row',
						width: width * routes.length,
						transform: [{translateX: translateX.body}],
					}}
				>
					{ routes.map((route, index) => <View key={route.key} style={[styles.content, {width}]}>
						{ renderRoute ? renderRoute(route, index) : null }
					</View>) }
				</Animated.View>
			</View>
		</View>
	}

	renderActiveTab = (title, index) => {
		const { renderActiveTab } = this.props
		if (renderActiveTab) {
			return renderActiveTab(title, index)
		}
		return this.renderTab(title, index, true)
	}

	renderTab = (title, index, active = false) => {
		const { renderTab, labelColor, activeLabelColor } = this.props
		if (renderTab) {
			return renderTab(title, index)
		}
		return <Text style={[styles.title, {color: active ? (activeLabelColor || labelColor) : labelColor}]}>{ title }</Text>
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
	},
	tab: {
		flex: 1,
	},
	title: {
		height: 48,
		lineHeight: 48,
		textAlign: 'center',
		fontSize: 16,
	},
	indicator: {
		height: 2,
		backgroundColor: 'white',
	},
	body: {
		flex: 1,
		overflow: 'hidden',
	},
	content: {
		alignSelf: 'stretch',
		flex: 1,
	},
})
