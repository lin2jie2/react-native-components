import React from 'react'
import { View, FlatList, Dimensions } from 'react-native'

export default class GridView extends React.Component {
	state = {
		width: Dimensions.get('window').width
	}

	scrollToOffset = (options) => {
		this.list.scrollToOffset(options)
	}

	onLayout = (event) => {
		let { width } = event.nativeEvent.layout
		this.setState({ width })

		const { onLayout } = this.props
		if (onLayout) {
			onLayout(event)
		}
	}

	render() {
		let { numColumns, gap } = this.props
		let { width } = this.state
		let key = `${numColumns}:${gap}@${width}`

		return <FlatList
			ref={ref => this.list = ref}
			key={key}
			{...this.props}
			renderItem={this.renderItem}
			onLayout={this.onLayout}
		/>
	}

	renderItem = (it) => {
		let { numColumns, gap, renderItem } = this.props
		gap = gap || 0
		const { width } = this.state
		let w = numColumns > 1 ? ((width - gap) / numColumns - gap) : (width - gap * 2)

		let style = {
			marginLeft: it.index % numColumns == 0 ? gap : 0,
			marginTop: gap,
			marginRight: gap,
			marginBottom: 0,
			width: w,
		}

		return <View style={style}>
			{ renderItem(it) }
		</View>
	}
}
