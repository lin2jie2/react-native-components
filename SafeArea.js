import { Dimensions } from 'react-native'

// 414x896 iPhone XS, iPhone XR
// 375x812 iPhone X, iPhone XS

export default SafeArea = () => {
	let { width, height } = Dimensions.get('window')

	if (width < height) {
		if (height == 896 || height == 812) {
			return {
				left: 0,
				top: 44,
				right: 0,
				bottom: 34,
				statusBar: 44,
				horizontal: false,
			}
		}
		else {
			return {
				left: 0,
				top: 20,
				right: 0,
				bottom: 0,
				statusBar: 20,
				horizontal: false,
			}
		}
	}
	else {
		if (width == 896 || width == 812) {
			return {
				left: 44,
				top: 0,
				right: 44,
				bottom: 22,
				statusBar: 0,	// 横屏不显示StatusBar
				horizontal: true,
			}
		}
		else {
			return {
				left: 0,
				top: 0,
				right: 0,
				bottom: 0,
				statusBar: 20,
				horizontal: true,
			}
		}
	}
}
