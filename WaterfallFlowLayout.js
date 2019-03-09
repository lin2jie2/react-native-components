import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'

/*
<WaterfallFlowLayout
	ref={ref => this.list = ref}
	numColumns={Number}
	columnGap={Number}
	renderItem={(item, onLayout) => renderItem(item, onLayout) }
	ListFooterComponent={Element}
/>
this.list.clear()
this.list.addItems(List)

call onLayout to layout next item
 */

class Item extends React.Component {
	render() {
		let { item, renderItem, onLayout, columnGap } = this.props

		return <View
			style={{
				flex: 1,
				paddingBottom: columnGap,
			}}
		>
			{ renderItem(item, onLayout) }
		</View>
	}
}

class Column extends React.Component {
	state = {
		data: [],
		height: 0,
	}

	addItem = (item) => {
		let { data } = this.state
		this.setState({ data: data.concat(item) })
	}

	clear = () => {
		this.state.data = []
		this.state.height = 0
		this.setState({
			data: this.state.data,
			height: 0,
		})
	}

	getHeight = () => {
		return this.state.height
	}

	onLayout = ({nativeEvent}) => {
		let { height } = nativeEvent.layout
		this.setState({ height })
	}

	render() {
		let { index, width, columnGap, renderItem, onLayout } = this.props
		let { data } = this.state

		let style = {
			flex: 1,
			paddingTop: columnGap,
			marginRight: columnGap,
		}
		if (index == 0) {
			style.marginLeft = columnGap
		}
		return <View style={style}>
			<View onLayout={this.onLayout}>
				{ data.map((item, index) => <Item
					key={index}
					item={item}
					columnGap={columnGap}
					renderItem={renderItem}
					onLayout={onLayout}
				/>)}
			</View>
		</View>
	}
}

export default class WaterfallFlowLayout extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			data: [],
			count: 0,
			columns: (new Array(props.numColumns)).fill([]),
		}
	}

	addItems = (items) => {
		let { data, count } = this.state
		let ing = data.length > count
		this.setState({
			data: data.concat(items)
		}, () => {
			if (!ing) {
				this.layout()
			}
		})
	}

	clear = () => {
		let { columns } = this.state
		for (let i = 0; i < columns.length; i += 1) {
			let ref = `ref-${i}`
			if (this[ref]) {
				this[ref].clear()
			}
		}

		this.state.data = []
		this.state.count = 0
		this.state.columns = columns.map(a => [])
		this.setState({
			data: this.state.data,
			count: 0,
			columns: this.state.columns,
		})
	}

	scrollTop = () => {
		this.scroll.scrollTo({
			x: 0,
			y: 0,
			animated: true,
		})
	}

	layout = () => {
		let { count, data } = this.state
		if (count < data.length) {
			let index = this.getMinHeightIndex()
			let ref = this[`ref-${index}`]
			ref.addItem(data[count])
			this.setState({
				count: count + 1,
			})
		}
	}

	getMinHeightIndex = () => {
		let height = 99999999
		let index = 0
		let { columns } = this.state
		for (let i = 0; i < columns.length; i += 1) {
			let key = `ref-${i}`
			if (this[key]) {
				let h = this[key].getHeight()
				if (h < height) {
					height = h
					index = i
				}
			}
		}
		return index
	}

	render() {
		let { columnGap, renderItem, ListFooterComponent, onLayout } = this.props
		let { columns, count, data } = this.state

		let style = {
			flex: 1,
			flexDirection: 'row',
		}

		return <ScrollView
			ref={ref => this.scroll = ref}
			onLayout={onLayout}
		>
			<View style={style}>
				{ columns.map((list, index) => <Column
					ref={ref => this[`ref-${index}`] = ref}
					key={index}
					index={index}
					columnGap={columnGap}
					renderItem={renderItem}
					onLayout={this.layout}
				/>) }
			</View>
			{ ListFooterComponent || null }
		</ScrollView>
	}
}
