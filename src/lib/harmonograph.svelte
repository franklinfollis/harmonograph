<script lang="ts">
	import { CanvasSpace, Rectangle, Triangle, Pt, Group, Num } from 'pts';
	import { onMount, onDestroy } from 'svelte';
	import { Harmonograph, Pendulum, type HarmonographConfig } from './harmonograph';

	export let play: boolean = true;

	let canvas: HTMLCanvasElement, space: CanvasSpace;
	let initialPlay: boolean = true;

	let config: HarmonographConfig = {
		xAxis: { amplitude: 100, frequency: 1, decay: 0.0002, phase: 0 },
		yAxis: { amplitude: 100, frequency: 2, decay: 0.0002, phase: 90 }
	};

	function makeHarmonograph(config: HarmonographConfig, time: number) {
		return new Harmonograph([
			new Pendulum(config.xAxis),
			new Pendulum(config.yAxis)
			// new Pendulum(220, freq1, angle * 0.0101, halflife),
			// new Pendulum(30, freq2, 10.0 + angle * 0.0101, halflife),
			// new Pendulum(100, freq3, angle * 0.00134, halflife)
		]);
	}

	function PT() {
		space = new CanvasSpace('#hello');
		space.setup({ bgcolor: '#fff' });

		const form = space.getForm();
		let chain = new Group();
		let center = new Pt(space.center);

		const sineWave = (x: number, amplitude: number, freq: number) =>
			amplitude * Math.sin(2 * Math.PI * freq * x) + space.center.y;

		space.add((time, ftime) => {
			if (time) {
				// let x = time / 50;
				// let pt = new Pt(x, sineWave(x, config.a, config.f));
				// chain.push(pt);

				const harm = makeHarmonograph(config, time / 5);
				const v = harm.calculate(time / 5);
				let pt = new Pt(v.x, v.y);
				chain.push(pt.$add(space.center));
				form.strokeOnly('#123', 0.5).line(chain);
			}
		});

		space.play();
	}

	onMount(() => PT());

</script>

<canvas id="hello" />
<div id="controls">
	<div>
		<h3>X Axis</h3>
		<div>
			<label>
				Amplitude
				<input type="range" bind:value={config.xAxis.amplitude} min="0" max="400" />
			</label>
		</div>
		<div>
			<label>
				Frequency
				<input type="range" bind:value={config.xAxis.frequency} min="0" max="10" step="0.5" />
			</label>
		</div>
		<div>
			<label>
				Decay
				<input type="range" bind:value={config.xAxis.decay} min="0" max="0.05" step="0.001" />
			</label>
		</div>
		<div>
			<label>
				Phase
				<input type="range" bind:value={config.xAxis.phase} min="0" max="180" step="1" />
			</label>
		</div>
	</div>
	<div>
		<h3>Y Axis</h3>
		<div>
			<label>
				Amplitude
				<input type="range" bind:value={config.yAxis.amplitude} min="0" max="400" />
			</label>
		</div>
		<div>
			<label>
				Frequency
				<input type="range" bind:value={config.yAxis.frequency} min="0" max="10" step="0.5" />
			</label>
		</div>
		<div>
			<label>
				Decay
				<input type="range" bind:value={config.yAxis.decay} min="0" max="0.05" step="0.001" />
			</label>
		</div>
		<div>
			<label>
				Phase
				<input type="range" bind:value={config.yAxis.phase} min="0" max="180" step="1" />
			</label>
		</div>
	</div>
</div>

<style>
	canvas {
		width: 80vw;
		height: 70vh;
		border: 3px solid red;
	}

	#controls {
		padding: 10px;
		margin: 10px 0px;
		border: 1px solid #cdcdcd;
		border-radius: 5px;
		display: flex;
	}

	#controls > div {
		padding: 15px;
		justify-items: center;
	}
</style>
