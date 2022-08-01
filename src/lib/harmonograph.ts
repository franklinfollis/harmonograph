export type PendulumConfig = { amplitude: number; frequency: number; decay: number; phase: number };
export type HarmonographConfig = { xAxis: PendulumConfig; yAxis: PendulumConfig };

const toRadians = (deg: number) => deg * (Math.PI / 180.0);

export class Pendulum {
	amplitude: number;
	limit: number;
	frequency: number;
	phase: number;
	decay: number;

	constructor(config: PendulumConfig) {
		this.amplitude = config.amplitude;
		this.limit = Math.abs(config.amplitude);
		this.frequency = toRadians(config.frequency);
		this.phase = toRadians(config.phase);
		this.decay = config.decay;
	}

	calculate(t: number) {
		const x = this.amplitude * Math.sin(this.frequency * t + this.phase);
		const y = this.amplitude * Math.cos(this.frequency * t + this.phase);
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
