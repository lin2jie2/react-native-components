import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default class Toast extends React.Component {
	static TOP = 0;
	static CENTER = 1;
	static BOTTOM = 2;

	static SHORT = 1500;
	static LONG = 3000;

	static container = null;

	state = {
		messages: [[], [], []]
	}

	componentDidMount() {
		this.countdown()
	}

	countdown = () => {
		const interval = 16
		this.timer = setInterval(() => {
			this.setState({
				messages: this.state.messages.map(position => position.map(({message, timeout}) => ({message, timeout: timeout - interval})).filter(({timeout}) => timeout > 0)),
			})
		}, interval)
	}

	componentWillUnmount() {
		clearInterval(this.timer)
	}

	static show = (message, position = Toast.BOTTOM, timeout = Toast.SHORT) => {
		if (Toast.container) {
			let { messages } = Toast.container.state
			messages[position].push({message, timeout})
			clearInterval(Toast.container.timer)
			Toast.container.setState({
				messages,
			}, Toast.container.countdown)
		}
	}

	render() {
		let [top, center, bottom] = this.state.messages

		return <View style={styles.toast} pointerEvents="none">
			<View style={styles.top}>
				{top.map((item, index) => this.renderItem(item, index))}
			</View>
			<View style={styles.center}>
				{center.map((item, index) => this.renderItem(item, index))}
			</View>
			<View style={styles.bottom}>
				{bottom.map((item, index) => this.renderItem(item, index))}
			</View>
		</View>
	}

	renderItem = ({message}, index) => {
		return <View style={styles.tip} key={index}>
			<Text style={styles.message}>{ message }</Text>
		</View>
	}
}

const styles = StyleSheet.create({
	toast: {
		position: 'absolute',
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
		zIndex: 999999,
	},
	top: {
		position: 'absolute',
		left: 0,
		top: 44 + 44,
		right: 0,
		justifyContent: 'center',
		alignItems: 'center',
	},
	center: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
	},
	bottom: {
		position: 'absolute',
		left: 0,
		bottom: 34 + 49,
		right: 0,
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: 30,
	},
	tip: {
		backgroundColor: '#333333',
		shadowColor: '#333333',
		shadowOpacity: 0.65,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 0 },
		paddingTop: 8,
		paddingBottom: 8,
		paddingLeft: 16,
		paddingRight: 16,
		marginTop: 8,
		marginBottom: 8,
		marginRight: 16,
		marginLeft: 16,
		borderRadius: 4,
	},
	message: {
		color: 'white',
		fontSize: 14,
	},
})
