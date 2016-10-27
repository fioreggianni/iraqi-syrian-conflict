function getConfig(){
	var config = {
		w: window.innerWidth * 0.95,
		h: window.innerHeight * 0.95,
		title: "Iraqi-Syrian US-coalition airstrikes 2015/2016"
	}
	config.margin = {
		top: 0,
		left: 0,
		right: config.w * 0.2,
		bottom: 0
	}
	config.mapw = config.w 
		- config.margin.left 
		- config.margin.right;
	config.maph = config.mapw * 0.647;
	config.switch = {
		margin: {
			top: config.maph * 0.02,
			right: config.mapw * 0.05
		},
		w: config.mapw * 0.05,
		h: config.maph * 0.02
	};
	config.slider = {
		h: config.maph * 0.05,
		labels: {
			color: "orange"
		},
		margin: {
			top: 0,
			left: config.mapw * 0.05,
			right: config.mapw * 0.05,
			bottom: config.maph * 0.10
		}
	};
	config.slider.w = config.mapw 
		- config.slider.margin.left 
		- config.slider.margin.right;
	config.slider.handler = {
		h: config.slider.h
	}
	config.bars = {
		h: {
			max: config.maph * 0.2,
			min: config.maph * 0.01
		},
		color: "brown",
		opacity: {
			min: 0.2,
			max: 0.7
		},
		text: {
			color: "black"
		},
		tick: {
			color: "orange"
		}
	}
	config.coordinates = {
		lon: { min: 35.0766907, max: 48.3 },
		lat: { min: 30, max: 37.8 }
	}
	config.targets = {
		background: "black",
		color: "orange",
		radius: config.maph*0.04,
		opacity: {
			min: 0.2,
			max: 0.7
		}
	}
	config.explorer = {
		title: {
			default: "Select an item",
			color: "orange",
			size: config.margin.right * 0.08
		},
		strikes: {
			default: "",
			color: "white",
			size: config.margin.right * 0.07
		},
		filters: {
			default: "",
			color: "white",
			size: config.margin.right * 0.05
		},
		margin: {
			top: config.maph * 0.01,
			left: config.margin.right * 0.05
		}
	}
	config.tooltip = {
		color: "orange",
		background: "black",
		padding: config.targets.radius / 8
	}

	return config;
}
