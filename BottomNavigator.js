import React from 'react'
import { View, Animated, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native'

import SafeArea from './SafeArea'
import Image from './Image'

/**
<BottomNavigator index={0} onSwitch={(index) => {}} backgroundColor="blue" borderStyle={{}} color="black" activelColor="red">
	<BottomNavigator.Item label="1" icon="icon-1" badge="" renderScreen={(bottomNavigator) => <Text>1</Text>} />
	<BottomNavigator.Item label="2" icon="icon-2" badge="" renderScreen={(bottomNavigator) => <Text>2</Text>} />
	<BottomNavigator.Item label="3" icon="icon-3" badge="" renderScreen={(bottomNavigator) => <Text>3</Text>} />
</BottomNavigator>
 */

class Item extends React.Component {
	render() {
		let { item, active, color, activeColor, horizontal, onPress } = this.props
		let { label, icon, badge } = item

		let buttonStyle = {}
		if (horizontal) {
			buttonStyle.flexDirection = 'row'
		}

		let labelStyle = {
			color: active ? (activeColor || color) : color,
		}
		if (horizontal) {
			labelStyle.fontSize = 16
		}

		return <TouchableOpacity
			style={{flex: 1}}
			activeOpacity={1}
			onPress={onPress}
		>
			<View style={[styles.button, buttonStyle]}>
				{ icon ? <Image source={{uri: icon}} style={styles.icon} /> : null }
				<Text style={[styles.label, labelStyle]}>{ label }</Text>
			</View>
		</TouchableOpacity>
	}
}

export default class BottomNavigator extends React.Component {
	static Item = Item

	constructor(props) {
		super(props)
		this.state = {
			width: Dimensions.get('window').width,
		}
		this.animation = new Animated.Value(props.index * -this.state.width)
	}

	onPress = (idx) => {
		const { onSwitch } = this.props
		if (onSwitch) {
			onSwitch(idx)
		}
	}

	onLayout = ({nativeEvent}) => {
		let { width } = nativeEvent.layout
		this.setState({
			width,
		}, () => {
			let { index } = this.props
			Animated.timing(this.animation, {
				toValue: index * -width,
				duration: 0,
			}).start()
		})
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.index != this.props.index) {
			let { width } = this.state
			Animated.timing(this.animation, {
				toValue: nextProps.index * -width,
				duration: 300,
			}).start()
		}
	}

	render() {
		let { backgroundColor, borderStyle, color, activeColor, index, children } = this.props
		children = !children ? [] : (Array.isArray(children) ? children : [children])

		let { width } = this.state
		let insets = SafeArea()
		let bottomHeight = insets.bottom + (insets.bottom == 22 ? 32 : 44)

		return <View style={styles.container} onLayout={this.onLayout}>
			<View style={styles.screen}>
				<Animated.View style={[
					styles.screens,
					{
						width: width * children.length,
						transform: [{translateX: this.animation}]
					},
				]}>
					{ children.map((item, index) => <View key={index} style={{width, flex: 1}}>
						{ item.props.renderScreen(this) }
					</View>) }
				</Animated.View>
			</View>
			<View style={[
				styles.bottom,
				borderStyle,
				{
					flexDirection: 'row',
					backgroundColor,
					height: bottomHeight,
					paddingBottom: insets.bottom,
				},
			]}>
				{ children.map((item, idx) => <Item
					key={idx}
					horizontal={insets.horizontal}
					color={color}
					activeColor={activeColor}
					active={idx == index}
					item={item.props}
					onPress={() => this.onPress(idx)}
				/>) }
			</View>
		</View>
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f3f5ff',
	},
	screen: {
		flex: 1,
	},
	screens: {
		flex: 1,
		flexDirection: 'row',
		overflow: 'hidden',
	},
	bottom: {
		borderTopWidth: 1,
		borderTopColor: '#eaeaea',
		borderStyle: 'solid',
	},
	button: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	icon: {
		width: 20,
		height: 20,
		margin: 2,
	},
	label: {
		fontSize: 12,
		margin: 2,
	},
})
