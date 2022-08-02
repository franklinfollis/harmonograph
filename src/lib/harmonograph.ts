export type PendulumConfig = {
	xamplitude: number;
	yamplitude: number;
	xfrequency: number;
	yfrequency: number;
	decay: number;
	phase: number;
};

const toRadians = (deg: number) => deg * (Math.PI / 180.0);

export class Pendulum {
	xamplitude: number;
	yamplitude: number;
	limit: number;
	xfrequency: number;
	yfrequency: number;
	phase: number;
	decay: number;

	constructor(config: PendulumConfig) {
		this.xamplitude = config.xamplitude;
		this.yamplitude = config.yamplitude;
		this.limit = Math.max(Math.abs(config.xamplitude), Math.abs(config.yamplitude));
		this.xfrequency = toRadians(config.xfrequency);
		this.yfrequency = toRadians(config.yfrequency);
		this.phase = toRadians(config.phase);
		this.decay = config.decay;
	}

	calculate(t: number) {
		const x = this.xamplitude * Math.cos(this.xfrequency * t + this.phase);
		const y = this.yamplitude * Math.sin(this.yfrequency * t + this.phase);
		const radius = Math.exp(t * this.decay * -1);
		return { x: x * radius, y: y * radius, r: radius * this.limit };
	}
}

export class Harmonograph {
	pendulumList: Array<Pendulum>;
	constructor(pendulumList: Array<Pendulum>) {
		this.pendulumList = pendulumList;
	}

	calculate(t: number) {
		let sum = { x: 0, y: 0 };
		let radius = 0;
		for (let p of this.pendulumList) {
			let v = p.calculate(t);
			sum.x += v.x;
			sum.y += v.y;
			radius = Math.max(radius, v.r);
		}
		return { x: sum.x, y: sum.y, r: radius };
	}
}
