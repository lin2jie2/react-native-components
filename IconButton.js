import React from 'react'
import { TouchableHighlight, Text } from 'react-native'

export default ({icon, size, color, onPress}) => {
	color = color || 'black'
	size = size || 48

	let style = {
		width: size,
		height: size,
		borderRadius: size / 2,
		alignItems: 'center',
		justifyContent: 'center',
	}

	return <TouchableHighlight
		style={style}
		underlayColor={'#33333310'}
		onPress={onPress}
	>
		<Text style={{fontSize: size / 2, color}}>{ icon }</Text>
	</TouchableHighlight>
}
